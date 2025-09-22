const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// ====================================
// River Dice 플레이어 관리 시스템
// ====================================

// 임시 디버깅: playerdb 테이블 구조 확인
router.get('/debug/table-structure', async (req, res) => {
  try {
    console.log('🔍 playerdb 테이블 구조 확인 중...');
    
    const columns = await executeQuery('DESCRIBE playerdb');
    
    res.json({
      success: true,
      message: 'playerdb 테이블 구조 정보',
      data: {
        columns: columns,
        columnNames: columns.map(col => col.Field),
        totalColumns: columns.length
      }
    });

  } catch (error) {
    console.error('❌ 테이블 구조 확인 에러:', error);
    res.status(500).json({
      success: false,
      message: '테이블 구조 확인 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 임시 디버깅: playerdb 테이블 샘플 데이터 확인
router.get('/debug/sample-data', async (req, res) => {
  try {
    console.log('🔍 playerdb 테이블 샘플 데이터 확인 중...');
    
    const sampleData = await executeQuery('SELECT * FROM playerdb LIMIT 3');
    
    res.json({
      success: true,
      message: 'playerdb 테이블 샘플 데이터',
      data: {
        sampleRows: sampleData,
        count: sampleData.length,
        firstRowKeys: sampleData.length > 0 ? Object.keys(sampleData[0]) : []
      }
    });

  } catch (error) {
    console.error('❌ 샘플 데이터 확인 에러:', error);
    res.status(500).json({
      success: false,
      message: '샘플 데이터 확인 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 모든 플레이어 목록 조회 (안전 버전 - ORDER BY 제거)
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    console.log('👥 플레이어 목록 조회 요청');

    // ORDER BY 없이 안전하게 조회
    let query = `SELECT * FROM playerdb LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    console.log('🔍 실행할 플레이어 쿼리:', query);

    const players = await executeQuery(query);

    // 전체 플레이어 수 조회
    const totalCount = await executeQuery('SELECT COUNT(*) as count FROM playerdb');

    // 첫 번째 플레이어의 컬럼명들 확인
    const availableColumns = players.length > 0 ? Object.keys(players[0]) : [];

    res.json({
      success: true,
      message: 'River Dice 플레이어 목록 조회 성공',
      data: {
        players,
        pagination: {
          total: totalCount[0].count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + players.length < totalCount[0].count
        },
        tableInfo: {
          availableColumns,
          totalColumns: availableColumns.length,
          sampleData: players.length > 0 ? players[0] : null
        }
      }
    });

  } catch (error) {
    console.error('❌ 플레이어 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '플레이어 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 특정 플레이어 상세 조회 (ID 기반)
router.get('/:playerId', async (req, res) => {
  const { playerId } = req.params;
  
  try {
    console.log(`👤 플레이어 ${playerId} 상세 조회 요청`);

    // 일단 모든 컬럼으로 조회 (실제 ID 컬럼명을 모르므로)
    const query = `SELECT * FROM playerdb WHERE id = '${playerId}' OR player_id = '${playerId}' OR PlayerID = '${playerId}'`;
    
    console.log('🔍 실행할 플레이어 상세 쿼리:', query);

    const playerData = await executeQuery(query);

    if (playerData.length === 0) {
      return res.status(404).json({
        success: false,
        message: '플레이어를 찾을 수 없습니다.',
        playerId,
        hint: '플레이어 ID를 확인하거나 /api/players/debug/sample-data로 실제 데이터를 확인해보세요.'
      });
    }

    const player = playerData[0];

    res.json({
      success: true,
      message: '플레이어 상세 정보 조회 성공',
      data: {
        player: player,
        availableFields: Object.keys(player)
      }
    });

  } catch (error) {
    console.error(`❌ 플레이어 ${playerId} 조회 에러:`, error);
    res.status(500).json({
      success: false,
      message: '플레이어 상세 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 플레이어 랭킹 조회 (안전 버전)
router.get('/ranking/:type', async (req, res) => {
  const { type } = req.params;
  
  try {
    const { limit = 20 } = req.query;

    console.log(`🏆 ${type} 랭킹 조회 요청`);

    let query = '';
    let orderBy = '';
    let rankingName = '';

    // 우선 기본적인 랭킹부터 시도
    switch (type.toLowerCase()) {
      case 'level':
        query = 'SELECT * FROM playerdb';
        orderBy = 'Level DESC';
        rankingName = '레벨 랭킹';
        break;
      case 'gold':
        query = 'SELECT * FROM playerdb';
        orderBy = 'Gold DESC';
        rankingName = '골드 랭킹';
        break;
      case 'recent':
        query = 'SELECT * FROM playerdb';
        orderBy = 'DateTime DESC';
        rankingName = '최근 활동 랭킹';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 랭킹 타입입니다.',
          validTypes: ['level', 'gold', 'recent']
        });
    }

    const finalQuery = `${query} ORDER BY ${orderBy} LIMIT ${parseInt(limit)}`;
    console.log('🔍 실행할 랭킹 쿼리:', finalQuery);

    const rankings = await executeQuery(finalQuery);

    // 랭킹에 순위 번호 추가
    const rankedPlayers = rankings.map((player, index) => ({
      rank: index + 1,
      ...player,
      isTopPlayer: index < 3 // 상위 3명 표시
    }));

    res.json({
      success: true,
      message: `${rankingName} 조회 성공`,
      rankingType: type,
      data: {
        rankingName,
        players: rankedPlayers,
        totalShown: rankedPlayers.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`❌ ${type} 랭킹 조회 에러:`, error);
    res.status(500).json({
      success: false,
      message: '랭킹 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 플레이어 검색 (안전 버전)
router.get('/search/:keyword', async (req, res) => {
  const { keyword } = req.params;
  
  try {
    const { limit = 20 } = req.query;

    if (keyword.length < 2) {
      return res.status(400).json({
        success: false,
        message: '검색어는 최소 2글자 이상이어야 합니다.'
      });
    }

    console.log(`🔍 플레이어 검색: "${keyword}"`);

    // 여러 가능한 이름 컬럼으로 검색
    const query = `
      SELECT * FROM playerdb 
      WHERE PlayerName LIKE '%${keyword}%' 
         OR player_name LIKE '%${keyword}%'
         OR name LIKE '%${keyword}%'
      ORDER BY DateTime DESC
      LIMIT ${parseInt(limit)}
    `;

    console.log('🔍 실행할 검색 쿼리:', query);

    const searchResults = await executeQuery(query);

    res.json({
      success: true,
      message: `"${keyword}" 검색 결과`,
      data: {
        keyword,
        results: searchResults,
        count: searchResults.length,
        searchedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`❌ 플레이어 검색 에러 (${keyword}):`, error);
    res.status(500).json({
      success: false,
      message: '플레이어 검색 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;