use team1;

drop table artifact;
create table artifact (
	artifact_id INT UNIQUE,
    artifact_name CHAR(50),
    artifact_job INT,			-- 특정 직업용 아티팩트 유무, 0이면 공용, 1이면 전사, 2면 마법사, 3이면 도적
    artifact_type INT,			-- 아티펙트 출현 계층 타입, 0이면 공용, 1이면 물계층, 2면 불계층, 3이면 풀계층, 4이면 특수이벤트
    artifact_text CHAR(100)		-- 아티펙트 소개문구
);
INSERT INTO artifact (artifact_id, artifact_name, artifact_job, artifact_type, artifact_text) VALUES
(0, '황금 문명의 부적', 0, 0, '신에게 거역했다 황금으로 변해버린 고대 문명의 부적이다.'),
(1, '파이터 길드의 메달', 1, 0, '전투능력을 증명한 자에게 주어지는 메달이다.'),
(2, '엄청 커다란 토끼발', 3, 0, '던전 내 토끼몬스터로 만든 것 같은 커다란 토끼발이다.'),
(3, '바다의 심장', 0, 1, '심해 깊숙한 곳에서 가끔 발견되는 보물이다.'),
(4, '부른 빛의 삼지창', 0, 1, '해신에게 인정받은 자만이 취할 수 있다는 성물이다.'),
(5, '심해의 진주', 3, 1, '깊은 바다의 기운이 무기를 타고 내게 흘러들어오는 느낌이다.'),
(6, '불사조의 흰색 깃털', 0, 2, '불사조의 심장 부근에서 자라 강한 생명력이 담긴 깃털이다.'),
(7, '작열하는 용암석', 0, 2, '타오르는 열기가 모두 불살라버릴 것 같다.'),
(9, '세계수의 뿌리', 0, 3, '생명의 근원이 담겨있다고 알려진 성물이다.'),
(10, '드루이드의 벨트', 0, 3, '착용하면 숲의 정령과 대화가 가능하다고 알려져있다.');



create table heal_artifact (
artifact_id INT UNIQUE,
heal_hitrate INT,			-- 타수당 힐량
heal_turn INT,				-- 턴당 힐량
heal_deal INT,				-- 피해량당 힐량(피흡)
artifact_power CHAR(100),	-- 아티펙트 효과 설명
FOREIGN KEY (artifact_id) REFERENCES artifact(artifact_id)
);
INSERT INTO heal_artifact (artifact_id, heal_hitrate, heal_turn, heal_deal, artifact_power) VALUES
(3, 0, 10, 0, '매 턴마다 10 치유'),
(5, 5, 0, 0, '타격당 5 치유');



create table defence_artifact (
artifact_id INT UNIQUE,
defence_shield INT,			-- 매 전투당 1회용 실드 유무, 0이면 없음 1이면 부여
dodge_rate INT,				-- 회피율 계수(수정 가능)
reflect_dmg INT,			-- 데미지 반사수치
artifact_power CHAR(100),	-- 아티펙트 효과 설명
FOREIGN KEY (artifact_id) REFERENCES artifact(artifact_id)
);



create table attack_artifact (
artifact_id INT UNIQUE,
element_none INT,
element_water INT,			-- 물속성카드 데미지 증가
element_fire INT,			-- 불속성카드 데미지 증가
element_grass INT,			-- 풀속성카드 데미지 증가
artifact_power CHAR(100),	-- 아티펙트 효과 설명
FOREIGN KEY (artifact_id) REFERENCES artifact(artifact_id)
);
INSERT INTO attack_artifact (artifact_id, element_none, element_water, element_fire, element_grass, artifact_power) VALUES
(1, 2, 0, 0, 0, '일반카드 공격력 2 증가'),
(4, 0, 2, 0, 0, '물속성카드 공격력 2 증가'),
(7, 0, 0, 2, 0, '불속성카드 공격력 2 증가'),
(10, 0, 0, 0, 2, '풀속성카드 공격력 2 증가');



create table extra_artifact (
artifact_id INT UNIQUE,
gold_stage INT,				-- 매 스테이지마다 골드획득량
extra_life INT,				-- 추가생명 스택
artifact_power CHAR(100),	-- 아티펙트 효과 설명
FOREIGN KEY (artifact_id) REFERENCES artifact(artifact_id)
);
INSERT INTO extra_artifact (artifact_id, gold_stage, extra_life, artifact_power) VALUES
(0, 10, 0, '매 스테이지마다 골드 10 획득'),
(6, 0, 1, '체력 50%로 1회 부활');