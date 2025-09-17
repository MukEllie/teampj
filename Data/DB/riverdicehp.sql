-- 1. MySQL에서 회원가입 데이터 확인하기

USE testgame;



-- 방금 가입한 사용자 데이터 확인
SELECT * FROM UserDB WHERE ID = 'aktmzm02';

-- 전체 사용자 목록 확인
SELECT ID, Password, gold, Owned_SkinID FROM UserDB;

-- PlayerDB에도 데이터가 있는지 확인
SELECT * FROM PlayerDB WHERE Player_ID = 'aktmzm02';

USE testgame;
UPDATE UserDB SET Owned_SkinID = '["SKIN_001"]' WHERE ID = 'aktmzm02';

-- 테이블 구조 확인
DESCRIBE UserDB;
DESCRIBE PlayerDB;
-- 1. 커뮤니티 게시판 테이블 생성
USE testgame;

-- 게시판 카테고리 테이블
CREATE TABLE IF NOT EXISTS BoardCategories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기본 카테고리 삽입
INSERT INTO BoardCategories (category_name, description) VALUES 
('자유', '자유롭게 이야기를 나누는 공간'),
('공략', '게임 공략과 팁을 공유하는 공간'),
('질문', '궁금한 것을 묻고 답하는 공간'),
('이벤트', '이벤트 참여 및 공지사항'),
('버그신고', '버그 및 오류 신고');

-- 게시글 테이블
CREATE TABLE IF NOT EXISTS Posts (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(12) NOT NULL,
    category VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES UserDB(ID) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS Comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id VARCHAR(12) NOT NULL,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    parent_comment_id INT NULL,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES UserDB(ID) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_created_at (created_at)
);

-- 좋아요 테이블
CREATE TABLE IF NOT EXISTS Likes (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(12) NOT NULL,
    post_id INT NULL,
    comment_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserDB(ID) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_like (user_id, post_id),
    UNIQUE KEY unique_comment_like (user_id, comment_id),
    INDEX idx_user_id (user_id)
);

-- 샘플 게시글 데이터 삽입
INSERT INTO Posts (user_id, category, title, content, views, likes) VALUES
('aktmzm02', '자유', 'River Dice 첫 플레이 후기!', '오늘 처음 플레이해봤는데 정말 재미있네요! 주사위 시스템이 정말 흥미롭습니다.', 156, 23),
('aktmzm02', '공략', '초보자를 위한 주사위 전략', '초보자분들을 위해 주사위 전략을 정리해봤습니다.\n\n1. 확률 계산하기\n2. 위험도 평가\n3. 타이밍 잡기', 89, 12),
('aktmzm02', '질문', '멀티플레이어 언제 추가되나요?', '친구들과 함께 플레이하고 싶은데 멀티플레이어 기능은 언제 추가될 예정인가요?', 67, 8);

-- 샘플 댓글 데이터 삽입
INSERT INTO Comments (post_id, user_id, content, likes) VALUES
(1, 'aktmzm02', '저도 같은 생각이에요! 정말 중독성 있는 게임입니다.', 5),
(1, 'aktmzm02', '다음 업데이트가 기대되네요!', 3),
(2, 'aktmzm02', '좋은 공략 감사합니다! 많은 도움이 됐어요.', 7),
(3, 'aktmzm02', '저도 궁금합니다. 친구들과 함께 하면 더 재미있을 것 같아요!', 4);

-- 테이블 생성 확인
SELECT 'Posts 테이블 확인' AS 테이블;
SELECT COUNT(*) as 게시글수 FROM Posts;

SELECT 'Comments 테이블 확인' AS 테이블;
SELECT COUNT(*) as 댓글수 FROM Comments;

SELECT '카테고리별 게시글 수' AS 통계;
SELECT category, COUNT(*) as 게시글수 FROM Posts GROUP BY category;

-- 뉴스/공지사항 테이블 생성
USE testgame;

-- 뉴스 카테고리 테이블
CREATE TABLE IF NOT EXISTS NewsCategories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 뉴스/공지사항 테이블
CREATE TABLE IF NOT EXISTS News (
    news_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(50) NOT NULL DEFAULT 'River Dice Team',
    views INT DEFAULT 0,
    is_important BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES NewsCategories(category_id),
    INDEX idx_category (category_id),
    INDEX idx_created_at (created_at),
    INDEX idx_important (is_important)
);

-- 기본 카테고리 데이터 삽입
INSERT INTO NewsCategories (category_name, description) VALUES 
('공지사항', '중요한 서비스 공지사항'),
('업데이트', '게임 업데이트 및 패치 노트'),
('이벤트', '진행중인 이벤트 소식'),
('점검', '서버 점검 관련 안내'),
('개발자노트', '개발팀의 소식과 계획');

-- 샘플 뉴스 데이터 삽입
INSERT INTO News (category_id, title, content, is_important) VALUES 
(1, '🔥 River Dice 정식 서비스 오픈!', 
'안녕하세요, River Dice 개발팀입니다.\n\n드디어 River Dice가 정식 서비스를 시작합니다! 많은 관심과 사랑 부탁드립니다.\n\n주요 특징:\n- 실시간 멀티플레이어 지원\n- 다양한 주사위 스킨과 테마\n- 경쟁적인 랭킹 시스템\n- 활발한 커뮤니티\n\n지금 바로 게임을 시작해보세요!', 
TRUE),

(2, '⚡ v1.2 업데이트 - 새로운 주사위 테마 추가', 
'이번 업데이트에서는 다음과 같은 새로운 기능들이 추가되었습니다:\n\n✨ 새로운 기능\n- 우주 테마 주사위 추가\n- 크리스탈 테마 배경 추가\n- 새로운 이모티콘 10종\n\n🔧 개선사항\n- 게임 로딩 속도 20% 향상\n- UI/UX 개선\n- 버그 수정\n\n업데이트는 자동으로 적용됩니다.', 
FALSE),

(3, '🎁 신규 가입 이벤트 - 첫 주 무료 프리미엄!', 
'신규 회원 여러분을 위한 특별한 이벤트를 준비했습니다!\n\n🎉 이벤트 혜택\n- 가입 즉시 2,000 포인트 지급\n- 프리미엄 주사위 세트 무료 증정\n- 첫 주 VIP 혜택 무료 제공\n\n📅 이벤트 기간\n2025년 1월 30일 ~ 2월 28일\n\n지금 바로 가입하고 혜택을 받아보세요!', 
TRUE),

(4, '🔧 정기 점검 안내 (2025.02.01)', 
'서비스 개선을 위한 정기 점검을 실시합니다.\n\n📅 점검 일시\n2025년 2월 1일 (토) 02:00 ~ 06:00 (4시간)\n\n🔧 점검 내용\n- 서버 성능 최적화\n- 보안 업데이트\n- 신규 콘텐츠 준비\n\n점검 중에는 게임 접속이 불가능합니다.\n이용에 불편을 드려 죄송합니다.', 
TRUE),

(5, '📝 개발자 노트 - 2월 개발 계획', 
'안녕하세요, River Dice 개발팀입니다.\n\n2월 개발 계획을 공유드립니다:\n\n🎯 주요 계획\n- 길드 시스템 개발 시작\n- 토너먼트 모드 기획\n- 모바일 앱 개발 착수\n- 새로운 게임 모드 연구\n\n여러분의 소중한 의견을 반영하여 더 나은 게임을 만들어가겠습니다.\n\n감사합니다!', 
FALSE);

-- 뉴스 조회 쿼리 테스트
SELECT n.news_id, n.title, n.content, n.views, n.is_important, n.created_at,
       nc.category_name
FROM News n
JOIN NewsCategories nc ON n.category_id = nc.category_id
WHERE n.is_published = TRUE
ORDER BY n.is_important DESC, n.created_at DESC;

-- 갤러리 시스템 테이블 생성
USE testgame;

-- 갤러리 카테고리 테이블
CREATE TABLE IF NOT EXISTS GalleryCategories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 갤러리 이미지 테이블
CREATE TABLE IF NOT EXISTS Gallery (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by VARCHAR(50) NOT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    downloads INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES GalleryCategories(category_id),
    FOREIGN KEY (uploaded_by) REFERENCES UserDB(ID),
    INDEX idx_category (category_id),
    INDEX idx_featured (is_featured),
    INDEX idx_views (views),
    INDEX idx_likes (likes)
);

-- 갤러리 좋아요 테이블
CREATE TABLE IF NOT EXISTS GalleryLikes (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    image_id INT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES Gallery(image_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES UserDB(ID) ON DELETE CASCADE,
    UNIQUE KEY unique_gallery_like (image_id, user_id),
    INDEX idx_user_id (user_id)
);

-- 갤러리 댓글 테이블
CREATE TABLE IF NOT EXISTS GalleryComments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    image_id INT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES Gallery(image_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES UserDB(ID) ON DELETE CASCADE,
    INDEX idx_image_id (image_id),
    INDEX idx_created_at (created_at)
);

-- 기본 카테고리 데이터 삽입
INSERT INTO GalleryCategories (category_name, description) VALUES 
('gameboard', '게임보드 이미지'),
('background', '배경 이미지'),
('dice', '주사위 이미지'),
('themes', '테마 이미지'),
('characters', '캐릭터 이미지'),
('ui', 'UI 요소 이미지');

-- 샘플 갤러리 데이터 삽입 (실제 파일 없이 데모용)
INSERT INTO Gallery (category_id, title, description, file_name, file_path, file_size, mime_type, uploaded_by, views, likes, downloads, is_featured) VALUES 
(1, '클래식 게임보드', '전통적인 River Dice 게임보드입니다.', 'classic_board.jpg', '/uploads/gallery/classic_board.jpg', 245760, 'image/jpeg', 'admin', 1234, 89, 156, TRUE),

(1, '모던 게임보드', '현대적인 디자인의 게임보드입니다.', 'modern_board.jpg', '/uploads/gallery/modern_board.jpg', 187392, 'image/jpeg', 'admin', 987, 67, 124, FALSE),

(1, '골드 게임보드', '황금빛 테마의 프리미엄 게임보드입니다.', 'gold_board.jpg', '/uploads/gallery/gold_board.jpg', 298765, 'image/jpeg', 'admin', 2156, 156, 245, TRUE),

(2, '강변 풍경', '아름다운 강변 배경 이미지입니다.', 'river_scene.jpg', '/uploads/gallery/river_scene.jpg', 387456, 'image/jpeg', 'admin', 3456, 278, 356, TRUE),

(2, '산악 지형', '웅장한 산악 지형 배경입니다.', 'mountain_scene.jpg', '/uploads/gallery/mountain_scene.jpg', 412789, 'image/jpeg', 'admin', 2789, 234, 289, FALSE),

(2, '도시 야경', '화려한 도시 야경 배경입니다.', 'city_night.jpg', '/uploads/gallery/city_night.jpg', 356234, 'image/jpeg', 'admin', 4123, 356, 412, TRUE),

(3, '크리스탈 주사위', '투명한 크리스탈 주사위입니다.', 'crystal_dice.png', '/uploads/gallery/crystal_dice.png', 145678, 'image/png', 'admin', 1567, 123, 178, FALSE),

(3, '골드 주사위', '황금 주사위 세트입니다.', 'gold_dice.png', '/uploads/gallery/gold_dice.png', 167892, 'image/png', 'admin', 1890, 145, 201, TRUE),

(4, '우주 테마', '신비로운 우주 테마 이미지입니다.', 'space_theme.jpg', '/uploads/gallery/space_theme.jpg', 456789, 'image/jpeg', 'admin', 2345, 189, 267, TRUE),

(4, '자연 테마', '푸른 자연 테마 이미지입니다.', 'nature_theme.jpg', '/uploads/gallery/nature_theme.jpg', 334567, 'image/jpeg', 'admin', 1876, 134, 198, FALSE);

-- 샘플 댓글 데이터
INSERT INTO GalleryComments (image_id, user_id, content) VALUES 
(1, 'admin', '정말 멋진 게임보드네요!'),
(1, 'admin', '클래식한 느낌이 좋습니다.'),
(4, 'admin', '강변 풍경이 정말 아름답네요!'),
(6, 'admin', '도시 야경이 환상적입니다!'),
(9, 'admin', '우주 테마가 신비로워요!');

-- 갤러리 통계 조회 쿼리
SELECT 
    gc.category_name,
    COUNT(g.image_id) as image_count,
    AVG(g.views) as avg_views,
    SUM(g.likes) as total_likes,
    SUM(g.downloads) as total_downloads
FROM GalleryCategories gc
LEFT JOIN Gallery g ON gc.category_id = g.category_id
WHERE g.is_approved = TRUE
GROUP BY gc.category_id, gc.category_name
ORDER BY image_count DESC;

USE testgame;
ALTER TABLE UserDB ADD COLUMN nickname VARCHAR(20) NOT NULL AFTER ID;
ALTER TABLE UserDB ADD COLUMN email VARCHAR(100) NULL AFTER nickname;
ALTER TABLE UserDB ADD COLUMN birth_date DATE NULL AFTER email;
ALTER TABLE UserDB ADD COLUMN gender VARCHAR(10) NULL AFTER birth_date;
ALTER TABLE UserDB ADD COLUMN join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER gender;

USE testgame;
DESCRIBE UserDB;

USE testgame;
ALTER TABLE UserDB ADD COLUMN nickname VARCHAR(20) NOT NULL AFTER ID;

-- Posts 테이블의 모든 게시글 정보 조회
USE testgame;

-- 1. 전체 게시글 목록 조회 (기본 정보)
SELECT post_id, user_id, category, title, views, likes, created_at 
FROM Posts 
ORDER BY created_at DESC;

-- 2. 게시글 상세 정보 조회 (내용 포함)
SELECT post_id, user_id, category, title, content, views, likes, created_at, updated_at
FROM Posts 
WHERE is_deleted = FALSE
ORDER BY created_at DESC;

-- 3. 특정 카테고리별 게시글 조회
SELECT post_id, user_id, title, views, likes, created_at
FROM Posts 
WHERE category = '자유' AND is_deleted = FALSE
ORDER BY created_at DESC;

-- 4. 인기 게시글 조회 (좋아요 순)
SELECT post_id, user_id, category, title, views, likes, created_at
FROM Posts 
WHERE is_deleted = FALSE
ORDER BY likes DESC, views DESC
LIMIT 10;

-- 5. 최신 게시글 조회
SELECT post_id, user_id, category, title, 
       LEFT(content, 100) as preview,  -- 내용 미리보기 (100자)
       views, likes, created_at
FROM Posts 
WHERE is_deleted = FALSE
ORDER BY created_at DESC
LIMIT 5;

-- 6. 특정 사용자가 작성한 게시글 조회
SELECT post_id, category, title, views, likes, created_at
FROM Posts 
WHERE user_id = 'aktmzm02' AND is_deleted = FALSE
ORDER BY created_at DESC;

-- 7. 카테고리별 게시글 통계
SELECT category, 
       COUNT(*) as 게시글수,
       AVG(views) as 평균조회수,
       SUM(likes) as 총좋아요수,
       MAX(created_at) as 최근게시일
FROM Posts 
WHERE is_deleted = FALSE
GROUP BY category
ORDER BY 게시글수 DESC;

-- 8. 게시글과 댓글 수 함께 조회
SELECT p.post_id, p.title, p.user_id, p.category, p.views, p.likes, p.created_at,
       COUNT(c.comment_id) as 댓글수
FROM Posts p
LEFT JOIN Comments c ON p.post_id = c.post_id AND c.is_deleted = FALSE
WHERE p.is_deleted = FALSE
GROUP BY p.post_id, p.title, p.user_id, p.category, p.views, p.likes, p.created_at
ORDER BY p.created_at DESC;

-- 9. 상세 검색 (제목이나 내용에 특정 키워드 포함)
SELECT post_id, user_id, category, title, views, likes, created_at
FROM Posts 
WHERE (title LIKE '%River Dice%' OR content LIKE '%River Dice%') 
  AND is_deleted = FALSE
ORDER BY created_at DESC;

-- 10. 게시글 하나의 전체 정보 조회 (특정 post_id)
SELECT * FROM Posts WHERE post_id = 1
-- 기존 고객센터 관련 데이터 완전 삭제 후 새로 생성
USE testgame;

-- 1단계: 외래 키 제약 조건 비활성화 (강제 삭제를 위해)
SET FOREIGN_KEY_CHECKS = 0;

-- 2단계: 고객센터 관련 테이블들 모두 삭제
DROP TABLE IF EXISTS inquiryreplies;
DROP TABLE IF EXISTS inquiry_replies;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS Inquiries;
DROP TABLE IF EXISTS FAQ;
DROP TABLE IF EXISTS faq;

-- 3단계: 외래 키 제약 조건 다시 활성화
SET FOREIGN_KEY_CHECKS = 1;

-- 4단계: 현재 남은 테이블 확인
SHOW TABLES;

-- 5단계: FAQ 테이블 새로 생성
CREATE TABLE FAQ (
    faq_id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    views INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_views (views)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6단계: Inquiries 테이블 새로 생성 (외래 키 없이)
CREATE TABLE Inquiries (
    inquiry_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(12) DEFAULT NULL,
    user_email VARCHAR(100) NOT NULL,
    inquiry_type ENUM('bug', 'account', 'payment', 'gameplay', 'suggestion', 'other') NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    game_info VARCHAR(500) DEFAULT '',
    status ENUM('pending', 'processing', 'resolved', 'closed') NOT NULL DEFAULT 'pending',
    response TEXT DEFAULT NULL,
    response_date TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_inquiry_type (inquiry_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7단계: FAQ 기본 데이터 삽입
INSERT INTO FAQ (question, answer, category, views) VALUES 
('게임을 처음 시작하는데 어떤 캐릭터를 선택해야 하나요?', '초보자에게는 전사(Warrior) 클래스를 추천합니다. 높은 체력과 방어력으로 생존력이 뛰어나며, 조작이 비교적 간단합니다.', 'gameplay', 1250),
('갓챠에서 좋은 캐릭터를 뽑을 확률을 높이는 방법이 있나요?', '갓챠는 완전한 확률 기반 시스템입니다. 이벤트 기간에는 특정 캐릭터의 출현 확률이 증가합니다.', 'gameplay', 2340),
('친구와 함께 멀티플레이를 하려면 어떻게 해야 하나요?', '게임 내 친구 시스템을 통해 친구를 추가한 후, 파티 메뉴에서 초대할 수 있습니다.', 'gameplay', 890),
('계정을 분실했을 때 복구할 수 있나요?', '계정 복구는 가능합니다. 이메일 연동 정보나 고객센터 문의를 통해 복구할 수 있습니다.', 'account', 1560),
('게임이 느리거나 끊어질 때는 어떻게 해야 하나요?', '인터넷 연결 상태를 확인하고, 그래픽 옵션을 낮추거나 브라우저를 재시작해보세요.', 'bug', 3420),
('업데이트는 언제 이루어지나요?', '정기 업데이트는 매월 둘째 주에 진행됩니다. 업데이트 소식은 공지사항을 통해 안내합니다.', 'general', 780),
('결제한 아이템이 지급되지 않았어요', '게임을 재시작해보시고, 문제가 지속되면 결제 영수증과 함께 고객센터로 문의해주세요.', 'payment', 2100),
('닉네임을 변경하고 싶어요', '게임 내 설정 메뉴에서 변경 가능합니다. 첫 번째 변경은 무료이며, 이후에는 변경권이 필요합니다.', 'account', 450);

-- 8단계: 문의 샘플 데이터 삽입
INSERT INTO Inquiries (user_id, user_email, inquiry_type, title, content, game_info, status, response, response_date) VALUES 
('aktmzm02', 'aktmzm02@example.com', 'bug', '[버그신고] 게임이 로딩 중에 멈춤', '게임을 시작할 때 로딩 화면에서 진행이 안 됩니다.', '닉네임: 테스트유저, 레벨: 5', 'resolved', '버그가 수정되었습니다. 브라우저 캐시를 삭제 후 재접속해보세요.', '2025-01-25 14:20:00');

INSERT INTO Inquiries (user_id, user_email, inquiry_type, title, content, game_info, status) VALUES 
('aktmzm02', 'aktmzm02@example.com', 'account', '[계정문의] 비밀번호 변경 방법', '비밀번호를 변경하고 싶습니다.', '닉네임: 테스트유저', 'pending');

INSERT INTO Inquiries (user_id, user_email, inquiry_type, title, content, status) VALUES 
(NULL, 'guest@example.com', 'gameplay', '[게임플레이] 초보자 가이드 요청', '게임을 처음 시작했는데 가이드가 필요합니다.', 'pending');

-- 9단계: 생성 결과 확인
SELECT 'FAQ 테이블 확인' AS 구분, COUNT(*) AS 개수 FROM FAQ
UNION ALL
SELECT 'Inquiries 테이블 확인' AS 구분, COUNT(*) AS 개수 FROM Inquiries;

-- 10단계: 테이블 구조 확인
DESCRIBE FAQ;
DESCRIBE Inquiries;

-- 11단계: 데이터 샘플 조회
SELECT '=== FAQ 데이터 샘플 ===' AS 제목;
SELECT faq_id, question, category, views FROM FAQ LIMIT 3;

SELECT '=== 문의 데이터 샘플 ===' AS 제목;
SELECT inquiry_id, user_id, inquiry_type, title, status FROM Inquiries;

-- 12단계: 카테고리별 통계
SELECT '=== FAQ 카테고리 통계 ===' AS 제목;
SELECT category, COUNT(*) as 개수 FROM FAQ GROUP BY category ORDER BY 개수 DESC;

SELECT '=== 문의 상태 통계 ===' AS 제목;
SELECT status, COUNT(*) as 개수 FROM Inquiries GROUP BY status;

-- 미디어 기능용 테이블 생성 (mysqldata.txt에 추가)
USE testgame;

-- 미디어 카테고리 테이블
CREATE TABLE IF NOT EXISTS MediaCategories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL,
    category_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 미디어 아이템 테이블 (스크린샷, 비디오, 아트워크, 배경화면)
CREATE TABLE IF NOT EXISTS MediaItems (
    media_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500),
    file_size INT NOT NULL,
    file_type VARCHAR(10) NOT NULL, -- 'image', 'video'
    mime_type VARCHAR(100) NOT NULL,
    resolution VARCHAR(20), -- '1920x1080' 등
    duration INT, -- 비디오용 (초 단위)
    thumbnail_path VARCHAR(500),
    upload_date DATE NOT NULL,
    uploaded_by VARCHAR(50) NOT NULL DEFAULT 'admin',
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    downloads INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    tags TEXT, -- JSON 형태로 태그 저장
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES MediaCategories(category_id),
    INDEX idx_category (category_id),
    INDEX idx_featured (is_featured),
    INDEX idx_published (is_published),
    INDEX idx_upload_date (upload_date),
    INDEX idx_views (views),
    INDEX idx_likes (likes)
);

-- 미디어 좋아요 테이블
CREATE TABLE IF NOT EXISTS MediaLikes (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    user_id VARCHAR(12) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES UserDB(ID) ON DELETE CASCADE,
    UNIQUE KEY unique_media_like (media_id, user_id),
    INDEX idx_user_id (user_id)
);

-- 미디어 댓글 테이블
CREATE TABLE IF NOT EXISTS MediaComments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    user_id VARCHAR(12) NOT NULL,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES UserDB(ID) ON DELETE CASCADE,
    INDEX idx_media_id (media_id),
    INDEX idx_created_at (created_at)
);

-- 미디어 다운로드 로그 테이블
CREATE TABLE IF NOT EXISTS MediaDownloads (
    download_id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    user_id VARCHAR(12),
    ip_address VARCHAR(45),
    user_agent TEXT,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES MediaItems(media_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES UserDB(ID) ON DELETE SET NULL,
    INDEX idx_media_id (media_id),
    INDEX idx_user_id (user_id),
    INDEX idx_downloaded_at (downloaded_at)
);

-- 기본 카테고리 데이터 삽입
INSERT INTO MediaCategories (category_name, category_code, description, icon) VALUES 
('스크린샷', 'screenshots', '게임 스크린샷 이미지', '📸'),
('동영상', 'videos', '게임 플레이 동영상', '🎥'),
('아트워크', 'artwork', '컨셉 아트워크', '🎨'),
('배경화면', 'wallpapers', '공식 배경화면', '🖥️');

-- 샘플 미디어 데이터 삽입
INSERT INTO MediaItems (category_id, title, description, file_name, file_path, file_url, file_size, file_type, mime_type, resolution, duration, thumbnail_path, upload_date, views, likes, downloads, is_featured, tags) VALUES 

-- 스크린샷
(1, '신규 던전 - 드래곤의 성', '웅장한 드래곤의 성에서 펼쳐지는 모험', 'dragon_castle_01.jpg', '/media/screenshots/dragon_castle_01.jpg', '/api/media/download/1', 2456789, 'image', 'image/jpeg', '1920x1080', NULL, '/media/thumbnails/dragon_castle_01_thumb.jpg', '2025-08-20', 1234, 89, 156, TRUE, '["던전", "드래곤", "성"]'),

(1, '액션 전투 시스템', '박진감 넘치는 실시간 전투', 'battle_action_01.jpg', '/media/screenshots/battle_action_01.jpg', '/api/media/download/2', 1987654, 'image', 'image/jpeg', '1920x1080', NULL, '/media/thumbnails/battle_action_01_thumb.jpg', '2025-08-18', 987, 67, 124, FALSE, '["전투", "액션", "스킬"]'),

(1, '화려한 마법 스킬', '다양한 마법 효과와 스킬 시전', 'magic_skills_01.jpg', '/media/screenshots/magic_skills_01.jpg', '/api/media/download/3', 2187365, 'image', 'image/jpeg', '1920x1080', NULL, '/media/thumbnails/magic_skills_01_thumb.jpg', '2025-08-15', 1567, 123, 234, TRUE, '["마법", "스킬", "이펙트"]'),

(1, '광활한 오픈 월드', '자유롭게 탐험할 수 있는 넓은 세계', 'open_world_01.jpg', '/media/screenshots/open_world_01.jpg', '/api/media/download/4', 3456789, 'image', 'image/jpeg', '1920x1080', NULL, '/media/thumbnails/open_world_01_thumb.jpg', '2025-08-12', 2345, 178, 345, FALSE, '["오픈월드", "탐험", "풍경"]'),

-- 동영상
(2, '공식 론칭 트레일러', 'EPIC ADVENTURE의 모든 것을 담은 공식 트레일러', 'official_trailer.mp4', '/media/videos/official_trailer.mp4', '/api/media/download/5', 45678901, 'video', 'video/mp4', '1920x1080', 150, '/media/thumbnails/official_trailer_thumb.jpg', '2025-08-25', 15678, 892, 1234, TRUE, '["트레일러", "공식", "론칭"]'),

(2, '게임플레이 영상', '실제 게임 플레이 장면을 담은 영상', 'gameplay_demo.mp4', '/media/videos/gameplay_demo.mp4', '/api/media/download/6', 67890123, 'video', 'video/mp4', '1920x1080', 942, '/media/thumbnails/gameplay_demo_thumb.jpg', '2025-08-20', 8765, 456, 678, FALSE, '["게임플레이", "데모", "실플"]'),

(2, '드래곤의 성 공략 영상', '신규 던전 완벽 공략 가이드', 'dragon_castle_guide.mp4', '/media/videos/dragon_castle_guide.mp4', '/api/media/download/7', 34567890, 'video', 'video/mp4', '1920x1080', 495, '/media/thumbnails/dragon_castle_guide_thumb.jpg', '2025-08-18', 5432, 234, 345, FALSE, '["공략", "가이드", "던전"]'),

-- 아트워크
(3, '드래곤 슬레이어 컨셉 아트', '전설의 영웅 초기 디자인 스케치', 'dragon_slayer_concept.jpg', '/media/artwork/dragon_slayer_concept.jpg', '/api/media/download/8', 5678901, 'image', 'image/jpeg', '2048x1536', NULL, '/media/thumbnails/dragon_slayer_concept_thumb.jpg', '2025-08-20', 3456, 267, 189, TRUE, '["컨셉아트", "캐릭터", "드래곤슬레이어"]'),

(3, '드래곤의 성 환경 아트', '웅장한 성곽의 디테일한 설계도', 'dragon_castle_env.jpg', '/media/artwork/dragon_castle_env.jpg', '/api/media/download/9', 7890123, 'image', 'image/jpeg', '2560x1440', NULL, '/media/thumbnails/dragon_castle_env_thumb.jpg', '2025-08-18', 2789, 198, 156, FALSE, '["환경아트", "성", "배경"]'),

-- 배경화면
(4, '메인 로고 배경화면', '공식 로고가 포함된 고해상도 배경화면', 'main_logo_wallpaper.jpg', '/media/wallpapers/main_logo_wallpaper.jpg', '/api/media/download/10', 8901234, 'image', 'image/jpeg', '3840x2160', NULL, NULL, '2025-08-25', 6789, 456, 892, TRUE, '["배경화면", "로고", "4K"]'),

(4, '드래곤 슬레이어 배경화면', '전설의 영웅을 주인공으로 한 배경화면', 'dragon_slayer_wallpaper.jpg', '/media/wallpapers/dragon_slayer_wallpaper.jpg', '/api/media/download/11', 6789012, 'image', 'image/jpeg', '3840x2160', NULL, NULL, '2025-08-20', 4567, 234, 567, FALSE, '["배경화면", "캐릭터", "4K"]'),

(4, '환상의 대륙 풍경', '게임 속 아름다운 풍경을 담은 배경화면', 'fantasy_landscape.jpg', '/media/wallpapers/fantasy_landscape.jpg', '/api/media/download/12', 5678901, 'image', 'image/jpeg', '3840x2160', NULL, NULL, '2025-08-18', 3456, 189, 345, TRUE, '["배경화면", "풍경", "판타지"]');

-- 샘플 댓글 데이터
INSERT INTO MediaComments (media_id, user_id, content, likes) VALUES 
(1, 'aktmzm02', '드래곤의 성 정말 멋있네요! 얼른 플레이해보고 싶어요!', 12),
(5, 'aktmzm02', '트레일러 보고 바로 게임 설치했습니다!', 23),
(8, 'aktmzm02', '컨셉 아트가 정말 섬세하네요. 아티스트분 실력이 대단합니다!', 18),
(10, 'aktmzm02', '4K 배경화면 품질이 환상적이에요!', 15);

-- 통계 확인 쿼리
SELECT '미디어 카테고리별 아이템 수' AS 통계;
SELECT 
    mc.category_name,
    COUNT(mi.media_id) as 아이템수,
    AVG(mi.views) as 평균조회수,
    SUM(mi.likes) as 총좋아요수,
    SUM(mi.downloads) as 총다운로드수
FROM MediaCategories mc
LEFT JOIN MediaItems mi ON mc.category_id = mi.category_id
WHERE mi.is_published = TRUE
GROUP BY mc.category_id, mc.category_name
ORDER BY 아이템수 DESC;

-- FAQ 테이블 생성
CREATE TABLE IF NOT EXISTS FAQ (
    faq_id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(20) NOT NULL,
    views INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inquiries 테이블 생성
CREATE TABLE IF NOT EXISTS Inquiries (
    inquiry_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(12),
    user_email VARCHAR(100) NOT NULL,
    inquiry_type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    game_info TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    response TEXT,
    response_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserDB(ID)
);
USE testgame;

-- Posts 테이블에 is_deleted 컬럼 추가
ALTER TABLE Posts 
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- 확인
DESCRIBE Posts;

SELECT * FROM PlayerDB;
-- 1. PlayerDB 테이블 구조 확인
SELECT 'PlayerDB 테이블 구조' AS 정보;
DESCRIBE PlayerDB;

-- 2. 전체 플레이어 데이터 조회 (기본 정보)
SELECT 'PlayerDB 전체 데이터' AS 정보;
SELECT Player_ID, Using_Character, curr_hp, max_hp, atk, luck, 
       WhereSession, WhereStage 
FROM PlayerDB 
ORDER BY Player_ID;

-- 강제 삭제 시 실행할 쿼리 순서
START TRANSACTION;

-- 1. 댓글의 좋아요 삭제
DELETE FROM Likes WHERE comment_id IN (
    SELECT comment_id FROM Comments WHERE post_id = ?
);

-- 2. 댓글 삭제
DELETE FROM Comments WHERE post_id = ?;

-- 3. 게시글 좋아요 삭제
DELETE FROM Likes WHERE post_id = ?;

-- 4. 게시글 삭제
DELETE FROM Posts WHERE post_id = ?;

COMMIT;

-- ==========================================
-- Posts 테이블 관련 MySQL 조회 쿼리 모음집
-- ==========================================

USE testgame;

-- ==========================================
-- 1. 기본 게시글 조회
-- ==========================================

-- 전체 게시글 목록 조회 (기본 정보)
SELECT post_id, user_id, category, title, views, likes, created_at 
FROM Posts 
WHERE is_deleted = FALSE
ORDER BY created_at DESC;

-- 게시글 상세 정보 조회 (내용 포함)
SELECT post_id, user_id, category, title, content, views, likes, 
       created_at, updated_at
FROM Posts 
WHERE is_deleted = FALSE
ORDER BY created_at DESC;

-- 특정 게시글 하나의 전체 정보 조회
SELECT * FROM Posts WHERE post_id = 1;

-- ==========================================
-- 2. 카테고리별 게시글 조회
-- ==========================================

-- 자유게시판 게시글만 조회
SELECT post_id, user_id, title, views, likes, created_at
FROM Posts 
WHERE category = '자유' AND is_deleted = FALSE
ORDER BY created_at DESC;

-- 공략게시판 게시글만 조회
SELECT post_id, user_id, title, views, likes, created_at
FROM Posts 
WHERE category = '공략' AND is_deleted = FALSE
ORDER BY created_at DESC;

-- 질문게시판 게시글만 조회
SELECT post_id, user_id, title, views, likes, created_at
FROM Posts 
WHERE category = '질문' AND is_deleted = FALSE
ORDER BY created_at DESC;

-- ==========================================
-- 3. 정렬 및 필터링
-- ==========================================

-- 인기 게시글 조회 (좋아요순)
SELECT post_id, user_id, category, title, views, likes, created_at
FROM Posts 
WHERE is_deleted = FALSE
ORDER BY likes DESC, views DESC
LIMIT 10;

-- 조회수가 높은 게시글
SELECT post_id, user_id, category, title, views, likes, created_at
FROM Posts 
WHERE is_deleted = FALSE
ORDER BY views DESC
LIMIT 10;

-- 최신 게시글 조회
SELECT post_id, user_id, category, title, 
       LEFT(content, 100) as preview,  -- 내용 미리보기 (100자)
       views, likes, created_at
FROM Posts 
WHERE is_deleted = FALSE
ORDER BY created_at DESC
LIMIT 5;

-- ==========================================
-- 4. 사용자별 게시글 조회
-- ==========================================

-- 특정 사용자가 작성한 게시글 조회
SELECT post_id, category, title, views, likes, created_at
FROM Posts 
WHERE user_id = 'aktmzm02' AND is_deleted = FALSE
ORDER BY created_at DESC;

-- 사용자별 게시글 통계
SELECT user_id, 
       COUNT(*) as 작성한게시글수,
       AVG(views) as 평균조회수,
       SUM(likes) as 총좋아요수,
       MAX(created_at) as 최근작성일
FROM Posts 
WHERE is_deleted = FALSE
GROUP BY user_id
ORDER BY 작성한게시글수 DESC;

-- ==========================================
-- 5. 검색 쿼리
-- ==========================================

-- 제목으로 검색
SELECT post_id, user_id, category, title, views, likes, created_at
FROM Posts 
WHERE title LIKE '%River Dice%' AND is_deleted = FALSE
ORDER BY created_at DESC;

-- 내용으로 검색
SELECT post_id, user_id, category, title, views, likes, created_at
FROM Posts 
WHERE content LIKE '%주사위%' AND is_deleted = FALSE
ORDER BY created_at DESC;

-- 제목이나 내용에 특정 키워드 포함된 게시글
SELECT post_id, user_id, category, title, views, likes, created_at
FROM Posts 
WHERE (title LIKE '%게임%' OR content LIKE '%게임%') 
  AND is_deleted = FALSE
ORDER BY created_at DESC;

-- ==========================================
-- 6. 통계 및 집계
-- ==========================================

-- 카테고리별 게시글 통계
SELECT category, 
       COUNT(*) as 게시글수,
       AVG(views) as 평균조회수,
       SUM(likes) as 총좋아요수,
       MAX(created_at) as 최근게시일
FROM Posts 
WHERE is_deleted = FALSE
GROUP BY category
ORDER BY 게시글수 DESC;

-- 일별 게시글 작성 통계
SELECT DATE(created_at) as 날짜,
       COUNT(*) as 게시글수,
       AVG(views) as 평균조회수
FROM Posts 
WHERE is_deleted = FALSE
GROUP BY DATE(created_at)
ORDER BY 날짜 DESC;

-- 월별 게시글 작성 통계
SELECT YEAR(created_at) as 년도,
       MONTH(created_at) as 월,
       COUNT(*) as 게시글수,
       AVG(views) as 평균조회수,
       SUM(likes) as 총좋아요수
FROM Posts 
WHERE is_deleted = FALSE
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY 년도 DESC, 월 DESC;

-- ==========================================
-- 7. 게시글과 댓글 관련 조회
-- ==========================================

-- 게시글과 댓글 수 함께 조회
SELECT p.post_id, p.title, p.user_id, p.category, p.views, p.likes, p.created_at,
       COUNT(c.comment_id) as 댓글수
FROM Posts p
LEFT JOIN Comments c ON p.post_id = c.post_id AND c.is_deleted = FALSE
WHERE p.is_deleted = FALSE
GROUP BY p.post_id, p.title, p.user_id, p.category, p.views, p.likes, p.created_at
ORDER BY p.created_at DESC;

-- 댓글이 많은 게시글 순으로 조회
SELECT p.post_id, p.title, p.user_id, p.category, p.views, p.likes,
       COUNT(c.comment_id) as 댓글수
FROM Posts p
LEFT JOIN Comments c ON p.post_id = c.post_id AND c.is_deleted = FALSE
WHERE p.is_deleted = FALSE
GROUP BY p.post_id, p.title, p.user_id, p.category, p.views, p.likes
ORDER BY 댓글수 DESC
LIMIT 10;

-- ==========================================
-- 8. 고급 필터링
-- ==========================================

-- 특정 기간 게시글 조회
SELECT post_id, user_id, category, title, views, likes, created_at
FROM Posts 
WHERE created_at >= '2025-01-01' 
  AND created_at < '2025-02-01'
  AND is_deleted = FALSE
ORDER BY created_at DESC;

-- 조회수와 좋아요가 모두 높은 게시글
SELECT post_id, user_id, category, title, views, likes, created_at
FROM Posts 
WHERE views >= 100 AND likes >= 20 AND is_deleted = FALSE
ORDER BY (views + likes * 10) DESC;  -- 가중치 적용

-- 최근 업데이트된 게시글
SELECT post_id, user_id, category, title, views, likes, 
       created_at, updated_at
FROM Posts 
WHERE updated_at > created_at AND is_deleted = FALSE
ORDER BY updated_at DESC;

-- ==========================================
-- 9. 게시글 상세 정보 조회
-- ==========================================

-- 특정 게시글의 모든 정보와 댓글
SELECT p.*, 
       c.comment_id, c.user_id as commenter, c.content as comment_content,
       c.likes as comment_likes, c.created_at as comment_date
FROM Posts p
LEFT JOIN Comments c ON p.post_id = c.post_id AND c.is_deleted = FALSE
WHERE p.post_id = 1 AND p.is_deleted = FALSE
ORDER BY c.created_at ASC;

-- ==========================================
-- 10. 삭제된 게시글 조회
-- ==========================================

-- 모든 삭제된 게시글 조회
SELECT post_id, user_id, category, title, 
       LEFT(content, 100) as preview,
       views, likes, created_at, updated_at
FROM Posts 
WHERE is_deleted = TRUE
ORDER BY updated_at DESC;

-- 최근 삭제된 게시글 (삭제일 기준)
SELECT post_id, user_id, category, title, views, likes, 
       created_at as 작성일, updated_at as 삭제일
FROM Posts 
WHERE is_deleted = TRUE
ORDER BY updated_at DESC
LIMIT 20;

-- 카테고리별 삭제된 게시글
SELECT category, post_id, user_id, title, views, likes, 
       created_at, updated_at as 삭제일
FROM Posts 
WHERE is_deleted = TRUE AND category = '자유'
ORDER BY updated_at DESC;

-- 특정 사용자가 삭제한 게시글
SELECT post_id, category, title, views, likes, 
       created_at as 작성일, updated_at as 삭제일
FROM Posts 
WHERE user_id = 'aktmzm02' AND is_deleted = TRUE
ORDER BY updated_at DESC;

-- 삭제된 게시글의 상세 정보 (복구용)
SELECT post_id, user_id, category, title, content, views, likes,
       created_at, updated_at, is_deleted
FROM Posts 
WHERE post_id = 1 AND is_deleted = TRUE;

-- 삭제된 게시글과 관련 댓글들
SELECT p.post_id, p.title, p.user_id, p.category, 
       p.created_at as 게시글작성일, p.updated_at as 게시글삭제일,
       c.comment_id, c.user_id as 댓글작성자, c.content as 댓글내용,
       c.created_at as 댓글작성일, c.is_deleted as 댓글삭제여부
FROM Posts p
LEFT JOIN Comments c ON p.post_id = c.post_id
WHERE p.is_deleted = TRUE
ORDER BY p.updated_at DESC, c.created_at ASC;

-- 삭제 패턴 분석 (어떤 게시글들이 주로 삭제되는지)
SELECT category,
       COUNT(*) as 삭제된게시글수,
       AVG(views) as 평균조회수,
       AVG(likes) as 평균좋아요수,
       AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as 평균생존시간_시간
FROM Posts 
WHERE is_deleted = TRUE
GROUP BY category
ORDER BY 삭제된게시글수 DESC;

-- 삭제 시점 분석 (언제 주로 삭제되는지)
SELECT DATE(updated_at) as 삭제일,
       COUNT(*) as 삭제된게시글수,
       GROUP_CONCAT(DISTINCT category) as 삭제된카테고리들
FROM Posts 
WHERE is_deleted = TRUE
GROUP BY DATE(updated_at)
ORDER BY 삭제일 DESC;

-- 빠르게 삭제된 게시글 (작성 후 1시간 이내 삭제)
SELECT post_id, user_id, category, title, views, likes,
       created_at, updated_at,
       TIMESTAMPDIFF(MINUTE, created_at, updated_at) as 생존시간_분
FROM Posts 
WHERE is_deleted = TRUE 
  AND TIMESTAMPDIFF(HOUR, created_at, updated_at) <= 1
ORDER BY 생존시간_분 ASC;

-- 오래 유지되다가 삭제된 게시글 (작성 후 1주일 이상 후 삭제)
SELECT post_id, user_id, category, title, views, likes,
       created_at, updated_at,
       TIMESTAMPDIFF(DAY, created_at, updated_at) as 생존일수
FROM Posts 
WHERE is_deleted = TRUE 
  AND TIMESTAMPDIFF(DAY, created_at, updated_at) >= 7
ORDER BY 생존일수 DESC;

-- ==========================================
-- 11. 삭제 관리 및 복구용 쿼리
-- ==========================================

-- 게시글 소프트 삭제 (실제 삭제하지 않고 플래그만 변경)
-- UPDATE Posts SET is_deleted = TRUE, updated_at = NOW() WHERE post_id = ?;

-- 게시글 복구
-- UPDATE Posts SET is_deleted = FALSE, updated_at = NOW() WHERE post_id = ?;

-- 완전 삭제 전 백업용 조회 (복구 불가능한 삭제 전에 확인)
SELECT post_id, user_id, category, title, content, views, likes,
       created_at, updated_at
FROM Posts 
WHERE is_deleted = TRUE 
  AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY)  -- 30일 이상 된 삭제 게시글
ORDER BY updated_at ASC;

-- 삭제된 게시글 중 댓글이 있는 것들 (복구 우선순위 판단용)
SELECT p.post_id, p.title, p.user_id, p.category,
       COUNT(c.comment_id) as 댓글수,
       p.created_at, p.updated_at as 삭제일
FROM Posts p
LEFT JOIN Comments c ON p.post_id = c.post_id AND c.is_deleted = FALSE
WHERE p.is_deleted = TRUE
GROUP BY p.post_id, p.title, p.user_id, p.category, p.created_at, p.updated_at
HAVING 댓글수 > 0
ORDER BY 댓글수 DESC;

-- ==========================================
-- 12. 성능 모니터링용 쿼리
-- ==========================================

-- 전체 게시글 현황
SELECT 
    '전체 게시글' as 구분, COUNT(*) as 개수
FROM Posts
UNION ALL
SELECT 
    '활성 게시글' as 구분, COUNT(*) as 개수
FROM Posts 
WHERE is_deleted = FALSE
UNION ALL
SELECT 
    '삭제된 게시글' as 구분, COUNT(*) as 개수
FROM Posts 
WHERE is_deleted = TRUE;

-- 카테고리별 현황
SELECT category,
       COUNT(*) as 총게시글수,
       COUNT(CASE WHEN is_deleted = FALSE THEN 1 END) as 활성게시글수,
       COUNT(CASE WHEN is_deleted = TRUE THEN 1 END) as 삭제된게시글수,
       ROUND(COUNT(CASE WHEN is_deleted = TRUE THEN 1 END) * 100.0 / COUNT(*), 2) as 삭제율_퍼센트
FROM Posts
GROUP BY category
ORDER BY 총게시글수 DESC;

-- 사용자별 삭제 통계
SELECT user_id,
       COUNT(*) as 총작성게시글수,
       COUNT(CASE WHEN is_deleted = FALSE THEN 1 END) as 활성게시글수,
       COUNT(CASE WHEN is_deleted = TRUE THEN 1 END) as 삭제한게시글수,
       ROUND(COUNT(CASE WHEN is_deleted = TRUE THEN 1 END) * 100.0 / COUNT(*), 2) as 삭제율_퍼센트
FROM Posts
GROUP BY user_id
HAVING 총작성게시글수 >= 2  -- 2개 이상 작성한 사용자만
ORDER BY 삭제한게시글수 DESC;