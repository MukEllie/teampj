use testgame;

create table UserDB (
ID varchar(12) primary key,
Password varchar(12),
gold int,
Owned_SkinID json
);

create table SkinDB (
Skin_ID int primary key,
Skin_name varchar(20),
Job varchar(20),
image_ID int
);

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
# 임시 테스터 플레이어 데이터를 넣어서 진행해야함. 스킬의 경우 SkillDB 형식에 맞춰서 적당히 넣을 것