use team1;

create table UserDB (
ID varchar(12) primary key,
Password varchar(12),
gold int,
Owned_SkinID json
);
select * from UserDB;
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
Using_Skill json,
Own_Skill json
);
select * from PlayerDB;
insert into PlayerDB(Player_ID, Using_Character, curr_hp, max_hp ,atk, luck, WhereSession, WhereStage) values
('test01', 'Warrior', 100, 100, 10, 5, 'Water', 1),
('test02', 'Mage', 80, 80, 15, 4, 'Fire', 6),
('test03', 'Thief', 90, 90, 5, 6, 'Grass', 8);