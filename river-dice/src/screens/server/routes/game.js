const express = require('express');
const router = express.Router();
const { executeQuery, executeTransaction } = require('../config/database');

// ====================================
// River Dice 게임 저장/로드 시스템
// ====================================

// 게임 저장 (정확한 컬럼명 사용)
router.post('/save', async (req, res) => {
  try {
    const { 
      playerId, 
      playerName,
      gameState, 
      playerStats, 
      currentSession,
      currentLayer,
      usingCharacter,
      usingSkill,
      ownSkill
    } = req.body;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: '플레이어 ID가 필요합니다.',
        required: ['playerId']
      });
    }

    console.log(`💾 게임 저장 요청: ${playerId}`);

    // 실제 playerdb 테이블 구조에 맞는 저장
    const saveQuery = `
      INSERT INTO playerdb (
        Player_ID, Using_Character, curr_hp, max_hp, atk, luck,
        WhereSession, WhereStage, EventAtk, EventCurrHp, EventMaxHp,
        Using_Skill, Own_Skill
      ) VALUES (
        '${playerId}', 
        '${usingCharacter || 'Default'}',
        ${playerStats?.hp || 100}, 
        ${playerStats?.maxHp || 100}, 
        ${playerStats?.atk || 10}, 
        ${playerStats?.luck || 0},
        '${currentSession || 'None'}', 
        ${currentLayer || 1},
        ${playerStats?.eventAtk || 0},
        ${playerStats?.eventCurrHp || 0},
        ${playerStats?.eventMaxHp || 0},
        '${JSON.stringify(usingSkill || [])}',
        '${JSON.stringify(ownSkill || [])}'
      )
      ON DUPLICATE KEY UPDATE
        Using_Character = VALUES(Using_Character),
        curr_hp = VALUES(curr_hp),
        max_hp = VALUES(max_hp),
        atk = VALUES(atk),
        luck = VALUES(luck),
        WhereSession = VALUES(WhereSession),
        WhereStage = VALUES(WhereStage),
        EventAtk = VALUES(EventAtk),
        EventCurrHp = VALUES(EventCurrHp),
        EventMaxHp = VALUES(EventMaxHp),
        Using_Skill = VALUES(Using_Skill),
        Own_Skill = VALUES(Own_Skill)
    `;

    console.log('🔍 실행할 저장 쿼리:', saveQuery);

    await executeQuery(saveQuery);

    res.json({
      success: true,
      message: `${playerId}의 게임이 성공적으로 저장되었습니다.`,
      playerId,
      savedAt: new Date().toISOString(),
      savedData: {
        character: usingCharacter || 'Default',
        session: currentSession || 'None',
        stage: currentLayer || 1,
        hp: `${playerStats?.hp || 100}/${playerStats?.maxHp || 100}`,
        atk: playerStats?.atk || 10,
        luck: playerStats?.luck || 0
      }
    });

  } catch (error) {
    console.error('❌ 게임 저장 에러:', error);
    res.status(500).json({
      success: false,
      message: '게임 저장 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 게임 로드 (정확한 컬럼명 사용)
router.get('/load/:playerId', async (req, res) => {
  const { playerId } = req.params;
  
  try {
    console.log(`📂 게임 로드 요청: ${playerId}`);

    const query = `SELECT * FROM playerdb WHERE Player_ID = '${playerId}'`;
    console.log('🔍 실행할 로드 쿼리:', query);

    const playerData = await executeQuery(query);

    if (playerData.length === 0) {
      return res.status(404).json({
        success: false,
        message: '저장된 게임을 찾을 수 없습니다.',
        playerId
      });
    }

    const player = playerData[0];

    // JSON 파싱
    let usingSkill = [];
    let ownSkill = [];

    try {
      usingSkill = JSON.parse(player.Using_Skill || '[]');
    } catch (e) {
      console.warn('⚠️ Using_Skill JSON 파싱 실패');
    }

    try {
      ownSkill = JSON.parse(player.Own_Skill || '[]');
    } catch (e) {
      console.warn('⚠️ Own_Skill JSON 파싱 실패');
    }

    const gameData = {
      player: {
        id: player.Player_ID,
        character: player.Using_Character,
        stats: {
          hp: player.curr_hp,
          maxHp: player.max_hp,
          atk: player.atk,
          luck: player.luck
        },
        eventStats: {
          eventAtk: player.EventAtk,
          eventCurrHp: player.EventCurrHp,
          eventMaxHp: player.EventMaxHp
        },
        progress: {
          currentSession: player.WhereSession,
          currentStage: player.WhereStage
        },
        skills: {
          using: usingSkill,
          owned: ownSkill
        }
      }
    };

    res.json({
      success: true,
      message: `${player.Player_ID}의 게임 데이터 로드 성공`,
      data: gameData
    });

  } catch (error) {
    console.error(`❌ 게임 로드 에러 (${playerId}):`, error);
    res.status(500).json({
      success: false,
      message: '게임 로드 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 게임 존재 여부 확인 (정확한 컬럼명 사용)
router.get('/exists/:playerId', async (req, res) => {
  const { playerId } = req.params;
  
  try {
    console.log(`🔍 게임 존재 확인: ${playerId}`);

    const query = `SELECT * FROM playerdb WHERE Player_ID = '${playerId}'`;
    console.log('🔍 실행할 존재 확인 쿼리:', query);

    const result = await executeQuery(query);

    if (result.length > 0) {
      const player = result[0];
      res.json({
        success: true,
        exists: true,
        data: {
          playerId: player.Player_ID,
          character: player.Using_Character,
          currentSession: player.WhereSession,
          currentStage: player.WhereStage,
          stats: {
            hp: `${player.curr_hp}/${player.max_hp}`,
            atk: player.atk,
            luck: player.luck
          }
        }
      });
    } else {
      res.json({
        success: true,
        exists: false,
        playerId,
        message: '저장된 게임이 없습니다. 새 게임을 시작하세요.'
      });
    }

  } catch (error) {
    console.error(`❌ 게임 존재 확인 에러 (${playerId}):`, error);
    res.status(500).json({
      success: false,
      message: '게임 존재 확인 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 게임 삭제 (정확한 컬럼명 사용)
router.delete('/delete/:playerId', async (req, res) => {
  const { playerId } = req.params;
  
  try {
    console.log(`🗑️ 게임 삭제 요청: ${playerId}`);

    // 플레이어 존재 확인
    const playerCheck = await executeQuery(`
      SELECT Player_ID, Using_Character FROM playerdb WHERE Player_ID = '${playerId}'
    `);

    if (playerCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: '삭제할 게임 데이터를 찾을 수 없습니다.',
        playerId
      });
    }

    const player = playerCheck[0];

    // 게임 데이터 삭제
    await executeQuery(`DELETE FROM playerdb WHERE Player_ID = '${playerId}'`);

    res.json({
      success: true,
      message: `${player.Player_ID} (${player.Using_Character})의 게임 데이터가 삭제되었습니다.`,
      playerId,
      deletedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ 게임 삭제 에러 (${playerId}):`, error);
    res.status(500).json({
      success: false,
      message: '게임 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 모든 저장된 게임 목록
router.get('/list/all', async (req, res) => {
  try {
    console.log('📋 모든 저장된 게임 목록 조회');

    const query = `
      SELECT 
        Player_ID, Using_Character, curr_hp, max_hp, atk, luck,
        WhereSession, WhereStage
      FROM playerdb 
      ORDER BY Player_ID
    `;

    const games = await executeQuery(query);

    res.json({
      success: true,
      message: '저장된 게임 목록 조회 성공',
      count: games.length,
      data: games.map(game => ({
        playerId: game.Player_ID,
        character: game.Using_Character,
        location: `${game.WhereSession} - Stage ${game.WhereStage}`,
        stats: `HP: ${game.curr_hp}/${game.max_hp}, ATK: ${game.atk}, LUCK: ${game.luck}`
      }))
    });

  } catch (error) {
    console.error('❌ 게임 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '게임 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;