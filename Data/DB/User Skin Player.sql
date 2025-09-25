use testgame;

show tables;
select * from UserDB;
create table UserDB (
ID varchar(12) primary key not null default 'test',
Password varchar(12) not null default 'test',
gold int  not null default 3000,
Owned_SkinID json NOT NULL DEFAULT (JSON_ARRAY(101,201,301,401,501,601))
);
drop table UserDB;
INSERT INTO UserDB (ID, Password, gold) VALUES
('test', 'test', 3000);
select * from UserDB;
TRUNCATE TABLE UserDB;

create table SkinDB (
Skin_ID int primary key not null default 101,
Skin_name varchar(20) not null default 'Basic',
Job varchar(20) not null default 'Warrior',
image_ID int not null default 101
);

select * from SkinDB;
drop table SkinDB;
insert into SkinDB (Skin_ID, Skin_name, Job, image_ID) VALUES
-- 전사 --
(101, 'Basic', 'Warrior', 101),
(102, 'Grass', 'Warrior', 102),
(103, 'Water', 'Warrior', 103),
(104, 'Fire', 'Warrior', 104),

(201, 'Basic', 'Warrior', 201),
(202, 'Grass', 'Warrior', 202),
(203, 'Water', 'Warrior', 203),
(204, 'Fire', 'Warrior', 204),

-- 도적 --
(301, 'Basic', 'Thief', 301),
(302, 'Grass', 'Thief', 302),
(303, 'Water', 'Thief', 303),
(304, 'Fire', 'Thief', 304),

(401, 'Basic', 'Thief', 401),
(402, 'Grass', 'Thief', 402),
(403, 'Water', 'Thief', 403),
(404, 'Fire', 'Thief', 404),

-- 마법사 --
(501, 'Basic', 'Mage', 501),
(502, 'Grass', 'Mage', 502),
(503, 'Water', 'Mage', 503),
(504, 'Fire', 'Mage', 504),

(601, 'Basic', 'Mage', 601),
(602, 'Grass', 'Mage', 602),
(603, 'Water', 'Mage', 603),
(604, 'Fire', 'Mage', 604);


create table PlayerDB (
Player_ID varchar(12) primary key,
Using_Character varchar(12),
Using_Skin INT NOT NULL DEFAULT 0,
curr_hp int,
max_hp int,
atk int,
luck int,
WhereSession varchar(20) NOT NULL DEFAULT('Water'),
WhereStage int NOT NULL DEFAULT(0),
EventAtk int,
EventCurrHp int,
EventMaxHp int,
Using_Skill varchar(500),
Own_Skill varchar(500),
Own_Artifact varchar(500)
# 위의 3개는 String으로 저장 (11,13,15) 하고 ,를 기준으로 나눠서 ID 호출
);
# 임시 테스터 플레이어 데이터를 넣어서 진행해야함. 스킬의 경우 SkillDB 형식에 맞춰서 적당히 넣을 것
DELETE FROM PlayerDB WHERE Player_ID = 'testPlayer';

DROP TABLE PlayerDB;

select * from PlayerDB;
INSERT INTO PlayerDB (
    Player_ID, Using_Character,Using_Skin, curr_hp, max_hp, atk, luck,
    WhereSession, WhereStage, EventAtk, EventCurrHp, EventMaxHp,
    Using_Skill, Own_Skill, Own_Artifact
) VALUES (
    'testPlayer', 'Warrior', 101, 100, 100, 10, 5,
    'Fire', 1, 0, 0, 0,
    '11,14,3,4', '1,2,3,4,5,6,11,14', '101,102,103'
);