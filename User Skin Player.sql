use team1;
use testgame;

create table UserDB (
ID varchar(12) primary key,
Password varchar(12),
gold int,
Owned_SkinID json
);
select * from UserDB;
TRUNCATE TABLE UserDB;
insert into UserDB(ID, Password, gold) values
('test01', '123', 0),
('test02', '456', 0),
('test03', '789', 0);

drop table PlayerDB;
create table PlayerDB (
Player_ID varchar(12) primary key,
Using_Character varchar(12),
curr_hp int,
max_hp int,
atk int,
luck int,
WhereSession varchar(20),
WhereStage int,
EventAtk int,
EventCurrHp int,
EventMaxHp int,
Using_Skill varchar(500),
Own_Skill varchar(500),
Own_Artifact varchar(500)
# 위의 3개는 String으로 저장 (11,13,15) 하고 ,를 기준으로 나눠서 ID 호출
);
select * from PlayerDB;
TRUNCATE TABLE PlayerDB;
insert into PlayerDB(Player_ID, Using_Character, curr_hp, max_hp ,atk, luck, WhereSession, WhereStage, EventAtk, EventCurrHp, EventMaxHp) values
('test01', 'Warrior', 100, 100, 10, 5, 'Water', 1, 0, 0, 0),
('test02', 'Mage', 80, 80, 15, 4, 'Fire', 6, 0, 0, 0),
('test03', 'Thief', 90, 90, 5, 6, 'Grass', 8, 0, 0, 0);