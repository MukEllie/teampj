const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const https = require('https');
const http = require('http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 설정
app.use(express.static(__dirname));
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL 연결 설정
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'testgame'
});

// 데이터베이스 연결 테스트
db.connect((err) => {
  if (err) {
    console.error('데이터베이스 연결 실패:', err);
    return;
  }
  console.log('MySQL 데이터베이스에 성공적으로 연결되었습니다.');
});

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, 'uploads/media');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, `${timestamp}_${originalName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('허용되지 않는 파일 형식입니다.'));
    }
  }
});

// URL을 embed 형식으로 변환하는 헬퍼 함수들
function convertYouTubeUrl(url) {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(youtubeRegex);

  if (match) {
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return null;
}

function convertVimeoUrl(url) {
  const vimeoRegex = /vimeo\.com\/(?:.*\/)?(\d+)/i;
  const match = url.match(vimeoRegex);

  if (match) {
    const videoId = match[1];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return null;
}

function getVideoInfo(url) {
  const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url);
  const isVimeo = /vimeo\.com/i.test(url);

  if (isYouTube) {
    const embedUrl = convertYouTubeUrl(url);
    return {
      platform: 'youtube',
      embedUrl: embedUrl,
      mimeType: 'video/youtube',
      fileName: `youtube_${Date.now()}.mp4`
    };
  } else if (isVimeo) {
    const embedUrl = convertVimeoUrl(url);
    return {
      platform: 'vimeo',
      embedUrl: embedUrl,
      mimeType: 'video/vimeo',
      fileName: `vimeo_${Date.now()}.mp4`
    };
  }

  return null;
}

// 기본 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API 테스트 라우트
app.get('/api/test', (req, res) => {
  res.json({ message: 'API 테스트 성공!' });
});

// 데이터베이스 연결 테스트 API
app.get('/api/db-test', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '데이터베이스 쿼리 실패',
        details: err.message
      });
    }
    res.json({
      message: '데이터베이스 연결 성공!',
      result: results[0].result
    });
  });
});

// ===== 관리자 인증 미들웨어 =====
function authenticateAdmin(req, res, next) {
  const { admin_id, admin_password } = req.body;

  if (admin_id === 'admin' && admin_password === '1234') {
    next();
  } else {
    res.status(401).json({ error: '관리자 인증 실패' });
  }
}

// 관리자 로그인 API
app.post('/api/admin/login', (req, res) => {
  const { admin_id, admin_password } = req.body;

  if (admin_id === 'admin' && admin_password === '1234') {
    res.json({
      message: '관리자 로그인 성공',
      admin: {
        id: admin_id,
        role: 'admin',
        login_time: new Date().toISOString()
      }
    });
  } else {
    res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다' });
  }
});

// ===== 관리자 사용자 관리 API =====

// 전체 사용자 목록 조회
app.get('/api/admin/users', (req, res) => {
  const query = `
    SELECT u.ID, u.nickname, u.email, u.gold, u.Owned_SkinID, u.join_date,
           p.Using_Character, p.WhereSession, p.WhereStage, p.curr_hp, p.max_hp, p.atk, p.luck
    FROM UserDB u
    LEFT JOIN PlayerDB p ON u.ID = p.Player_ID
    ORDER BY u.join_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: '사용자 목록 조회 실패', details: err.message });
    }

    const processedResults = results.map(user => {
      try {
        user.Owned_SkinID = user.Owned_SkinID ? JSON.parse(user.Owned_SkinID) : [];
      } catch (e) {
        user.Owned_SkinID = [];
      }
      return user;
    });

    res.json(processedResults);
  });
});

// 사용자 정보 수정
app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const { nickname, email, gold, Owned_SkinID } = req.body;

  const query = 'UPDATE UserDB SET nickname = ?, email = ?, gold = ?, Owned_SkinID = ? WHERE ID = ?';
  const skinIds = JSON.stringify(Owned_SkinID || []);

  db.query(query, [nickname, email, gold, skinIds, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '사용자 정보 수정 실패', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }

    res.json({ message: '사용자 정보가 수정되었습니다' });
  });
});

// 사용자 삭제
app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;

  // PlayerDB에서 먼저 삭제 (외래키 제약조건 때문)
  db.query('DELETE FROM PlayerDB WHERE Player_ID = ?', [id], (err) => {
    if (err) {
      console.error('PlayerDB 삭제 오류:', err);
    }

    // UserDB에서 삭제
    db.query('DELETE FROM UserDB WHERE ID = ?', [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: '사용자 삭제 실패', details: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
      }

      res.json({ message: '사용자가 삭제되었습니다' });
    });
  });
});

// ===== 관리자 게시글 관리 API =====

// 전체 게시글 목록 조회 (개선된 버전)
app.get('/api/admin/posts', (req, res) => {
  // 먼저 is_deleted 컬럼 존재 확인
  const checkColumnQuery = `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Posts' 
    AND COLUMN_NAME = 'is_deleted'
  `;

  db.query(checkColumnQuery, (checkErr, checkResults) => {
    let query;

    if (checkResults && checkResults.length > 0) {
      // is_deleted 컬럼이 있으면 필터링
      query = `
        SELECT p.*, u.nickname,
               (SELECT COUNT(*) FROM Comments c WHERE c.post_id = p.post_id) as comment_count
        FROM Posts p
        LEFT JOIN UserDB u ON p.user_id = u.ID
        WHERE p.is_deleted = FALSE
        ORDER BY p.created_at DESC
      `;
    } else {
      // is_deleted 컬럼이 없으면 모든 게시글 조회
      console.warn('경고: Posts 테이블에 is_deleted 컬럼이 없습니다.');
      query = `
        SELECT p.*, u.nickname,
               (SELECT COUNT(*) FROM Comments c WHERE c.post_id = p.post_id) as comment_count
        FROM Posts p
        LEFT JOIN UserDB u ON p.user_id = u.ID
        ORDER BY p.created_at DESC
      `;
    }

    db.query(query, (err, results) => {
      if (err) {
        console.error('게시글 목록 조회 실패:', err);
        return res.status(500).json({
          error: '게시글 목록 조회 실패',
          details: err.message
        });
      }
      res.json(results);
    });
  });
});

// 게시글 수정
app.put('/api/admin/posts/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, category } = req.body;

  const query = 'UPDATE Posts SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE post_id = ?';

  db.query(query, [title, content, category, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '게시글 수정 실패', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다' });
    }

    res.json({ message: '게시글이 수정되었습니다' });
  });
});

// 게시글 삭제 (개선된 버전)
app.delete('/api/admin/posts/:id', (req, res) => {
  const { id } = req.params;

  // 먼저 is_deleted 컬럼이 있는지 확인
  const checkColumnQuery = `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Posts' 
    AND COLUMN_NAME = 'is_deleted'
  `;

  db.query(checkColumnQuery, (checkErr, checkResults) => {
    if (checkErr) {
      console.error('컬럼 확인 실패:', checkErr);
      return res.status(500).json({
        error: '데이터베이스 구조 확인 실패',
        details: checkErr.message
      });
    }

    let deleteQuery;

    if (checkResults.length > 0) {
      // is_deleted 컬럼이 있으면 소프트 삭제
      deleteQuery = 'UPDATE Posts SET is_deleted = TRUE WHERE post_id = ?';
    } else {
      // is_deleted 컬럼이 없으면 하드 삭제 (실제 삭제)
      console.warn('경고: Posts 테이블에 is_deleted 컬럼이 없습니다. 하드 삭제를 수행합니다.');
      deleteQuery = 'DELETE FROM Posts WHERE post_id = ?';
    }

    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error('게시글 삭제 실패:', err);
        return res.status(500).json({
          error: '게시글 삭제 실패',
          details: err.message,
          query: deleteQuery // 디버깅용
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: '게시글을 찾을 수 없습니다',
          post_id: id
        });
      }

      console.log(`게시글 삭제 성공: ID ${id}, 영향받은 행: ${result.affectedRows}`);
      res.json({
        message: '게시글이 삭제되었습니다',
        deleted_id: id,
        affected_rows: result.affectedRows
      });
    });
  });
});

// ===== 관리자 댓글 관리 API =====

// 전체 댓글 목록 조회
app.get('/api/admin/comments', (req, res) => {
  const query = `
    SELECT c.*, u.nickname, p.title as post_title
    FROM Comments c
    LEFT JOIN UserDB u ON c.user_id = u.ID
    LEFT JOIN Posts p ON c.post_id = p.post_id
    ORDER BY c.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: '댓글 목록 조회 실패', details: err.message });
    }
    res.json(results);
  });
});

// 댓글 삭제
app.delete('/api/admin/comments/:id', (req, res) => {
  const { id } = req.params;

  const query = 'UPDATE Comments SET is_deleted = TRUE WHERE comment_id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '댓글 삭제 실패', details: err.message });
    }
    res.json({ message: '댓글이 삭제되었습니다' });
  });
});

// ===== 관리자 미디어 관리 API =====

// 전체 미디어 목록 조회
app.get('/api/admin/media', (req, res) => {
  const query = `
    SELECT mi.*, mc.category_name,
           (SELECT COUNT(*) FROM MediaComments c WHERE c.media_id = mi.media_id AND c.is_deleted = FALSE) as comment_count
    FROM MediaItems mi
    LEFT JOIN MediaCategories mc ON mi.category_id = mc.category_id
    ORDER BY mi.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: '미디어 목록 조회 실패', details: err.message });
    }

    const processedResults = results.map(item => {
      try {
        item.tags = item.tags ? JSON.parse(item.tags) : [];
      } catch (e) {
        item.tags = [];
      }
      return item;
    });

    res.json(processedResults);
  });
});

// 미디어 아이템 수정
app.put('/api/admin/media/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, category_id, tags, is_featured, is_published } = req.body;

  const query = `
    UPDATE MediaItems 
    SET title = ?, description = ?, category_id = ?, tags = ?, is_featured = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE media_id = ?
  `;

  const tagsJson = JSON.stringify(tags || []);

  db.query(query, [title, description, category_id, tagsJson, is_featured, is_published, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '미디어 수정 실패', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '미디어를 찾을 수 없습니다' });
    }

    res.json({ message: '미디어 정보가 수정되었습니다' });
  });
});

// 미디어 아이템 삭제
app.delete('/api/admin/media/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM MediaItems WHERE media_id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '미디어 삭제 실패', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '미디어를 찾을 수 없습니다' });
    }

    res.json({ message: '미디어가 삭제되었습니다' });
  });
});

// ===== 관리자 뉴스 관리 API =====

// 뉴스 목록 조회
app.get('/api/admin/news', (req, res) => {
  const query = `
    SELECT n.*, nc.category_name
    FROM News n
    LEFT JOIN NewsCategories nc ON n.category_id = nc.category_id
    ORDER BY n.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: '뉴스 목록 조회 실패', details: err.message });
    }
    res.json(results);
  });
});

// 뉴스 작성
app.post('/api/admin/news', (req, res) => {
  const { category_id, title, content, is_important } = req.body;

  const query = 'INSERT INTO News (category_id, title, content, is_important) VALUES (?, ?, ?, ?)';

  db.query(query, [category_id, title, content, is_important || false], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '뉴스 작성 실패', details: err.message });
    }
    res.status(201).json({ message: '뉴스가 작성되었습니다', news_id: result.insertId });
  });
});

// 뉴스 수정
app.put('/api/admin/news/:id', (req, res) => {
  const { id } = req.params;
  const { category_id, title, content, is_important, is_published } = req.body;

  const query = `
    UPDATE News 
    SET category_id = ?, title = ?, content = ?, is_important = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE news_id = ?
  `;

  db.query(query, [category_id, title, content, is_important, is_published, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '뉴스 수정 실패', details: err.message });
    }
    res.json({ message: '뉴스가 수정되었습니다' });
  });
});

// 뉴스 삭제
app.delete('/api/admin/news/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM News WHERE news_id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '뉴스 삭제 실패', details: err.message });
    }
    res.json({ message: '뉴스가 삭제되었습니다' });
  });
});

// ===== 관리자 고객센터 관리 API =====

// 전체 문의사항 목록 조회 (관리자용)
app.get('/api/admin/inquiries', (req, res) => {
  const query = `
    SELECT inquiry_id, user_id, user_email, inquiry_type, title, content, game_info, 
           status, response, response_date, created_at, updated_at
    FROM Inquiries 
    ORDER BY 
      CASE status 
        WHEN 'pending' THEN 1
        WHEN 'processing' THEN 2
        WHEN 'resolved' THEN 3
        WHEN 'closed' THEN 4
        ELSE 5
      END,
      created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: '문의사항 목록 조회 실패', details: err.message });
    }
    res.json(results);
  });
});

// 문의사항 상태 변경 및 답변 작성
app.put('/api/admin/inquiries/:id', (req, res) => {
  const { id } = req.params;
  const { status, response } = req.body;

  if (!status || !['pending', 'processing', 'resolved', 'closed'].includes(status)) {
    return res.status(400).json({ error: '유효하지 않은 상태값입니다' });
  }

  let query, params;

  if (response && response.trim()) {
    // 답변이 있는 경우
    query = `
      UPDATE Inquiries 
      SET status = ?, response = ?, response_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE inquiry_id = ?
    `;
    params = [status, response.trim(), id];
  } else {
    // 상태만 변경하는 경우
    query = `
      UPDATE Inquiries 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE inquiry_id = ?
    `;
    params = [status, id];
  }

  db.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: '문의사항 업데이트 실패', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '문의사항을 찾을 수 없습니다' });
    }

    res.json({ message: '문의사항이 업데이트되었습니다' });
  });
});

// 문의사항 삭제
app.delete('/api/admin/inquiries/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM Inquiries WHERE inquiry_id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '문의사항 삭제 실패', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '문의사항을 찾을 수 없습니다' });
    }

    res.json({ message: '문의사항이 삭제되었습니다' });
  });
});

// 전체 FAQ 목록 조회 (관리자용)
app.get('/api/admin/faq', (req, res) => {
  const query = `
    SELECT faq_id, question, answer, category, views, is_active, created_at, updated_at
    FROM FAQ 
    ORDER BY is_active DESC, views DESC, created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'FAQ 목록 조회 실패', details: err.message });
    }
    res.json(results);
  });
});

// FAQ 추가
app.post('/api/admin/faq', (req, res) => {
  const { question, answer, category, is_active } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: '질문과 답변은 필수 항목입니다' });
  }

  const query = `
    INSERT INTO FAQ (question, answer, category, is_active) 
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [question.trim(), answer.trim(), category || 'general', is_active !== false], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'FAQ 추가 실패', details: err.message });
    }
    res.status(201).json({ message: 'FAQ가 추가되었습니다', faq_id: result.insertId });
  });
});

// FAQ 수정
app.put('/api/admin/faq/:id', (req, res) => {
  const { id } = req.params;
  const { question, answer, category, is_active } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: '질문과 답변은 필수 항목입니다' });
  }

  const query = `
    UPDATE FAQ 
    SET question = ?, answer = ?, category = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE faq_id = ?
  `;

  db.query(query, [question.trim(), answer.trim(), category, is_active !== false, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'FAQ 수정 실패', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'FAQ를 찾을 수 없습니다' });
    }

    res.json({ message: 'FAQ가 수정되었습니다' });
  });
});

// FAQ 삭제
app.delete('/api/admin/faq/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM FAQ WHERE faq_id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'FAQ 삭제 실패', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'FAQ를 찾을 수 없습니다' });
    }

    res.json({ message: 'FAQ가 삭제되었습니다' });
  });
});

// ===== 관리자 게임 데이터 관리 API =====

// 캐릭터 관리
app.get('/api/admin/characters', (req, res) => {
  db.query('SELECT * FROM CharacterDB ORDER BY name', (err, results) => {
    if (err) {
      return res.status(500).json({ error: '캐릭터 목록 조회 실패', details: err.message });
    }
    res.json(results);
  });
});

app.put('/api/admin/characters/:name', (req, res) => {
  const { name } = req.params;
  const { hp, atk, luck } = req.body;

  const query = 'UPDATE CharacterDB SET hp = ?, atk = ?, luck = ? WHERE name = ?';

  db.query(query, [hp, atk, luck, decodeURIComponent(name)], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '캐릭터 수정 실패', details: err.message });
    }
    res.json({ message: '캐릭터 정보가 수정되었습니다' });
  });
});

// 몬스터 관리
app.get('/api/admin/monsters', (req, res) => {
  db.query('SELECT * FROM MonsterDB ORDER BY Session, Type, MonsterID', (err, results) => {
    if (err) {
      return res.status(500).json({ error: '몬스터 목록 조회 실패', details: err.message });
    }
    res.json(results);
  });
});

app.put('/api/admin/monsters/:id', (req, res) => {
  const { id } = req.params;
  const { Name, Session, Type, Element, min_hp, max_hp, min_atk, max_atk, luck, Special, Description } = req.body;

  const query = `
    UPDATE MonsterDB 
    SET Name = ?, Session = ?, Type = ?, Element = ?, min_hp = ?, max_hp = ?, min_atk = ?, max_atk = ?, luck = ?, Special = ?, Description = ?
    WHERE MonsterID = ?
  `;

  db.query(query, [Name, Session, Type, Element, min_hp, max_hp, min_atk, max_atk, luck, Special, Description, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '몬스터 수정 실패', details: err.message });
    }
    res.json({ message: '몬스터 정보가 수정되었습니다' });
  });
});

app.delete('/api/admin/monsters/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM MonsterDB WHERE MonsterID = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '몬스터 삭제 실패', details: err.message });
    }
    res.json({ message: '몬스터가 삭제되었습니다' });
  });
});

// 스킬 관리
app.get('/api/admin/skills', (req, res) => {
  db.query('SELECT * FROM SkillDB ORDER BY SkillID', (err, results) => {
    if (err) {
      return res.status(500).json({ error: '스킬 목록 조회 실패', details: err.message });
    }
    res.json(results);
  });
});

app.put('/api/admin/skills/:id', (req, res) => {
  const { id } = req.params;
  const { skill_Job, skill_Type, rarity, element, min_damage, max_damage, hit_time, target, statusEffectName, statusEffectRate, statusEffectTurn } = req.body;

  const query = `
    UPDATE SkillDB 
    SET skill_Job = ?, skill_Type = ?, rarity = ?, element = ?, min_damage = ?, max_damage = ?, 
        hit_time = ?, target = ?, statusEffectName = ?, statusEffectRate = ?, statusEffectTurn = ?
    WHERE SkillID = ?
  `;

  db.query(query, [skill_Job, skill_Type, rarity, element, min_damage, max_damage, hit_time, target, statusEffectName, statusEffectRate, statusEffectTurn, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: '스킬 수정 실패', details: err.message });
    }
    res.json({ message: '스킬 정보가 수정되었습니다' });
  });
});

// ===== 관리자 통계 API (고객센터 데이터 포함) =====

// 관리자 대시보드 통계 (고객센터 통계 추가)
app.get('/api/admin/stats', (req, res) => {
  const queries = {
    users: 'SELECT COUNT(*) as count FROM UserDB',
    posts: 'SELECT COUNT(*) as count FROM Posts WHERE is_deleted = FALSE',
    comments: 'SELECT COUNT(*) as count FROM Comments WHERE is_deleted = FALSE',
    media: 'SELECT COUNT(*) as count FROM MediaItems WHERE is_published = TRUE',
    news: 'SELECT COUNT(*) as count FROM News WHERE is_published = TRUE',
    inquiries: 'SELECT COUNT(*) as count FROM Inquiries',
    pending_inquiries: 'SELECT COUNT(*) as count FROM Inquiries WHERE status = "pending"',
    faq: 'SELECT COUNT(*) as count FROM FAQ WHERE is_active = TRUE'
  };

  Promise.all([
    new Promise((resolve, reject) => {
      db.query(queries.users, (err, results) => {
        if (err) reject(err);
        else resolve({ users: results[0].count });
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.posts, (err, results) => {
        if (err) reject(err);
        else resolve({ posts: results[0].count });
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.comments, (err, results) => {
        if (err) reject(err);
        else resolve({ comments: results[0].count });
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.media, (err, results) => {
        if (err) reject(err);
        else resolve({ media: results[0].count });
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.news, (err, results) => {
        if (err) reject(err);
        else resolve({ news: results[0].count });
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.inquiries, (err, results) => {
        if (err) reject(err);
        else resolve({ inquiries: results[0].count });
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.pending_inquiries, (err, results) => {
        if (err) reject(err);
        else resolve({ pending_inquiries: results[0].count });
      });
    }),
    new Promise((resolve, reject) => {
      db.query(queries.faq, (err, results) => {
        if (err) reject(err);
        else resolve({ faq: results[0].count });
      });
    })
  ]).then(results => {
    const stats = Object.assign({}, ...results);
    res.json(stats);
  }).catch(error => {
    res.status(500).json({ error: '통계 조회 실패', details: error.message });
  });
});

// ===== 게임 관련 API =====

// 캐릭터 목록 조회 API
app.get('/api/characters', (req, res) => {
  db.query('SELECT * FROM CharacterDB', (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '캐릭터 조회 실패',
        details: err.message
      });
    }
    res.json(results);
  });
});

// 몬스터 목록 조회 API (세션별)
app.get('/api/monsters/:session', (req, res) => {
  const { session } = req.params;
  const query = 'SELECT * FROM MonsterDB WHERE Session = ? AND Type = "Common"';

  db.query(query, [session], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '몬스터 조회 실패',
        details: err.message
      });
    }
    res.json(results);
  });
});

// 스킬 목록 조회 API
app.get('/api/skills', (req, res) => {
  db.query('SELECT * FROM SkillDB', (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '스킬 조회 실패',
        details: err.message
      });
    }
    res.json(results);
  });
});

// ===== 사용자 관련 API =====

// 사용자 정보 조회 API
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT ID, gold, Owned_SkinID FROM UserDB WHERE ID = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '사용자 조회 실패',
        details: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: '사용자를 찾을 수 없습니다'
      });
    }

    const user = results[0];
    let ownedSkins;
    try {
      ownedSkins = JSON.parse(user.Owned_SkinID);
    } catch (e) {
      ownedSkins = ['SKIN_001'];
    }

    res.json({
      id: user.ID,
      gold: user.gold,
      ownedSkins: ownedSkins
    });
  });
});

// 아이디 중복체크 API
app.post('/api/check-id', (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: '아이디를 입력해주세요' });
  }

  const query = 'SELECT ID FROM UserDB WHERE ID = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: '서버 오류' });
    }

    res.json({
      available: results.length === 0,
      message: results.length === 0 ? '사용 가능한 아이디입니다' : '이미 사용 중인 아이디입니다'
    });
  });
});

// 닉네임 중복체크 API
app.post('/api/check-nickname', (req, res) => {
  const { nickname } = req.body;

  if (!nickname) {
    return res.status(400).json({ error: '닉네임을 입력해주세요' });
  }

  const query = 'SELECT nickname FROM UserDB WHERE nickname = ?';
  db.query(query, [nickname], (err, results) => {
    if (err) {
      return res.status(500).json({ error: '서버 오류' });
    }

    res.json({
      available: results.length === 0,
      message: results.length === 0 ? '사용 가능한 닉네임입니다' : '이미 사용 중인 닉네임입니다'
    });
  });
});

// 회원가입 API (UserDB 기본 구조만 사용)
app.post('/api/signup', (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({
      error: '아이디와 비밀번호를 입력해주세요'
    });
  }

  // 아이디 중복 체크
  db.query('SELECT ID FROM UserDB WHERE ID = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: '서버 오류' });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: '이미 존재하는 아이디입니다' });
    }

    // UserDB에 저장 (기본 구조만)
    const insertQuery = 'INSERT INTO UserDB (ID, Password, gold, Owned_SkinID) VALUES (?, ?, ?, ?)';
    const initialSkins = JSON.stringify(['SKIN_001']);

    db.query(insertQuery, [id, password, 1000, initialSkins], (err) => {
      if (err) {
        console.error('회원가입 오류:', err);
        return res.status(500).json({ error: '회원가입 실패' });
      }

      res.status(201).json({ 
        message: '회원가입 성공',
        user: {
          id: id,
          gold: 1000
        }
      });
    });
  });
});

// 로그인 API (ID 기반, 평문 비밀번호)
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({
      error: '아이디와 비밀번호를 입력해주세요'
    });
  }

  const query = 'SELECT * FROM UserDB WHERE ID = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('로그인 쿼리 오류:', err);
      return res.status(500).json({
        error: '로그인 처리 실패',
        details: err.message
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        error: '존재하지 않는 아이디입니다'
      });
    }

    const user = results[0];

    // 비밀번호 확인 (평문 비교)
    if (password !== user.Password) {
      return res.status(401).json({
        error: '비밀번호가 올바르지 않습니다'
      });
    }

    let ownedSkins;
    try {
      ownedSkins = JSON.parse(user.Owned_SkinID);
    } catch (e) {
      // JSON이 아닌 경우 기본값 설정
      ownedSkins = ['SKIN_001'];
    }

    res.json({
      message: '로그인 성공',
      user: {
        id: user.ID,
        gold: user.gold,
        ownedSkins: ownedSkins
      }
    });
  });
});

// ===== 커뮤니티 API =====

// 게시글 카테고리별 통계 조회 API (누락된 API 추가)
app.get('/api/posts/stats/categories', (req, res) => {
  const query = `
    SELECT 
      category,
      COUNT(*) as post_count,
      COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_posts
    FROM Posts 
    WHERE is_deleted = FALSE 
    GROUP BY category
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '카테고리 통계 조회 실패',
        details: err.message
      });
    }
    res.json(results);
  });
});

// 인기 게시글 조회 API (누락된 API 추가)
app.get('/api/posts/popular', (req, res) => {
  const { limit = 5 } = req.query;

  const query = `
    SELECT p.post_id, p.title, p.likes, p.views, p.created_at, u.nickname
    FROM Posts p 
    JOIN UserDB u ON p.user_id = u.ID 
    WHERE p.is_deleted = FALSE 
    ORDER BY (p.likes * 2 + p.views) DESC 
    LIMIT ?
  `;

  db.query(query, [parseInt(limit)], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '인기 게시글 조회 실패',
        details: err.message
      });
    }
    res.json(results);
  });
});

// 게시글 목록 조회 API (수정됨)
app.get('/api/posts', (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT p.*, u.nickname,
           (SELECT COUNT(*) FROM Comments c WHERE c.post_id = p.post_id AND c.is_deleted = FALSE) as comment_count
    FROM Posts p 
    JOIN UserDB u ON p.user_id = u.ID 
    WHERE p.is_deleted = FALSE
  `;
  let queryParams = [];

  if (category && category !== '전체') {
    query += ` AND p.category = ?`;
    queryParams.push(category);
  }

  query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
  queryParams.push(parseInt(limit), parseInt(offset));

  // 총 게시글 수를 구하는 쿼리
  let countQuery = `
    SELECT COUNT(*) as total
    FROM Posts p 
    WHERE p.is_deleted = FALSE
  `;
  let countParams = [];

  if (category && category !== '전체') {
    countQuery += ` AND p.category = ?`;
    countParams.push(category);
  }

  // 두 쿼리를 동시에 실행
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(query, queryParams, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(countQuery, countParams, (err, results) => {
        if (err) reject(err);
        else resolve(results[0].total);
      });
    })
  ]).then(([posts, totalCount]) => {
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      posts: posts,
      totalPosts: totalCount,
      totalPages: totalPages,
      currentPage: parseInt(page),
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
  }).catch(error => {
    console.error('게시글 조회 오류:', error);
    res.status(500).json({
      error: '게시글 조회 실패',
      details: error.message
    });
  });
});

// 게시글 작성 API
app.post('/api/posts', (req, res) => {
  const { user_id, category, title, content } = req.body;

  if (!user_id || !category || !title || !content) {
    return res.status(400).json({
      error: '필수 필드를 모두 입력해주세요',
      required: ['user_id', 'category', 'title', 'content']
    });
  }

  const query = `
    INSERT INTO Posts (user_id, category, title, content, likes, views) 
    VALUES (?, ?, ?, ?, 0, 0)
  `;

  db.query(query, [user_id, category, title, content], (err, result) => {
    if (err) {
      console.error('게시글 작성 오류:', err);
      return res.status(500).json({
        error: '게시글 작성 실패',
        details: err.message
      });
    }

    res.status(201).json({
      message: '게시글이 작성되었습니다',
      post_id: result.insertId
    });
  });
});

// 특정 게시글 조회 API
app.get('/api/posts/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT p.*, u.nickname 
    FROM Posts p 
    JOIN UserDB u ON p.user_id = u.ID 
    WHERE p.post_id = ? AND p.is_deleted = FALSE
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '게시글 조회 실패',
        details: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: '게시글을 찾을 수 없습니다'
      });
    }

    // 조회수 증가
    const updateViewsQuery = 'UPDATE Posts SET views = views + 1 WHERE post_id = ?';
    db.query(updateViewsQuery, [id], (updateErr) => {
      if (updateErr) {
        console.error('조회수 업데이트 오류:', updateErr);
      }
    });

    const post = results[0];
    post.views = (post.views || 0) + 1; // 응답에서 즉시 반영
    res.json(post);
  });
});

// 게시글 좋아요 토글 API (누락된 API 추가)
app.post('/api/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: '사용자 ID가 필요합니다' });
  }

  // 좋아요 상태 확인
  const checkQuery = 'SELECT * FROM PostLikes WHERE user_id = ? AND post_id = ?';

  db.query(checkQuery, [user_id, id], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '좋아요 상태 확인 실패',
        details: err.message
      });
    }

    if (results.length > 0) {
      // 좋아요 취소
      const deleteQuery = 'DELETE FROM PostLikes WHERE user_id = ? AND post_id = ?';
      const updateQuery = 'UPDATE Posts SET likes = GREATEST(0, likes - 1) WHERE post_id = ?';

      db.query(deleteQuery, [user_id, id], (deleteErr) => {
        if (deleteErr) {
          return res.status(500).json({
            error: '좋아요 취소 실패',
            details: deleteErr.message
          });
        }

        db.query(updateQuery, [id], (updateErr) => {
          if (updateErr) {
            console.error('좋아요 수 업데이트 오류:', updateErr);
          }
          res.json({ message: '좋아요가 취소되었습니다', liked: false });
        });
      });
    } else {
      // 좋아요 추가
      const insertQuery = 'INSERT INTO PostLikes (user_id, post_id) VALUES (?, ?)';
      const updateQuery = 'UPDATE Posts SET likes = likes + 1 WHERE post_id = ?';

      db.query(insertQuery, [user_id, id], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({
            error: '좋아요 추가 실패',
            details: insertErr.message
          });
        }

        db.query(updateQuery, [id], (updateErr) => {
          if (updateErr) {
            console.error('좋아요 수 업데이트 오류:', updateErr);
          }
          res.json({ message: '좋아요가 추가되었습니다', liked: true });
        });
      });
    }
  });
});

// 좋아요 상태 확인 API (누락된 API 추가)
app.get('/api/posts/:id/like/status', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;

  if (!user_id) {
    return res.json({ liked: false });
  }

  const query = 'SELECT * FROM PostLikes WHERE user_id = ? AND post_id = ?';

  db.query(query, [user_id, id], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '좋아요 상태 확인 실패',
        details: err.message
      });
    }

    res.json({ liked: results.length > 0 });
  });
});

// 댓글 목록 조회 API
app.get('/api/posts/:id/comments', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT c.*, u.nickname 
    FROM Comments c 
    JOIN UserDB u ON c.user_id = u.ID 
    WHERE c.post_id = ? AND c.is_deleted = FALSE 
    ORDER BY c.created_at ASC
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '댓글 조회 실패',
        details: err.message
      });
    }
    res.json(results);
  });
});

// 댓글 작성 API
app.post('/api/posts/:id/comments', (req, res) => {
  const { id } = req.params;
  const { user_id, content } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({
      error: '사용자 ID와 댓글 내용이 필요합니다'
    });
  }

  const query = 'INSERT INTO Comments (post_id, user_id, content) VALUES (?, ?, ?)';

  db.query(query, [id, user_id, content], (err, result) => {
    if (err) {
      console.error('댓글 작성 오류:', err);
      return res.status(500).json({
        error: '댓글 작성 실패',
        details: err.message
      });
    }

    res.status(201).json({
      message: '댓글이 작성되었습니다',
      comment_id: result.insertId
    });
  });
});

// ===== 미디어 API 엔드포인트 =====

// 미디어 카테고리 목록 조회
app.get('/api/media/categories', (req, res) => {
  const query = 'SELECT * FROM MediaCategories ORDER BY category_id';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '카테고리 조회 실패',
        details: err.message
      });
    }
    res.json(results);
  });
});

// 미디어 아이템 목록 조회
app.get('/api/media/items', (req, res) => {
  const { category, featured, limit = 20, offset = 0 } = req.query;

  const categoryMapping = {
    'screenshots': 'screenshots',
    'videos': 'videos',
    'artwork': 'artwork',
    'wallpapers': 'wallpapers'
  };

  let query = `
    SELECT mi.*, mc.category_name, mc.category_code
    FROM MediaItems mi 
    JOIN MediaCategories mc ON mi.category_id = mc.category_id 
    WHERE mi.is_published = TRUE
  `;
  let queryParams = [];

  if (category && categoryMapping[category]) {
    query += ` AND mc.category_code = ?`;
    queryParams.push(categoryMapping[category]);
  }

  if (featured === 'true') {
    query += ` AND mi.is_featured = TRUE`;
  }

  query += ` ORDER BY mi.upload_date DESC, mi.created_at DESC LIMIT ? OFFSET ?`;
  queryParams.push(parseInt(limit), parseInt(offset));

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('미디어 아이템 조회 오류:', err);
      return res.status(500).json({
        error: '미디어 아이템 조회 실패',
        details: err.message
      });
    }
    const processedResults = results.map(item => {
      try {
        item.tags = item.tags ? JSON.parse(item.tags) : [];
      } catch (e) {
        item.tags = [];
      }

      // file_url이 없으면 자동 생성 (핵심 수정 부분)
      if (!item.file_url && item.file_name) {
        item.file_url = `/uploads/media/${item.file_name}`;
      }

      // YouTube/Vimeo가 아닌 경우에만 로컬 파일 URL 적용
      if (!item.file_url || item.file_url === 'NULL') {
        if (item.mime_type !== 'video/youtube' && item.mime_type !== 'video/vimeo') {
          item.file_url = `/uploads/media/${item.file_name}`;
        }
      }

      return item;
    });


    console.log(`미디어 아이템 조회 성공: ${processedResults.length}개`);
    res.json(processedResults);
  });
});

// 특정 미디어 아이템 상세 조회
app.get('/api/media/items/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT mi.*, mc.category_name, mc.category_code
    FROM MediaItems mi 
    JOIN MediaCategories mc ON mi.category_id = mc.category_id 
    WHERE mi.media_id = ? AND mi.is_published = TRUE
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '미디어 아이템 조회 실패',
        details: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: '미디어 아이템을 찾을 수 없습니다'
      });
    }

    const item = results[0];
    try {
      item.tags = item.tags ? JSON.parse(item.tags) : [];
    } catch (e) {
      item.tags = [];
    }

    // 조회수 증가
    const updateViewsQuery = 'UPDATE MediaItems SET views = views + 1 WHERE media_id = ?';
    db.query(updateViewsQuery, [id], (updateErr) => {
      if (updateErr) {
        console.error('조회수 업데이트 오류:', updateErr);
      }
    });

    res.json(item);
  });
});

// 미디어 좋아요 토글
app.post('/api/media/items/:id/like', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: '사용자 ID가 필요합니다' });
  }

  const checkQuery = 'SELECT * FROM MediaLikes WHERE user_id = ? AND media_id = ?';

  db.query(checkQuery, [user_id, id], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '좋아요 확인 실패',
        details: err.message
      });
    }

    if (results.length > 0) {
      // 좋아요 취소
      const deleteQuery = 'DELETE FROM MediaLikes WHERE user_id = ? AND media_id = ?';
      const updateQuery = 'UPDATE MediaItems SET likes = likes - 1 WHERE media_id = ?';

      db.query(deleteQuery, [user_id, id], (deleteErr) => {
        if (deleteErr) {
          return res.status(500).json({
            error: '좋아요 취소 실패',
            details: deleteErr.message
          });
        }

        db.query(updateQuery, [id], (updateErr) => {
          if (updateErr) {
            console.error('좋아요 수 업데이트 오류:', updateErr);
          }
          res.json({ message: '좋아요가 취소되었습니다', liked: false });
        });
      });
    } else {
      // 좋아요 추가
      const insertQuery = 'INSERT INTO MediaLikes (user_id, media_id) VALUES (?, ?)';
      const updateQuery = 'UPDATE MediaItems SET likes = likes + 1 WHERE media_id = ?';

      db.query(insertQuery, [user_id, id], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({
            error: '좋아요 추가 실패',
            details: insertErr.message
          });
        }

        db.query(updateQuery, [id], (updateErr) => {
          if (updateErr) {
            console.error('좋아요 수 업데이트 오류:', updateErr);
          }
          res.json({ message: '좋아요가 추가되었습니다', liked: true });
        });
      });
    }
  });
});

// 미디어 다운로드
app.get('/api/media/download/:id', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;
  const ip_address = req.ip || req.connection.remoteAddress;
  const user_agent = req.get('User-Agent');

  const query = 'SELECT file_path, file_name, mime_type FROM MediaItems WHERE media_id = ? AND is_published = TRUE';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('파일 정보 조회 실패:', err);
      return res.status(500).json({
        error: '파일 정보 조회 실패',
        details: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: '파일을 찾을 수 없습니다'
      });
    }

    const fileInfo = results[0];

    // 다운로드 로그 기록
    const logQuery = 'INSERT INTO MediaDownloads (media_id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?)';
    db.query(logQuery, [id, user_id || null, ip_address, user_agent], (logErr) => {
      if (logErr) {
        console.error('다운로드 로그 기록 오류:', logErr);
      }
    });

    // 다운로드 수 증가
    const updateQuery = 'UPDATE MediaItems SET downloads = downloads + 1 WHERE media_id = ?';
    db.query(updateQuery, [id], (updateErr) => {
      if (updateErr) {
        console.error('다운로드 수 업데이트 오류:', updateErr);
      }
    });

    // 실제 파일이 있는 경우 파일 전송, 없는 경우 시뮬레이션
    const filePath = path.join(uploadDir, fileInfo.file_name);

    if (fs.existsSync(filePath)) {
      res.download(filePath, fileInfo.file_name);
    } else {
      // 파일이 없는 경우 더미 응답
      res.json({
        message: '다운로드 시작',
        file_name: fileInfo.file_name,
        file_path: fileInfo.file_path,
        mime_type: fileInfo.mime_type,
        note: '실제 환경에서는 파일이 다운로드됩니다'
      });
    }
  });
});

// 미디어 댓글 목록 조회
app.get('/api/media/items/:id/comments', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT mc.*, u.nickname 
    FROM MediaComments mc 
    JOIN UserDB u ON mc.user_id = u.ID 
    WHERE mc.media_id = ? AND mc.is_deleted = FALSE 
    ORDER BY mc.created_at ASC
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '댓글 조회 실패',
        details: err.message
      });
    }
    res.json(results);
  });
});

// 미디어 댓글 작성
app.post('/api/media/items/:id/comments', (req, res) => {
  const { id } = req.params;
  const { user_id, content } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({
      error: '사용자 ID와 댓글 내용이 필요합니다'
    });
  }

  const query = 'INSERT INTO MediaComments (media_id, user_id, content) VALUES (?, ?, ?)';

  db.query(query, [id, user_id, content], (err, result) => {
    if (err) {
      console.error('댓글 작성 오류:', err);
      return res.status(500).json({
        error: '댓글 작성 실패',
        details: err.message
      });
    }

    res.status(201).json({
      message: '댓글이 작성되었습니다',
      comment_id: result.insertId
    });
  });
});

// 미디어 파일 업로드 API
app.post('/api/media/upload', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
  }

  const { category_id, title, description, tags = '[]' } = req.body;

  if (!category_id || !title || !description) {
    return res.status(400).json({
      error: '필수 정보가 누락되었습니다.',
      required: ['category_id', 'title', 'description']
    });
  }

  const file = req.file;
  const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';

  const insertQuery = `
    INSERT INTO MediaItems 
    (category_id, title, description, file_name, file_path, file_url, file_size, file_type, mime_type, upload_date, tags) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)
  `;

  const fileUrl = `/uploads/media/${file.filename}`; // 명시적으로 설정

  db.query(insertQuery, [
    category_id,
    title,
    description,
    file.filename,
    file.path,
    fileUrl, // 추가
    file.size,
    fileType,
    file.mimetype,
    tags
  ], (err, result) => {
    if (err) {
      console.error('미디어 업로드 DB 저장 오류:', err);
      return res.status(500).json({
        error: '미디어 정보 저장 실패',
        details: err.message
      });
    }

    res.status(201).json({
      message: '미디어가 성공적으로 업로드되었습니다.',
      media_id: result.insertId,
      file_info: {
        original_name: file.originalname,
        saved_name: file.filename,
        size: file.size,
        type: fileType
      }
    });
  });
});

// 수정된 URL로 미디어 업로드 API
app.post('/api/media/upload-url', async (req, res) => {
  const { url, category_id, title, description, tags = [], user_id } = req.body;

  // 입력 검증
  if (!url || !category_id || !title || !user_id) {
    return res.status(400).json({
      error: '필수 정보가 누락되었습니다.',
      required: ['url', 'category_id', 'title', 'user_id']
    });
  }

  // URL 유효성 검사
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (urlError) {
    return res.status(400).json({ error: '유효하지 않은 URL입니다.' });
  }

  try {
    let fileName, fileType, mimeType, finalUrl, duration = null, resolution = null;
    let fileSize = 0;

    // 동영상 플랫폼 URL 처리
    const videoInfo = getVideoInfo(url);

    if (videoInfo) {
      // YouTube/Vimeo 등 플랫폼 동영상
      fileName = videoInfo.fileName;
      fileType = 'video';
      mimeType = videoInfo.mimeType;
      finalUrl = videoInfo.embedUrl; // embed URL 사용

      if (!finalUrl) {
        return res.status(400).json({
          error: `${videoInfo.platform} URL을 변환할 수 없습니다. 올바른 동영상 URL을 입력해주세요.`
        });
      }

    } else {
      // 직접 파일 링크 처리
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm', '.mov'];
      const urlPath = parsedUrl.pathname.toLowerCase();
      const hasValidExtension = allowedExtensions.some(ext => urlPath.endsWith(ext));

      if (!hasValidExtension) {
        return res.status(400).json({
          error: '지원하지 않는 URL입니다. 직접 파일 링크(.jpg, .png, .mp4 등) 또는 YouTube/Vimeo URL을 사용해주세요.'
        });
      }

      fileName = path.basename(parsedUrl.pathname) || `url_media_${Date.now()}`;
      finalUrl = url; // 원본 URL 사용

      // 파일 타입 결정
      if (urlPath.includes('.mp4') || urlPath.includes('.webm') || urlPath.includes('.mov')) {
        fileType = 'video';
        mimeType = urlPath.includes('.webm') ? 'video/webm' : 'video/mp4';
      } else if (urlPath.includes('.png')) {
        fileType = 'image';
        mimeType = 'image/png';
      } else if (urlPath.includes('.gif')) {
        fileType = 'image';
        mimeType = 'image/gif';
      } else {
        fileType = 'image';
        mimeType = 'image/jpeg';
      }

      // 파일 크기 확인 (직접 링크인 경우에만)
      try {
        const headResponse = await new Promise((resolve, reject) => {
          const client = parsedUrl.protocol === 'https:' ? https : http;
          const req = client.request(parsedUrl, { method: 'HEAD' }, resolve);
          req.on('error', reject);
          req.setTimeout(5000, () => reject(new Error('요청 시간 초과')));
          req.end();
        });

        if (headResponse.headers['content-length']) {
          fileSize = parseInt(headResponse.headers['content-length']);

          // 파일 크기 제한 검사 (50MB)
          if (fileSize > 50 * 1024 * 1024) {
            return res.status(400).json({ error: '파일 크기가 너무 큽니다. (최대 50MB)' });
          }
        }
      } catch (sizeError) {
        console.log('파일 크기 확인 실패 (계속 진행):', sizeError.message);
        fileSize = 0;
      }
    }

    // 데이터베이스에 저장
    const insertQuery = `
      INSERT INTO MediaItems 
      (category_id, title, description, file_name, file_path, file_url, file_size, file_type, mime_type, resolution, duration, upload_date, uploaded_by, tags) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)
    `;

    const tagsJson = JSON.stringify(tags);

    db.query(insertQuery, [
      category_id,
      title,
      description,
      fileName,
      url, // file_path에 원본 URL 저장 (참조용)
      finalUrl, // file_url에 실제 사용할 URL 저장 (embed URL 또는 직접 링크)
      fileSize,
      fileType,
      mimeType,
      resolution,
      duration,
      user_id,
      tagsJson
    ], (err, result) => {
      if (err) {
        console.error('URL 미디어 DB 저장 오류:', err);
        return res.status(500).json({
          error: '미디어 정보 저장 실패',
          details: err.message
        });
      }

      res.status(201).json({
        message: 'URL 미디어가 성공적으로 업로드되었습니다.',
        media_id: result.insertId,
        file_info: {
          original_url: url,
          embed_url: finalUrl,
          saved_name: fileName,
          size: fileSize,
          type: fileType,
          platform: videoInfo ? videoInfo.platform : 'direct',
          is_external: true
        }
      });
    });

  } catch (error) {
    console.error('URL 업로드 처리 오류:', error);
    res.status(500).json({
      error: 'URL 업로드 처리 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

// 1. 사용자별 미디어 조회 API
app.get('/api/media/user/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT mi.*, mc.category_name, mc.category_code
    FROM MediaItems mi 
    JOIN MediaCategories mc ON mi.category_id = mc.category_id 
    WHERE mi.uploaded_by = ? AND mi.is_published = TRUE
    ORDER BY mi.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '사용자 미디어 조회 실패',
        details: err.message
      });
    }

    const processedResults = results.map(item => {
      try {
        item.tags = item.tags ? JSON.parse(item.tags) : [];
      } catch (e) {
        item.tags = [];
      }

      if (!item.file_url && item.file_name) {
        item.file_url = `/uploads/media/${item.file_name}`;
      }

      return item;
    });

    res.json(processedResults);
  });
});

// 2. 미디어 수정 API
app.put('/api/media/items/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, tags, user_id } = req.body;

  // 권한 확인: 업로드한 사용자만 수정 가능
  const checkQuery = 'SELECT uploaded_by FROM MediaItems WHERE media_id = ?';

  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: '권한 확인 실패', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: '미디어를 찾을 수 없습니다' });
    }

    if (results[0].uploaded_by !== user_id) {
      return res.status(403).json({ error: '수정 권한이 없습니다' });
    }

    const updateQuery = `
      UPDATE MediaItems 
      SET title = ?, description = ?, tags = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE media_id = ?
    `;

    const tagsJson = JSON.stringify(tags || []);

    db.query(updateQuery, [title, description, tagsJson, id], (updateErr, result) => {
      if (updateErr) {
        return res.status(500).json({ error: '미디어 수정 실패', details: updateErr.message });
      }

      res.json({ message: '미디어가 수정되었습니다' });
    });
  });
});

// 3. 미디어 삭제 API
app.delete('/api/media/items/:id', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  // 권한 확인: 업로드한 사용자만 삭제 가능
  const checkQuery = 'SELECT uploaded_by, file_name FROM MediaItems WHERE media_id = ?';

  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: '권한 확인 실패', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: '미디어를 찾을 수 없습니다' });
    }

    if (results[0].uploaded_by !== user_id) {
      return res.status(403).json({ error: '삭제 권한이 없습니다' });
    }

    const fileName = results[0].file_name;

    // 데이터베이스에서 삭제
    const deleteQuery = 'DELETE FROM MediaItems WHERE media_id = ?';

    db.query(deleteQuery, [id], (deleteErr, result) => {
      if (deleteErr) {
        return res.status(500).json({ error: '미디어 삭제 실패', details: deleteErr.message });
      }

      // 실제 파일 삭제 (선택사항)
      if (fileName) {
        const filePath = path.join(uploadDir, fileName);
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('파일 삭제 실패:', unlinkErr);
          }
        });
      }

      res.json({ message: '미디어가 삭제되었습니다' });
    });
  });
});

// ===== 고객지원 API =====

// 문의 작성 API
app.post('/api/inquiries', (req, res) => {
  console.log('받은 데이터:', req.body);

  const {
    type, email, title, content, gameInfo, userId, agreePrivacy,
    inquiry_type, user_email, game_info, user_id
  } = req.body;

  // 필드명 통합
  const finalData = {
    user_id: user_id || userId || null,
    user_email: user_email || email,
    inquiry_type: inquiry_type || type,
    title: title,
    content: content,
    game_info: game_info || gameInfo || ''
  };

  // 필수 필드 검증
  if (!finalData.user_email || !finalData.inquiry_type || !finalData.title || !finalData.content) {
    return res.status(400).json({
      error: '필수 필드를 모두 입력해주세요',
      required: ['user_email', 'inquiry_type', 'title', 'content'],
      received: Object.keys(req.body)
    });
  }

  // 개인정보 동의 확인
  if (!agreePrivacy) {
    return res.status(400).json({
      error: '개인정보 수집 및 이용에 동의해주세요'
    });
  }

  const query = `
    INSERT INTO Inquiries (user_id, user_email, inquiry_type, title, content, game_info) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
    finalData.user_id,
    finalData.user_email,
    finalData.inquiry_type,
    finalData.title,
    finalData.content,
    finalData.game_info
  ], (err, result) => {
    if (err) {
      console.error('문의 작성 오류:', err);
      return res.status(500).json({
        error: '문의 작성 실패',
        details: err.message
      });
    }

    res.status(201).json({
      message: '문의가 접수되었습니다',
      inquiry_id: result.insertId
    });
  });
});

// 사용자 문의 내역 조회 API
app.get('/api/inquiries/user/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT inquiry_id, inquiry_type, title, content, game_info, status, response, response_date, created_at
    FROM Inquiries 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        error: '문의 내역 조회 실패',
        details: err.message
      });
    }

    const inquiries = results.map(inquiry => ({
      id: inquiry.inquiry_id,
      type: inquiry.inquiry_type,
      title: inquiry.title,
      content: inquiry.content,
      game_info: inquiry.game_info,
      status: inquiry.status,
      response: inquiry.response,
      response_date: inquiry.response_date,
      created_at: inquiry.created_at
    }));

    res.json(inquiries);
  });
});

// FAQ 조회 API
app.get('/api/faq', (req, res) => {
  const { category } = req.query;

  let query = 'SELECT * FROM FAQ WHERE is_active = TRUE';
  let queryParams = [];

  if (category) {
    query += ' AND category = ?';
    queryParams.push(category);
  }

  query += ' ORDER BY views DESC';

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'FAQ 조회 실패',
        details: err.message
      });
    }
    res.json(results);
  });
});

// FAQ 조회수 증가 API
app.post('/api/faq/:id/view', (req, res) => {
  const { id } = req.params;

  const query = 'UPDATE FAQ SET views = views + 1 WHERE faq_id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: '조회수 업데이트 실패',
        details: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: '해당 FAQ를 찾을 수 없습니다'
      });
    }

    res.json({ message: '조회수가 업데이트되었습니다' });
  });
});

// ===== HTML 페이지 라우팅 =====

const htmlPages = [
  'game-info.html',
  'gacha-shop.html',
  'community.html',
  'media.html',
  'customer-service.html',
  'login.html',
  'signup.html',
  'profile.html',
  'game.html'
];

htmlPages.forEach(page => {
  app.get(`/${page.replace('.html', '')}`, (req, res) => {
    res.sendFile(path.join(__dirname, page));
  });
});

// 관리자 페이지 라우트
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// 관리자 로그인 페이지 라우트
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// 에러 처리 미들웨어
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '파일 크기가 너무 큽니다. (최대 50MB)' });
    }
  }

  console.error('서버 오류:', error);
  res.status(500).json({ error: error.message });
});

// 404 에러 처리
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// ===== 서버 시작 및 에러 핸들링 =====

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT} 에서 확인할 수 있습니다.`);
  console.log(`정적 파일 경로: ${__dirname}`);
  console.log(`미디어 업로드 경로: ${uploadDir}`);
  console.log(`=================================`);
});

// 에러 핸들링
process.on('uncaughtException', (err) => {
  console.error('처리되지 않은 예외:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('처리되지 않은 Promise 거부:', reason);
  process.exit(1);
});