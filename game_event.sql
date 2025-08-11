CREATE DATABASE team1 default CHARACTER SET UTF8MB4;

use team1;

/*
	type에서 0은 공용, 1은 물계층, 2는 불계층, 3은 풀계층
    p가 앞에 붙으면 플레이어스텟 조정값, m이 앞에 붙어있으면 몬스터스텟 조정값
*/
drop table normalevent;
CREATE TABLE normalevent (
    e_id INT UNIQUE,
    e_name CHAR(50),
    e_type INT,		-- 0이면 공용, 1이면 물계층, 2면 불계층, 3이면 풀계층
    e_dice INT,		-- 주사위 최대값 변화
    e_php INT,		-- 플레이어 현재체력 변화
    e_mhp INT,		-- 몬스터 현재체력 변화
    e_patk INT,		-- 플레이어 공격력 변화
    e_matk INT,		-- 몬스터 공격력 변화
    e_gold INT,		-- 골드 변화량
    e_luck INT		-- 플레이어 행운 변화
);
select * from normalevent;

insert into normalevent(e_id, e_name, e_type, e_dice, e_php, e_mhp, e_patk, e_matk, e_gold, e_luck) values
-- 공용 일반 이벤트
(0, '신비의 샘', 0, 0, 30, 0, 0, 0, 0, 0), 		-- 플레이어 체력 +30
(1, '잊혀진 훈련교본', 0, 10, 0, 0, 1, 0, 0, 0), 	-- 공격력 1d10 증가

-- 물 일반 이벤트
(3, '쓰나미 예언', 1, 0, 0, -15, 0, 0, 0, 0),		-- 몬스터 체력 -15
(4, '밀물의 휴식처', 1, 5, 10, 0, 0, -1, 0, 0),		-- 플레이어 체력 +10, 몬스터 공격력 -1d5

--  불 일반 이벤트
(5, '열사의 망상', 2, 1, -25, 0, 5, 0, 0, 0),		-- 플레이어 체력 -25, 공격력 +5
(6, '불꽃 축제', 2, 3, 30, 0, 1, 1, 0, 0),			-- 플레이어 체력 +30, 공격력 +1d3, 몬스터 공격력 +1d3

--  풀 일반 이벤트
(7, '독버섯 밀림', 3, -15, 0, 0, 0, 0, 0, 1),		-- 플레이어 체력 -15, 행운 +1
(8, '자연의 분노', 3, 3, 0, 0, 0, -1, 0, 0);		-- 몬스터 공격력 -1d3



drop table rollevent;
CREATE TABLE rollevent (
    re_id INT UNIQUE,
    re_name CHAR(50),
    re_type INT,		-- 0이면 공용, 1이면 물계층, 2면 불계층, 3이면 풀계층
    re_dice INT,		-- 주사위 최대값 변화
    re_dicelimit INT,	-- 넘겨야되는 주사위값
    re_php INT,			-- 플레이어 현재체력 변화
    re_pmaxhp INT,		-- 플레이어 최대체력 변화
    re_mhp INT,			-- 몬스터 현재체력 변화
    re_mmaxhp INT,		-- 몬스터 최대체력 변화
    re_patk INT,		-- 플레이어 공격력 변화
    re_matk INT,		-- 몬스터 공격력 변화
    re_gold INT,		-- 골드값 변화
    re_luck INT			-- 플레이어 행운 변화
);
select * from rollevent;

INSERT INTO rollevent (
    re_id, re_name, re_type, re_dice, re_dicelimit,
    re_php, re_pmaxhp, re_mhp, re_mmaxhp,
    re_patk, re_matk, re_gold, re_luck
) VALUES
-- 공용 주사위 이벤트
(0, '길 잃은 축복', 0, 15, 11, 0, 10, 0, 10, 0, 0, 0, 0),			-- 1d15, 11이상 성공 시 최대체력 +10, 실패 시 몬스터 최대체력 +10
(0, '고대의 저주', 0, 15, 11, 0, -10, 0, -10, 0, 0, 0, 0),			-- 1d15, 11이상 성공 시 몬스터 최대체력 -10, 실패 시 플레이어 최대체력 -10

-- 물 주사위 이벤트
(1, '바다 정령의 시련', 1, 12, 9, 0, 0, 0, 0, 0, 5, 0, 1),			-- 1d12, 9이상 성공 시 행운 +1, 실패 시 몬스터 공격력 +5
(2, '수상한 보물상자', 1, 15, 10, -10, 0, 0, 0, 0, 0, 100, 0),		-- 1d15, 10이상 성공 시 골드 +100, 실패 시 -10데미지

-- 불 주사위 이벤트
(3, '용암 강 레이스', 2, 20, 12, -40, 0, -40, 0, 0, 0, 0, 0),		-- 1d20, 12이상 성공 시 다음 몬스터 -40데미지, 실패 시 플레이어 -40데미지
(4, '불타는 정수', 2, 15, 10, 0, 0, 0, 0, 5, 5, 0, 0),				-- 1d15, 10이상 성공 시 플레이어 공격력 +5, 실패 시 몬스터 공격력 +5

-- 풀 주사위 이벤트
(5, '나무 밑 무덤', 3, 10, 6, 0, 0, 0, 10, 0, 0, 50, 0),			-- 1d10, 6이상 성공 시 골드 +50, 실패 시 몬스터 최대체력 +10
(6, '성스런 숲의 의식', 3, 15, 10, -20,  20, 0, 0, 0, 0, 0, 0);



drop table cardevent;
CREATE TABLE cardevent (
    ce_id INT UNIQUE,
	ce_name CHAR(50),
    ce_type INT,			-- 0이면 공용, 1이면 물계층, 2면 불계층, 3이면 풀계층
    ce_cardtype CHAR(50),	-- 카드 타입(이벤트용 카드값 불러오기용)
    ce_card1 INT,			-- 카드 선택지 1
    ce_card2 INT,			-- 카드 선택지 2
    ce_card3 INT,			-- 카드 선택지 3
    ce_cdmg INT				-- 카드 공격력 변화값(여기에 값이 0이 아니면 선택한 카드 공격력 증가, 0이면 선택한 카드 고르는 방식)
);
select * from cardevent;



drop table artifactevent;
CREATE TABLE artifactevent (
    ae_id INT UNIQUE,
	artifact_id INT,
    artifact_name CHAR(50),
    FOREIGN KEY (artifact_id) REFERENCES artifact(artifact_id),
    FOREIGN KEY (artifact_name) REFERENCES artifact(artifact_name)
);
select * from artifactevent;


drop table selectevent;
CREATE TABLE selectevent (
    se_id INT UNIQUE,
    se_name CHAR(50),
    se_type INT				-- 0이면 공용, 1이면 물계층, 2면 불계층, 3이면 풀계층
);
select * from selectevent;
INSERT INTO selectevent (se_id, se_name, se_type) VALUES
(0, '영혼의 거래소', 0),
(1, '대해적의 보물상자', 1),
(2, '불사조의 3색 깃털', 2),
(3, '숲의 갈림길', 3);



drop table selectevent_choice;
CREATE TABLE selectevent_choice (
    sec_id INT UNIQUE,
    se_id INT,
    sec_opt INT,			-- n번째 선택지 지정용
    sec_php INT,       		-- 플레이어 현재체력 변화
    sec_pmaxhp INT,			-- 플레이어 최대체력 변화
    sec_mhp INT,      		-- 몬스터 현재체력 변화
    sec_mmaxhp INT,   		-- 몬스터 최대체력 변화
    sec_patk INT,      		-- 플레이어 공격력 변화
    sec_matk INT,      		-- 몬스터 공격력 변화
    sec_gold INT,      		-- 골드 변화
    sec_luck INT,	   		-- 행운 변화
    sec_text CHAR(100),		-- 선택지 이름
    FOREIGN KEY (se_id) REFERENCES selectevent(se_id)
);
select * from selectevent_choice;
INSERT INTO selectevent_choice (
    sec_id, se_id, sec_opt, sec_php, sec_pmaxhp, sec_mhp, sec_mmaxhp, sec_patk, sec_matk, sec_gold, sec_luck, sec_text) VALUES

-- 영혼의 거래소 선택지
(0, 0, 1, 0, -20, 0, 0, 5, 0, 0, 0,'힘의 영혼'), /* 체력 -20 공 +5 */
(1, 0, 2, 0, 10, 0, 0, 0, 0, 0, -1, '체력의 영혼'), /* 행운 -1 체력 +10 */
(2, 0, 3, -10, 0, 0, 0, 0, 0, 0, 1, '행운의 영혼'), /* 체력 -10 행운 +1 */

-- 대해적의 보물상자 선택지
(3, 1, 1, 0, 0, 0, 0, 0, 0, 0, -1, '바다의 정수가 담긴 물병'), /* [함정] 행운 -1 */
(4, 1, 2, 50, 0, 0, 0, 0, 0, 0, 0, '빛바랜 엘릭서'), /* 체력 50 회복 */
(5, 1, 3, 0, 0, 0, 0, 0, 0, 100, 0, '가죽주머니'), /* 골드+100 */

-- 불사조의 3색 깃털 선택지
(6, 2, 1, 0, 0, 0, 0, 5, 0, 0, 0, '빨강 깃털'), /* 공 +5 */
(7, 2, 2, 0, 0, 0, 0, 0, 5, 0, 0, '주황 깃털'), /* [함정] 몬스터공 +5 */
(8, 2, 3, 0, 0, 0, 0, 0, 0, 0, 1, '노란 깃털'), /* 행운 +1 */

-- 숲의 갈림길 선택지
(9, 3, 1, 0, 0, 0, 10, 0, 0, 0, 0, '수상한 꽃밭'), /* [함정] 몬스터최대체력 +10 */
(10, 3, 2, 0, 10, 0, 0, 0, 0, 0, 0, '우뚝 솟은 절벽'), /* 플레이어체력 +10 */
(11, 3, 3, 0, 0, 0, 0, 0, -5, 0, 0, '질척한 늪지대'); /* 몬스터공 -5 */



drop table trapevent;
CREATE TABLE trapevent (
    te_id INT UNIQUE,
    te_name CHAR(50),
    te_type INT,		-- 0이면 공용, 1이면 물계층, 2면 불계층, 3이면 풀계층
    te_dice INT,		-- 주사위 최대값 변화
    te_dicelimit INT,	-- 넘겨야되는 주사위값
    te_php INT,			-- 플레이어 현재체력 변화
    te_pmaxhp INT,		-- 플레이어 최대체력 변화
    te_mhp INT,			-- 몬스터 현재체력 변화
    te_mmaxhp INT,		-- 몬스터 최대체력 변화
    te_patk INT,		-- 플레이어 공격력 변화
    te_matk INT,		-- 몬스터 공격력 변화
    te_gold INT,		-- 골드값 변화
    te_luck INT			-- 플레이어 행운 변화
);
select * from trapevent;
INSERT INTO trapevent (
    te_id, te_name, te_type, te_dice, te_dicelimit, 
    te_php, te_pmaxhp, te_mhp, te_mmaxhp, 
    te_patk, te_matk, te_gold, te_luck
) VALUES
-- 공용 함정 이벤트
(0, '저주받은 함정', 0, 12, 7, -20, 0, 0, 0, 0, 0, 0, 0),				-- 1d12, 7 미만일 시 플레이어체력 -20

-- 물 함정 이벤트
(1, '세이렌의 노래', 1, 16, 9, 0, 0, 0, 0, 0, 0, 0, -2),				-- 1d16, 9 미만일 시 행운 -2

-- 불 함정 이벤트
(2, '화산재 폭풍', 2, 18, 10, 0, 0, 0, 0, -10, 0, 0, 0),				-- 1d18, 10 미만일 시 공격력 -10

-- 풀 함정 이벤트
(3, '식인식물의 독가시 공격', 3, 20, 11, 0, -15, 0, 0, 0, 0, 0, 0);		-- 1ㅇ20, 11 미만일 시 최대체력 -15



/*이벤트 중복 방지용*/
CREATE TABLE used_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id VARCHAR(12) NOT NULL,
    layer INT NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    event_id INT NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_event (player_id, layer, event_type, event_id)
);