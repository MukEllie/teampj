const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// ====================================
// River Dice 스킬 시스템 (전직업)
// ====================================

// 임시 디버깅: skills 테이블 구조 확인
router.get('/debug/table-structure', async (req, res) => {
  try {
    console.log('🔍 skills 테이블 구조 확인 중...');
    
    const columns = await executeQuery('DESCRIBE skills');
    
    res.json({
      success: true,
      message: 'skills 테이블 구조 정보',
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

// 임시 디버깅: skills 테이블 샘플 데이터 확인
router.get('/debug/sample-data', async (req, res) => {
  try {
    console.log('🔍 skills 테이블 샘플 데이터 확인 중...');
    
    const sampleData = await executeQuery('SELECT * FROM skills LIMIT 3');
    
    res.json({
      success: true,
      message: 'skills 테이블 샘플 데이터',
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

// 모든 스킬 조회
router.get('/', async (req, res) => {
  try {
    console.log('🎯 전체 스킬 목록 조회 요청');
    const { job, rarity, element, type, limit = 100 } = req.query;

    let query = 'SELECT * FROM skills WHERE 1=1';

    if (job) {
      query += ` AND skill_Job = '${job}'`;
    }

    if (rarity) {
      query += ` AND rarity = '${rarity}'`;
    }

    if (element) {
      query += ` AND element = '${element}'`;
    }

    if (type) {
      query += ` AND skill_Type = '${type}'`;
    }

    // ORDER BY에서 ID 제거
    query += ` ORDER BY rarity DESC LIMIT ${parseInt(limit)}`;

    console.log('🔍 실행할 스킬 쿼리:', query);

    const skills = await executeQuery(query);

    res.json({
      success: true,
      message: 'River Dice 스킬 목록 조회 성공',
      count: skills.length,
      filters: { job, rarity, element, type },
      data: skills
    });

  } catch (error) {
    console.error('❌ 스킬 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '스킬 목록 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 직업별 스킬 조회 (Warrior/Thief/Mage/Common) - ID 제거 버전
router.get('/job/:jobType', async (req, res) => {
  const { jobType } = req.params;
  
  try {
    const { rarity, element, limit = 50 } = req.query;

    console.log(`⚔️ ${jobType} 직업 스킬 조회 요청`);

    let query = `SELECT * FROM skills WHERE skill_Job = '${jobType}'`;

    if (rarity) {
      query += ` AND rarity = '${rarity}'`;
    }

    if (element) {
      query += ` AND element = '${element}'`;
    }

    // ORDER BY에서 ID 제거, rarity만 사용
    query += ` ORDER BY rarity DESC LIMIT ${parseInt(limit)}`;

    console.log('🔍 실행할 스킬 쿼리:', query);

    const skills = await executeQuery(query);

    console.log('🔍 조회된 스킬 수:', skills.length);

    if (skills.length === 0) {
      return res.status(404).json({
        success: false,
        message: `${jobType} 직업의 스킬을 찾을 수 없습니다.`,
        jobType,
        availableJobs: ['Common', 'Warrior', 'Thief', 'Mage'],
        hint: '데이터베이스에서 skill_Job 컬럼 값을 확인해주세요.'
      });
    }

    // 레어도별로 그룹화
    const groupedSkills = skills.reduce((acc, skill) => {
      const skillRarity = skill.rarity || 'Unknown';
      if (!acc[skillRarity]) {
        acc[skillRarity] = [];
      }
      acc[skillRarity].push(skill);
      return acc;
    }, {});

    res.json({
      success: true,
      message: `${jobType} 직업 스킬 조회 성공`,
      jobType,
      count: skills.length,
      groupedByRarity: groupedSkills,
      data: skills
    });

  } catch (error) {
    console.error(`❌ ${jobType} 직업 스킬 조회 에러:`, error);
    res.status(500).json({
      success: false,
      message: `${jobType} 직업 스킬 조회 중 오류가 발생했습니다.`,
      error: error.message
    });
  }
});

// 랜덤 스킬 뽑기 (보상 시스템용)
router.get('/random/draw', async (req, res) => {
  try {
    const { job = 'Common', count = 3, rarity } = req.query;

    console.log(`🎲 ${job} 직업 스킬 ${count}개 랜덤 뽑기 요청`);

    let query = `SELECT * FROM skills WHERE skill_Job IN ('${job}', 'Common')`;

    if (rarity) {
      query += ` AND rarity = '${rarity}'`;
    }

    query += ` ORDER BY RAND() LIMIT ${parseInt(count)}`;

    console.log('🔍 실행할 랜덤 스킬 쿼리:', query);

    const skills = await executeQuery(query);

    // 각 스킬에 뽑기 정보 추가
    const drawnSkills = skills.map(skill => ({
      ...skill,
      drawInfo: {
        isNew: Math.random() < 0.7, // 70% 확률로 새 스킬
        canUpgrade: skill.rarity !== 'Test',
        recommendedFor: skill.skill_Job === job ? '추천' : '범용'
      }
    }));

    res.json({
      success: true,
      message: `스킬 뽑기 성공 (${job} 직업용)`,
      drawType: job,
      count: drawnSkills.length,
      rarity: rarity || 'Mixed',
      data: drawnSkills
    });

  } catch (error) {
    console.error('❌ 랜덤 스킬 뽑기 에러:', error);
    res.status(500).json({
      success: false,
      message: '랜덤 스킬 뽑기 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router;