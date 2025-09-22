const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// ====================================
// River Dice 몬스터 시스템 (51종)
// ====================================

// 모든 몬스터 조회
router.get('/', async (req, res) => {
  try {
    console.log('👹 전체 몬스터 목록 조회 요청');
    const { session, type, element, limit = 100 } = req.query;

    let query = 'SELECT * FROM monsterdb WHERE 1=1';

    if (session) {
      query += ` AND Session = '${session}'`;
    }

    if (type) {
      query += ` AND Type = '${type}'`;
    }

    if (element) {
      query += ` AND Element = '${element}'`;
    }

    query += ` ORDER BY Type DESC, MonsterID ASC LIMIT ${parseInt(limit)}`;

    const monsters = await executeQuery(query);

    res.json({
      success: true,
      message: 'River Dice 몬스터 목록 조회 성공',
      count: monsters.length,
      filters: { session, type, element },
      data: monsters
    });

  } catch (error) {
    console.error('❌ 몬스터 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '몬스터 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 세션별 몬스터 조회 (Fire/Water/Grass) - 수정된 버전
router.get('/session/:sessionType', async (req, res) => {
  const { sessionType } = req.params;
  
  try {
    const { type } = req.query;

    console.log(`🔥 ${sessionType} 세션 몬스터 조회 요청`);

    // 직접 문자열 삽입 방식으로 변경 (파라미터 바인딩 문제 해결)
    let query = `SELECT * FROM monsterdb WHERE Session = '${sessionType}'`;

    if (type) {
      query += ` AND Type = '${type}'`;
    }

    query += ' ORDER BY Type DESC, MonsterID ASC';

    console.log('🔍 실행할 쿼리:', query);

    const monsters = await executeQuery(query);

    console.log('🔍 조회된 몬스터 수:', monsters.length);

    if (monsters.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${sessionType} 세션에서 몬스터를 찾을 수 없습니다.`,
        sessionType,
        availableSessions: ['Fire', 'Water', 'Grass', 'None'],
        hint: '데이터베이스에서 Session 컬럼 값을 확인해주세요.'
      });
    }

    // 타입별로 그룹화
    const groupedMonsters = monsters.reduce((acc, monster) => {
      const monsterType = monster.Type || 'Unknown';
      if (!acc[monsterType]) {
        acc[monsterType] = [];
      }
      acc[monsterType].push(monster);
      return acc;
    }, {});

    res.json({
      success: true,
      message: `${sessionType} 세션 몬스터 조회 성공`,
      sessionType,
      count: monsters.length,
      groupedByType: groupedMonsters,
      data: monsters
    });

  } catch (error) {
    console.error(`❌ ${sessionType} 세션 몬스터 조회 에러:`, error);
    res.status(500).json({
      success: false,
      message: `${sessionType} 세션 몬스터 조회 중 오류가 발생했습니다.`,
      error: error.message,
      sessionType
    });
  }
});

// 랜덤 몬스터 생성 (게임 로직용)
router.get('/random/:sessionType', async (req, res) => {
  const { sessionType } = req.params;
  
  try {
    const { type = 'Common', count = 1 } = req.query;

    console.log(`🎲 ${sessionType} 세션에서 ${type} 몬스터 ${count}마리 랜덤 생성 요청`);

    const query = `
      SELECT * FROM monsterdb 
      WHERE Session = '${sessionType}' AND Type = '${type}' 
      ORDER BY RAND() 
      LIMIT ${parseInt(count)}
    `;

    const monsters = await executeQuery(query);

    if (monsters.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${sessionType} 세션에서 ${type} 타입 몬스터를 찾을 수 없습니다.`,
        sessionType,
        monsterType: type
      });
    }

    // 각 몬스터의 실제 능력치 랜덤 생성
    const generatedMonsters = monsters.map(monster => {
      const actualHp = Math.floor(Math.random() * (monster.max_hp - monster.min_hp + 1)) + monster.min_hp;
      const actualAtk = Math.floor(Math.random() * (monster.max_atk - monster.min_atk + 1)) + monster.min_atk;

      return {
        ...monster,
        actualStats: {
          hp: actualHp,
          maxHp: actualHp,
          atk: actualAtk,
          luck: monster.luck || 0
        },
        battleReady: true
      };
    });

    res.json({
      success: true,
      message: `랜덤 몬스터 생성 성공 (${sessionType} - ${type})`,
      sessionType,
      monsterType: type,
      count: generatedMonsters.length,
      data: generatedMonsters
    });

  } catch (error) {
    console.error(`❌ 랜덤 몬스터 생성 에러 (${sessionType}):`, error);
    res.status(500).json({
      success: false,
      message: '랜덤 몬스터 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 특정 몬스터 상세 조회
router.get('/:monsterId', async (req, res) => {
  const { monsterId } = req.params;
  
  try {
    console.log(`👹 몬스터 ID ${monsterId} 상세 조회 요청`);

    const query = `SELECT * FROM monsterdb WHERE MonsterID = ${parseInt(monsterId)}`;
    const monsters = await executeQuery(query);

    if (monsters.length === 0) {
      return res.status(404).json({
        success: false,
        message: '해당 몬스터를 찾을 수 없습니다.',
        monsterId
      });
    }

    const monster = monsters[0];

    // 몬스터 능력치 계산
    const avgHp = Math.round((monster.min_hp + monster.max_hp) / 2);
    const avgAtk = Math.round((monster.min_atk + monster.max_atk) / 2);

    const monsterInfo = {
      ...monster,
      stats: {
        avgHp,
        avgAtk,
        hpRange: `${monster.min_hp}~${monster.max_hp}`,
        atkRange: `${monster.min_atk}~${monster.max_atk}`,
        luck: monster.luck || 0
      },
      hasSpecial: !!monster.Special,
      specialAbility: monster.Special || null
    };

    res.json({
      success: true,
      message: '몬스터 상세 정보 조회 성공',
      data: monsterInfo
    });

  } catch (error) {
    console.error(`❌ 몬스터 ${monsterId} 조회 에러:`, error);
    res.status(500).json({
      success: false,
      message: '몬스터 상세 정보 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 세션별 몬스터 통계
router.get('/stats/:sessionType', async (req, res) => {
  const { sessionType } = req.params;
  
  try {
    console.log(`📊 ${sessionType} 세션 몬스터 통계 조회`);

    const query = `
      SELECT 
        Type,
        COUNT(*) as count,
        AVG((min_hp + max_hp) / 2) as avgHp,
        AVG((min_atk + max_atk) / 2) as avgAtk
      FROM monsterdb 
      WHERE Session = '${sessionType}'
      GROUP BY Type
      ORDER BY count DESC
    `;

    const stats = await executeQuery(query);

    if (stats.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${sessionType} 세션의 몬스터 통계를 찾을 수 없습니다.`
      });
    }

    res.json({
      success: true,
      message: `${sessionType} 세션 몬스터 통계 조회 성공`,
      sessionType,
      data: stats
    });

  } catch (error) {
    console.error(`❌ ${sessionType} 몬스터 통계 조회 에러:`, error);
    res.status(500).json({
      success: false,
      message: '몬스터 통계 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;