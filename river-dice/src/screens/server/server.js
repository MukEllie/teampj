const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { pool, testConnection, executeQuery } = require('./config/database');

const app = express();
const PORT = process.env.SERVER_PORT || 3002;

// ====================================
// 미들웨어 설정
// ====================================

// 보안 미들웨어
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS 설정 (React 게임과 통신)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 1000, // 개발용으로 높게 설정
  message: {
    success: false,
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 요청 로깅
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toLocaleString('ko-KR')}`);
  next();
});

// ====================================
// 라우트 연결
// ====================================

// 게임 관련 라우트
const gameRoutes = require('./routes/game');
const playersRoutes = require('./routes/players');
const cardsRoutes = require('./routes/cards');
const monstersRoutes = require('./routes/monsters');
const skillsRoutes = require('./routes/skills');
const artifactsRoutes = require('./routes/artifacts');
const eventsRoutes = require('./routes/events');

app.use('/api/game', gameRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/monsters', monstersRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/artifacts', artifactsRoutes);
app.use('/api/events', eventsRoutes);

// ====================================
// 기본 API 엔드포인트
// ====================================

// 루트 경로
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎮 River Dice Game Backend Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'testgame',
    features: [
      '게임 저장/로드 시스템',
      '플레이어 관리 및 랭킹',
      '카드 덱 시스템',
      '몬스터 데이터베이스 (51종)',
      '스킬 시스템 (전직업)',
      '아티팩트 시스템 (26종)',
      '이벤트 시스템 (8가지 타입)'
    ]
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'River Dice Game Backend Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    database: 'testgame',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  });
});

// 데이터베이스 연결 테스트
app.get('/api/test/database', async (req, res) => {
  try {
    console.log('🔍 데이터베이스 연결 테스트 시작...');
    const isConnected = await testConnection();
    
    if (isConnected) {
      const tables = await executeQuery('SHOW TABLES');
      const tableNames = tables.map(t => Object.values(t)[0]);
      
      // 핵심 테이블 존재 확인
      const coreTable = ['PlayerDB', 'UserDB', 'MonsterDB', 'SkillDB', 'ArtifactDB'];
      const missingTables = coreTable.filter(table => !tableNames.includes(table));
      
      res.json({
        success: true,
        message: 'MySQL testgame 데이터베이스 연결 성공! ✅',
        database: 'testgame',
        totalTables: tableNames.length,
        tables: tableNames,
        coreTablesStatus: {
          all_present: missingTables.length === 0,
          missing: missingTables,
          available: coreTable.filter(table => tableNames.includes(table))
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: '데이터베이스 연결 실패 ❌',
        database: 'testgame'
      });
    }
  } catch (error) {
    console.error('데이터베이스 테스트 에러:', error);
    res.status(500).json({
      success: false,
      message: '데이터베이스 테스트 중 오류 발생',
      error: error.message
    });
  }
});

// ====================================
// 에러 핸들링
// ====================================

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'River Dice API 엔드포인트를 찾을 수 없습니다.',
    requested: req.originalUrl,
    server: 'River Dice Game Backend v1.0.0'
  });
});

// 전역 에러 핸들러
app.use((error, req, res, next) => {
  console.error('💥 River Dice 서버 에러:', error);
  res.status(500).json({
    success: false,
    message: 'River Dice 서버 내부 오류가 발생했습니다.',
    timestamp: new Date().toISOString(),
    error: process.env.NODE_ENV === 'development' ? error.message : '내부 서버 오류'
  });
});

// ====================================
// 서버 시작
// ====================================
const startServer = async () => {
  try {
    console.log('🎮 River Dice Game Backend Server 시작 중...');
    
    // 데이터베이스 연결 테스트
    console.log('🔍 MySQL testgame 데이터베이스 연결 확인 중...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ MySQL testgame 데이터베이스 연결 실패!');
      process.exit(1);
    }

    // 서버 시작
    const server = app.listen(PORT, () => {
      console.log(`
🎮 ==========================================
   River Dice Game Backend Server v1.0.0
🎮 ==========================================
📍 서버 주소: http://localhost:${PORT}
🗄️ 데이터베이스: MySQL testgame
🎯 게임: River Dice - 완전한 백엔드
🎮 ==========================================
      `);

      console.log('🔗 River Dice Game API 엔드포인트:');
      console.log('   🏠 GET  /                          - 서버 정보');
      console.log('   ❤️  GET  /api/health                - 서버 상태');
      console.log('   🔍 GET  /api/test/database          - DB 연결 테스트');
      console.log('');
      console.log('🎮 게임 시스템:');
      console.log('   💾 POST /api/game/save              - 게임 저장');
      console.log('   📂 GET  /api/game/load/:playerId    - 게임 로드');
      console.log('   👥 GET  /api/players/ranking/:type  - 플레이어 랭킹');
      console.log('   🃏 GET  /api/cards/player/:id       - 카드 관리');
      console.log('');
      console.log('📊 게임 콘텐츠:');
      console.log('   👹 GET  /api/monsters/session/:type - 몬스터 (51종)');
      console.log('   🎯 GET  /api/skills/job/:type       - 스킬 (전직업)');
      console.log('   🎁 GET  /api/artifacts/job/:type    - 아티팩트 (26종)');
      console.log('   🎪 GET  /api/events/random/:type    - 이벤트 (8타입)');
      console.log('🎮 ==========================================');
      console.log('');
      console.log('✅ River Dice 게임 백엔드 서버가 성공적으로 시작되었습니다!');
    });

  } catch (error) {
    console.error('❌ River Dice 서버 시작 실패:', error);
    process.exit(1);
  }
};

// 서버 시작 실행
startServer();