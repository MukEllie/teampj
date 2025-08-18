CREATE DATABASE team1 default CHARACTER SET UTF8MB4;
use team1;

/* normalevent */
drop table normalevent;
CREATE TABLE normalevent (
    ne_id INT UNIQUE,
    ne_name CHAR(50),
    ne_session VARCHAR(20),	-- none, water, fire, grass
    ne_dice INT,
    ne_php INT,
    ne_mhp INT,
    ne_patk INT,
    ne_matk INT,
    ne_gold INT,
    ne_luck INT
);
select * from normalevent;
INSERT INTO normalevent VALUES
(0, '신비의 샘', 'none', 0, 30, 0, 0, 0, 0, 0),
(1, '잊혀진 훈련교본', 'none', 10, 0, 0, 1, 0, 0, 0),
(3, '쓰나미 예언', 'water', 0, 0, -15, 0, 0, 0, 0),
(4, '밀물의 휴식처', 'water', 5, 10, 0, 0, -1, 0, 0),
(5, '열사의 망상', 'fire', 1, -25, 0, 5, 0, 0, 0),
(6, '불꽃 축제', 'fire', 3, 30, 0, 1, 1, 0, 0),
(7, '독버섯 밀림', 'grass', -15, 0, 0, 0, 0, 0, 1),
(8, '자연의 분노', 'grass', 3, 0, 0, 0, -1, 0, 0);


/* rollevent */
drop table rollevent;
CREATE TABLE rollevent (
    re_id INT UNIQUE,
    re_name CHAR(50),
    re_session VARCHAR(20),
    re_dice INT,
    re_dicelimit INT,
    re_php INT,
    re_pmaxhp INT,
    re_mhp INT,
    re_mmaxhp INT,
    re_patk INT,
    re_matk INT,
    re_gold INT,
    re_luck INT
);
select * from rollevent;
INSERT INTO rollevent VALUES
(0, '길 잃은 축복', 'none', 15, 11, 0, 10, 0, 10, 0, 0, 0, 0),
(1, '고대의 저주', 'none', 15, 11, 0, -10, 0, -10, 0, 0, 0, 0),
(2, '바다 정령의 시련', 'water', 12, 9, 0, 0, 0, 0, 0, 5, 0, 1),
(3, '수상한 보물상자', 'water', 15, 10, -10, 0, 0, 0, 0, 0, 100, 0),
(4, '용암 강 레이스', 'fire', 20, 12, -40, 0, -40, 0, 0, 0, 0, 0),
(5, '불타는 정수', 'fire', 15, 10, 0, 0, 0, 0, 5, 5, 0, 0),
(6, '나무 밑 무덤', 'grass', 10, 6, 0, 0, 0, 10, 0, 0, 50, 0),
(7, '성스런 숲의 의식', 'grass', 15, 10, -20, 20, 0, 0, 0, 0, 0, 0);


/* cardevent */
drop table cardevent;
CREATE TABLE cardevent (
    ce_id INT UNIQUE,
    ce_name CHAR(50),
    ce_session VARCHAR(20), -- none, water, fire, grass
    ce_dmg INT -- 0이면 SkillDB에서, 0이 아니면 PlayerDB.Own_Skill에서 뽑음
);
select * from cardevent;
INSERT INTO cardevent VALUES
(0, '바다의 선물', 'Water', 0),
(1, '화산의 선물', 'Fire', 0),
(2, '세계수의 선물', 'Grass', 0),
(3, '파도 강화', 'Water', 2),
(4, '화력 강화', 'Fire', 2),
(5, '뿌리 강화', 'Grass', 2);


/* artifactevent */
drop table artifactevent;
CREATE TABLE artifactevent (
    ae_id INT UNIQUE,
    ae_name CHAR(50),
    ae_session VARCHAR(20) -- none, water, fire, grass
);
select * from artifactevent;
INSERT INTO artifactevent VALUES
(0, '물의 아티팩트 발견', 'Water'),
(1, '불의 아티팩트 발견', 'Fire'),
(2, '풀의 아티팩트 발견', 'Grass');


/* selectevent */
drop table selectevent;
CREATE TABLE selectevent (
    se_id INT UNIQUE,
    se_name CHAR(50),
    se_session VARCHAR(20)
);
select * from selectevent;
INSERT INTO selectevent VALUES
(0, '영혼의 거래소', 'none'),
(1, '대해적의 보물상자', 'water'),
(2, '불사조의 3색 깃털', 'fire'),
(3, '숲의 갈림길', 'grass');


/* selectevent_choice */
drop table selectevent_choice;
CREATE TABLE selectevent_choice (
    sec_id INT UNIQUE,
    se_id INT,
    sec_opt INT,
    sec_php INT,
    sec_pmaxhp INT,
    sec_mhp INT,
    sec_mmaxhp INT,
    sec_patk INT,
    sec_matk INT,
    sec_gold INT,
    sec_luck INT,
    sec_text CHAR(100),
    FOREIGN KEY (se_id) REFERENCES selectevent(se_id)
);
select * from selectevent_choice;
INSERT INTO selectevent_choice VALUES
(0, 0, 1, 0, -20, 0, 0, 5, 0, 0, 0,'힘의 영혼'),
(1, 0, 2, 0, 10, 0, 0, 0, 0, 0, -1, '체력의 영혼'),
(2, 0, 3, -10, 0, 0, 0, 0, 0, 0, 1, '행운의 영혼'),
(3, 1, 1, 0, 0, 0, 0, 0, 0, 0, -1, '바다의 정수가 담긴 물병'),
(4, 1, 2, 50, 0, 0, 0, 0, 0, 0, 0, '빛바랜 엘릭서'),
(5, 1, 3, 0, 0, 0, 0, 0, 0, 100, 0, '가죽주머니'),
(6, 2, 1, 0, 0, 0, 0, 5, 0, 0, 0, '빨강 깃털'),
(7, 2, 2, 0, 0, 0, 0, 0, 5, 0, 0, '주황 깃털'),
(8, 2, 3, 0, 0, 0, 0, 0, 0, 0, 1, '노란 깃털'),
(9, 3, 1, 0, 0, 0, 10, 0, 0, 0, 0, '수상한 꽃밭'),
(10, 3, 2, 0, 10, 0, 0, 0, 0, 0, 0, '우뚝 솟은 절벽'),
(11, 3, 3, 0, 0, 0, 0, 0, -5, 0, 0, '질척한 늪지대');


/* trapevent */
drop table trapevent;
CREATE TABLE trapevent (
    te_id INT UNIQUE,
    te_name CHAR(50),
    te_session VARCHAR(20), -- none, water, fire, grass
    te_dice INT,            -- 주사위 눈금
    te_dicelimit INT,       -- 성공 기준
    te_php INT,             -- 플레이어 현재 체력 변화
    te_maxhp INT,           -- 플레이어 최대 체력 변화
    te_patk INT,            -- 플레이어 공격력 변화
    te_luck INT             -- 플레이어 운 변화
);
select * from trapevent;
INSERT INTO trapevent VALUES
(0, '저주받은 함정', 'none', 12, 7, -20, 0, 0, 0),
(1, '세이렌의 노래', 'water', 16, 9, 0, 0, 0, -2),
(2, '화산재 폭풍', 'fire', 18, 10, 0, 0, -10, 0),
(3, '식인식물의 독가시 공격', 'grass', 20, 11, 0, -10, 0, 0);



drop table bossevent;
create table bossevent (
	be_id INT UNIQUE,
    be_name CHAR(50),
    be_session VARCHAR(20),
    MonsterID INT,
    FOREIGN KEY (MonsterID) REFERENCES MonsterDB(MonsterID)
);
select * from bossevent;
insert into bossevent values
(0, '혼령의 인도', 'None', 51);


/* used_events */
drop table used_events;
CREATE TABLE used_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id VARCHAR(12) NOT NULL,
    layer VARCHAR(20) NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    event_id INT NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_event (player_id, layer, event_type, event_id)
);
select * from used_events;