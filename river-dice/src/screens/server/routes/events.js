const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// ====================================
// River Dice 이벤트 시스템 (8가지 타입)
// ====================================

// 모든 이벤트 타입 조회
router.get('/', async (req, res) => {
  try {
    console.log('🎪 전체 이벤트 목록 조회 요청');
    const { session, limit = 100 } = req.query;

    const eventTypes = ['normalevent', 'rollevent', 'cardevent', 'artifactevent', 'selectevent', 'trapevent', 'bossevent'];
    const allEvents = {};

    for (const eventType of eventTypes) {
      try {
        let query = `SELECT *, '${eventType}' as event_type FROM ${eventType}`;

        query += ` LIMIT ${parseInt(limit)}`;

        console.log(`🔍 ${eventType} 쿼리:`, query);

        const events = await executeQuery(query);
        allEvents[eventType] = events;
        console.log(`✅ ${eventType}: ${events.length}개`);
      } catch (error) {
        console.log(`⚠️ ${eventType} 테이블 조회 실패:`, error.message);
        allEvents[eventType] = [];
      }
    }

    const totalEvents = Object.values(allEvents).reduce((sum, events) => sum + events.length, 0);

    res.json({
      success: true,
      message: 'River Dice 이벤트 목록 조회 성공',
      totalEvents,
      filters: { session },
      data: allEvents
    });

  } catch (error) {
    console.error('❌ 이벤트 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '이벤트 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 일반 이벤트 조회
router.get('/normal', async (req, res) => {
  try {
    const { session, limit = 20 } = req.query;
    console.log(`🎲 일반 이벤트 조회 요청 (세션: ${session || 'all'})`);

    let query = 'SELECT * FROM normalevent WHERE 1=1';

    if (session) {
      query += ` AND ne_session = '${session}'`;
    }

    query += ` ORDER BY ne_id LIMIT ${parseInt(limit)}`;

    console.log('🔍 실행할 일반 이벤트 쿼리:', query);

    const events = await executeQuery(query);

    console.log('🔍 조회된 일반 이벤트 수:', events.length);

    res.json({
      success: true,
      message: '일반 이벤트 조회 성공',
      session: session || 'all',
      count: events.length,
      data: events
    });

  } catch (error) {
    console.error('❌ 일반 이벤트 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '일반 이벤트 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 랜덤 이벤트 추첨 (게임 로직용) - 수정된 버전
router.get('/random/:eventType', async (req, res) => {
  const { eventType } = req.params;
  
  try {
    const { session = 'none', excludeUsed = false, playerId } = req.query;

    console.log(`🎲 ${eventType} 타입 랜덤 이벤트 추첨 (세션: ${session})`);

    const validEventTypes = ['normal', 'roll', 'card', 'artifact', 'select', 'trap', 'boss'];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 이벤트 타입입니다.',
        validTypes: validEventTypes
      });
    }

    // 테이블명과 세션 컬럼명 정확히 매핑
    const eventMapping = {
      normal: { table: 'normalevent', sessionCol: 'ne_session' },
      roll: { table: 'rollevent', sessionCol: 're_session' },
      card: { table: 'cardevent', sessionCol: 'ce_session' },
      artifact: { table: 'artifactevent', sessionCol: 'ae_session' },
      select: { table: 'selectevent', sessionCol: 'se_session' },
      trap: { table: 'trapevent', sessionCol: 'te_session' },
      boss: { table: 'bossevent', sessionCol: 'be_session' }
    };

    const mapping = eventMapping[eventType];
    if (!mapping) {
      return res.status(400).json({
        success: false,
        message: '이벤트 타입 매핑을 찾을 수 없습니다.'
      });
    }

    let query = `SELECT * FROM ${mapping.table} WHERE ${mapping.sessionCol} = '${session}'`;
    query += ' ORDER BY RAND() LIMIT 1';

    console.log('🔍 실행할 랜덤 이벤트 쿼리:', query);

    const events = await executeQuery(query);

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${session} 세션에서 사용 가능한 ${eventType} 이벤트를 찾을 수 없습니다.`,
        hint: `테이블: ${mapping.table}, 세션 컬럼: ${mapping.sessionCol}`
      });
    }

    const selectedEvent = events[0];

    // 선택 이벤트인 경우 선택지도 함께 조회
    if (eventType === 'select') {
      try {
        const choicesQuery = `SELECT * FROM selectevent_choice WHERE se_id = ${selectedEvent.se_id} ORDER BY sec_opt`;
        const choices = await executeQuery(choicesQuery);
        selectedEvent.choices = choices;
        console.log(`🔍 선택지 ${choices.length}개 추가`);
      } catch (choiceError) {
        console.log('⚠️ 선택지 조회 실패:', choiceError.message);
        selectedEvent.choices = [];
      }
    }

    res.json({
      success: true,
      message: `${eventType} 이벤트 추첨 성공`,
      eventType,
      session,
      table: mapping.table,
      sessionColumn: mapping.sessionCol,
      data: selectedEvent
    });

  } catch (error) {
    console.error(`❌ ${eventType} 랜덤 이벤트 추첨 에러:`, error);
    res.status(500).json({
      success: false,
      message: '랜덤 이벤트 추첨 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 특정 이벤트 타입의 통계
router.get('/stats/:eventType', async (req, res) => {
  const { eventType } = req.params;
  
  try {
    console.log(`📊 ${eventType} 이벤트 통계 조회`);

    const tableMap = {
      normal: 'normalevent',
      roll: 'rollevent',
      card: 'cardevent',
      artifact: 'artifactevent',
      select: 'selectevent',
      trap: 'trapevent',
      boss: 'bossevent'
    };

    const tableName = tableMap[eventType];
    if (!tableName) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 이벤트 타입입니다.',
        validTypes: Object.keys(tableMap)
      });
    }

    const sessionColumn = tableName.substring(0, 2) + '_session';

    const query = `
      SELECT 
        ${sessionColumn} as session,
        COUNT(*) as count
      FROM ${tableName} 
      GROUP BY ${sessionColumn}
      ORDER BY count DESC
    `;

    console.log('🔍 실행할 통계 쿼리:', query);

    const stats = await executeQuery(query);

    if (stats.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${eventType} 이벤트 통계를 찾을 수 없습니다.`
      });
    }

    res.json({
      success: true,
      message: `${eventType} 이벤트 통계 조회 성공`,
      eventType,
      data: {
        bySession: stats,
        totalEvents: stats.reduce((sum, stat) => sum + stat.count, 0)
      }
    });

  } catch (error) {
    console.error(`❌ ${eventType} 이벤트 통계 조회 에러:`, error);
    res.status(500).json({
      success: false,
      message: '이벤트 통계 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 세션별 이벤트 조회
router.get('/session/:sessionType', async (req, res) => {
  const { sessionType } = req.params;
  
  try {
    const { eventType, limit = 20 } = req.query;

    console.log(`🎪 ${sessionType} 세션 이벤트 조회 요청`);

    if (eventType) {
      // 특정 이벤트 타입만 조회
      const tableMap = {
        normal: 'normalevent',
        roll: 'rollevent',
        card: 'cardevent',
        artifact: 'artifactevent',
        select: 'selectevent',
        trap: 'trapevent',
        boss: 'bossevent'
      };

      const tableName = tableMap[eventType];
      if (!tableName) {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 이벤트 타입입니다.'
        });
      }

      const sessionColumn = tableName.substring(0, 2) + '_session';
      const query = `SELECT * FROM ${tableName} WHERE ${sessionColumn} = '${sessionType}' LIMIT ${parseInt(limit)}`;
      
      const events = await executeQuery(query);

      res.json({
        success: true,
        message: `${sessionType} 세션 ${eventType} 이벤트 조회 성공`,
        sessionType,
        eventType,
        count: events.length,
        data: events
      });

    } else {
      // 모든 이벤트 타입에서 해당 세션 조회
      const eventTypes = ['normalevent', 'rollevent', 'cardevent', 'artifactevent', 'selectevent', 'trapevent', 'bossevent'];
      const sessionEvents = {};

      for (const type of eventTypes) {
        try {
          const sessionColumn = type.substring(0, 2) + '_session';
          const query = `SELECT * FROM ${type} WHERE ${sessionColumn} = '${sessionType}' LIMIT ${parseInt(limit)}`;
          
          const events = await executeQuery(query);
          sessionEvents[type] = events;
        } catch (error) {
          console.log(`⚠️ ${type} 테이블에서 ${sessionType} 세션 조회 실패:`, error.message);
          sessionEvents[type] = [];
        }
      }

      const totalEvents = Object.values(sessionEvents).reduce((sum, events) => sum + events.length, 0);

      res.json({
        success: true,
        message: `${sessionType} 세션 전체 이벤트 조회 성공`,
        sessionType,
        totalEvents,
        data: sessionEvents
      });
    }

  } catch (error) {
    console.error(`❌ ${sessionType} 세션 이벤트 조회 에러:`, error);
    res.status(500).json({
      success: false,
      message: '세션별 이벤트 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;