const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// ====================================
// River Dice 아티팩트 시스템 (26종)
// ====================================

// 모든 아티팩트 조회
router.get('/', async (req, res) => {
  try {
    console.log('🎁 전체 아티팩트 목록 조회 요청');
    const { job, session, limit = 100 } = req.query;

    let query = 'SELECT * FROM artifactdb WHERE 1=1';

    if (job) {
      query += ` AND Job = '${job}'`;
    }

    if (session) {
      query += ` AND Session = '${session}'`;
    }

    query += ` ORDER BY Session DESC, Job LIMIT ${parseInt(limit)}`;

    console.log('🔍 실행할 아티팩트 쿼리:', query);

    const artifacts = await executeQuery(query);

    res.json({
      success: true,
      message: 'River Dice 아티팩트 목록 조회 성공',
      count: artifacts.length,
      filters: { job, session },
      data: artifacts
    });

  } catch (error) {
    console.error('❌ 아티팩트 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '아티팩트 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 직업별 아티팩트 조회
router.get('/job/:jobType', async (req, res) => {
  const { jobType } = req.params;
  
  try {
    const { session, limit = 50 } = req.query;

    console.log(`⚔️ ${jobType} 직업 아티팩트 조회 요청`);

    let query = `SELECT * FROM artifactdb WHERE Job IN ('${jobType}', 'Common')`;

    if (session) {
      query += ` AND Session = '${session}'`;
    }

    query += ` ORDER BY Session DESC, Job LIMIT ${parseInt(limit)}`;

    console.log('🔍 실행할 아티팩트 쿼리:', query);

    const artifacts = await executeQuery(query);

    console.log('🔍 조회된 아티팩트 수:', artifacts.length);

    if (artifacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${jobType} 직업의 아티팩트를 찾을 수 없습니다.`,
        jobType,
        availableJobs: ['Common', 'Warrior', 'Thief', 'Mage'],
        hint: '데이터베이스에서 Job 컬럼 값을 확인해주세요.'
      });
    }

    // 세션별로 그룹화
    const groupedArtifacts = artifacts.reduce((acc, artifact) => {
      const artifactSession = artifact.Session || 'Unknown';
      if (!acc[artifactSession]) {
        acc[artifactSession] = [];
      }
      acc[artifactSession].push(artifact);
      return acc;
    }, {});

    res.json({
      success: true,
      message: `${jobType} 직업 아티팩트 조회 성공`,
      jobType,
      count: artifacts.length,
      groupedBySession: groupedArtifacts,
      data: artifacts
    });

  } catch (error) {
    console.error(`❌ ${jobType} 직업 아티팩트 조회 에러:`, error);
    res.status(500).json({
      success: false,
      message: `${jobType} 직업 아티팩트 조회 중 오류가 발생했습니다.`,
      error: error.message
    });
  }
});

// 랜덤 아티팩트 획득 (보상 시스템용)
router.get('/random/acquire', async (req, res) => {
  try {
    const { job = 'Common', session = 'None', count = 1, excludeUnique = true } = req.query;

    console.log(`🎲 ${job} 직업용 아티팩트 ${count}개 랜덤 획득 요청`);

    let query = `SELECT * FROM artifactdb WHERE Job IN ('${job}', 'Common')`;

    if (session && session !== 'Any') {
      query += ` AND Session = '${session}'`;
    }

    if (excludeUnique === 'true') {
      query += ` AND Session != 'Unique'`;
    }

    query += ` ORDER BY RAND() LIMIT ${parseInt(count)}`;

    console.log('🔍 실행할 랜덤 아티팩트 쿼리:', query);

    const artifacts = await executeQuery(query);

    // 각 아티팩트에 획득 정보 추가
    const acquiredArtifacts = artifacts.map(artifact => ({
      ...artifact,
      acquisitionInfo: {
        isNew: Math.random() < 0.8, // 80% 확률로 새 아티팩트
        rarity: artifact.Session === 'Event' ? 'Rare' : 
               artifact.Session === 'Unique' ? 'Unique' : 'Common',
        recommendedFor: artifact.Job === job ? '추천' : '범용',
        canStack: false // 아티팩트는 중복 불가
      }
    }));

    res.json({
      success: true,
      message: `아티팩트 획득 성공 (${job} 직업용)`,
      targetJob: job,
      session: session,
      count: acquiredArtifacts.length,
      data: acquiredArtifacts
    });

  } catch (error) {
    console.error('❌ 랜덤 아티팩트 획득 에러:', error);
    res.status(500).json({
      success: false,
      message: '랜덤 아티팩트 획득 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 특정 아티팩트 상세 조회
router.get('/:artifactId', async (req, res) => {
  const { artifactId } = req.params;
  
  try {
    console.log(`🎁 아티팩트 ID ${artifactId} 상세 조회 요청`);

    const query = `SELECT * FROM artifactdb WHERE ID = ${parseInt(artifactId)}`;
    const artifacts = await executeQuery(query);

    if (artifacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '해당 아티팩트를 찾을 수 없습니다.',
        artifactId
      });
    }

    const artifact = artifacts[0];

    // 아티팩트 정보 보강
    const artifactInfo = {
      ...artifact,
      effectInfo: {
        description: artifact.Effect || '효과 없음',
        isPassive: true,
        isPermanent: artifact.Session !== 'Event'
      },
      compatibility: {
        recommendedJob: artifact.Job,
        isUniversal: artifact.Job === 'Common',
        sessionRestricted: artifact.Session !== 'None'
      }
    };

    res.json({
      success: true,
      message: '아티팩트 상세 정보 조회 성공',
      data: artifactInfo
    });

  } catch (error) {
    console.error(`❌ 아티팩트 ${artifactId} 조회 에러:`, error);
    res.status(500).json({
      success: false,
      message: '아티팩트 상세 정보 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 아티팩트 통계 조회
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('📊 아티팩트 통계 조회');

    const query = `
      SELECT 
        Job,
        Session,
        COUNT(*) as count
      FROM artifactdb 
      GROUP BY Job, Session
      ORDER BY Job, Session
    `;

    const stats = await executeQuery(query);

    if (stats.length === 0) {
      return res.status(404).json({
        success: false,
        message: '아티팩트 통계를 찾을 수 없습니다.'
      });
    }

    // 직업별, 세션별로 그룹화
    const jobStats = stats.reduce((acc, stat) => {
      if (!acc[stat.Job]) {
        acc[stat.Job] = {};
      }
      acc[stat.Job][stat.Session] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      message: '아티팩트 통계 조회 성공',
      data: {
        byJobAndSession: jobStats,
        totalEntries: stats.reduce((sum, stat) => sum + stat.count, 0),
        rawData: stats
      }
    });

  } catch (error) {
    console.error('❌ 아티팩트 통계 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '아티팩트 통계 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;