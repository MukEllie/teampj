CREATE DATABASE team1 default CHARACTER SET UTF8MB4;

use team1;


/*
	임시　테이블，　플레이어　ＤＢ가　제대로　나오면　변경할　예정
*/
drop table player_status;
CREATE TABLE player_status (
	p_id INT UNIQUE,
    p_name char(50),
    p_maxhp INT,
    p_currenthp INT,
    p_atk INT,
    p_luck INT
);

select * from player_status;

insert into player_status(p_id, p_name, p_maxhp, p_currenthp ,p_atk,  p_luck) values (0, '전사', 100, 100, 15, 1);
insert into player_status(p_id, p_name, p_maxhp, p_currenthp, p_atk, p_luck) values (1, '마법사', 80, 80, 10, 2);
insert into player_status(p_id, p_name, p_maxhp, p_currenthp, p_atk, p_luck) values (2, '도적', 60, 60, 5, 3);

UPDATE player_status SET p_currenthp = 100, p_atk = 15, p_luck = 1 WHERE p_id = 0;
UPDATE player_status SET p_currenthp = 80, p_atk = 10, p_luck = 2 WHERE p_id = 1;
UPDATE player_status SET p_currenthp = 60, p_atk = 5, p_luck = 3 WHERE p_id = 2;

