use my_cat;

show tables;

create table skills (
    skill_id int primary key auto_increment,
    skill_job enum('Warrior', 'Thief', 'Mage', 'Common') not null,
    skill_type enum('Basic', 'Battle', 'Event') not null,
    rarity enum ('N', 'R', 'SR') not null,
    element enum('Grass', 'Fire', 'Water', 'None') not null,
	min_damage int default 1,
    max_damage int default 1,
    hit_time int default 1,
	hit_target enum ('Pick', 'All', 'Random') not null,

    -- 상태이상 --
    statusEffect_name enum('Poison', 'Burn', 'Freeze', 'Stun') not null,
    statusEffect_rate int default 1,
	statusEffect_turn int default 1,
    
    -- 이름&설명 --
	skill_name varchar(10) not null,
    skill_text varchar(20) not null
);

insert into skills (skill_job, skill_type, rarity, element, min_damage, max_damage, hit_time, hit_target,
statusEffect_name, statusEffect_rate, statusEffect_turn,skill_name,skill_text) VALUES
-- ([아이디-자동] 직업, 스킬타입, 레어도, 속성, 최소데미지, 최대데미지, 공격횟수, 범위, 상태이상, 상태이상 확률, 상태이상 턴수, 스킬명, 스킬설명) --


-- 전사(풀) --
('Warrior', 'Basic', 'N', 'Grass', 4, 7, 1, 'Pick', 'Poison', 0, 0, '풀의 칼날', '잎사귀를 휘감은 칼로 휘두른다'),
('Warrior', 'Battle', 'N', 'Grass', 5, 8, 1, 'Pick', 'Poison', 0, 0, '우드 어택', '검을 나무처럼 단단하게 만들어서 공격한다'),
('Warrior', 'Battle', 'N', 'Grass', 5, 7, 1, 'Random', 'Poison', 0, 0, '꽃잎 검풍', '자연의 힘을 모은 검으로 벤다'),

('Warrior', 'Battle', 'R', 'Grass', 7, 9, 1, 'All', 'Poison', 10, 2, '플랜트 네트', '숲처럼 깊이 상대 전체를 공격한다'),
('Warrior', 'Battle', 'R', 'Grass', 4, 5, 2, 'Pick', 'Poison', 10, 3, '아로마 커터', '향기로운 검으로 적을 혼란시킨 후 공격한다'),
('Warrior', 'Battle', 'R', 'Grass', 2, 4, 3, 'Pick', 'Poison', 30, 3, '가시 베기', '가시가 돋아난 칼로 상대를 여러 번 벤다'),
('Warrior', 'Battle', 'R', 'Grass', 8, 10, 1, 'Random', 'Poison', 0, 0, '리프 스윙', '나뭇잎이 날리는 것처럼 회전하여 상대를 공격한다'),

('Warrior', 'Battle', 'SR', 'Grass', 13, 15, 1, 'Pick', 'Poison', 30, 4, '그래스 크래시', '자연의 힘을 모은 검으로 벤다'),
('Warrior', 'Event', 'SR', 'Grass', 11, 12, 1, 'All', 'Poison', 0, 0, '내추럴 가디언', '자연을 수호하는 마음을 새긴다'),
('Warrior', 'Event', 'SR', 'Grass', 6, 7, 2, 'Random', 'Poison', 10, 3, '생명의 투지', '생명의 기운을 받아 공격한다'),

-- 전사(불) --
('Warrior', 'Basic', 'N', 'Fire', 4, 7, 1, 'Pick', 'Burn', 0, 0, '불의 칼날', '불꽃을 내뿜는 칼로 휘두른다'),
('Warrior', 'Battle', 'N', 'Fire', 5, 8, 1, 'Pick', 'Burn', 0, 0, '스파크 어택', '검의 온도를 뜨겁게 높여서 공격한다'),
('Warrior', 'Battle', 'N', 'Fire', 5, 7, 1, 'Random', 'Burn', 0, 0, '불꽃 강타', '강하고 빠른 불길을 만든다'),

('Warrior', 'Battle', 'R', 'Fire', 7, 9, 1, 'All', 'Burn', 10, 2, '마그마 네트', '마그마처럼 퍼지도록 상대 전체를 공격한다'),
('Warrior', 'Battle', 'R', 'Fire', 4, 5, 2, 'Pick', 'Burn', 10, 3, '라이징 커터', '높은 온도로 적을 고통스럽게 공격한다'),
('Warrior', 'Battle', 'R', 'Fire', 2, 4, 3, 'Pick', 'Burn', 30, 3, '플레임 블레이드', '상대를 연소시켜서 활활 태워버린다'),
('Warrior', 'Battle', 'R', 'Fire', 8, 10, 1, 'Random', 'Burn', 0, 0, '라바 소드', '용암처럼 뜨거운 칼로 화재를 일으킨다'),

('Warrior', 'Battle', 'SR', 'Fire', 13, 15, 1, 'Pick', 'Burn', 30, 4, '파이어 크래시', '불타오르는 검으로 벤다'),
('Warrior', 'Event', 'SR', 'Fire', 11, 12, 1, 'All', 'Burn', 0, 0, '화염의 참격', '모든 상대에게 닿는 거대한 불꽃을 선사한다'),
('Warrior', 'Event', 'SR', 'Fire', 6, 7, 2, 'Random', 'Burn', 10, 3, '태양의 투지', '태양의 기운을 받아 공격한다'),

-- 전사(물) --
('Warrior', 'Basic', 'N', 'Water', 4, 7, 1, 'Pick', 'Freeze', 0, 0, '물의 칼날', '물을 머금은 칼로 휘두른다'),
('Warrior', 'Battle', 'N', 'Water', 5, 8, 1, 'Pick', 'Freeze', 0, 0, '아이스 어택', '검을 차갑게 얼려서 공격한다'),
('Warrior', 'Battle', 'N', 'Water', 5, 7, 1, 'Random', 'Freeze', 0, 0, '다이브 차지', '커다란 물을 품고 상대 모두에게 돌격한다'),

('Warrior', 'Battle', 'R', 'Water', 7, 9, 1, 'All', 'Freeze', 10, 2, '오션 네트', '바다처럼 널리 상대 전체를 공격한다'),
('Warrior', 'Battle', 'R', 'Water', 4, 5, 2, 'Pick', 'Freeze', 10, 3, '프로즌 커터', '낮은 온도로 적을 얼리면서 공격한다'),
('Warrior', 'Battle', 'R', 'Water', 2, 4, 3, 'Pick', 'Freeze', 0, 0, '미스트 스러스트', '안갯속에서 상대를 여러 번 벤다'),
('Warrior', 'Battle', 'R', 'Water', 8, 10, 1, 'Random', 'Freeze', 30, 3, '바다의 영광', '바다의 찬란함을 느끼며 공격한다'),

('Warrior', 'Battle', 'SR', 'Water', 13, 15, 1, 'Pick', 'Freeze', 30, 4, '아쿠아 크래시', '차가운 물로 둘러싸인 검으로 벤다'),
('Warrior', 'Event', 'SR', 'Water', 11, 12, 1, 'All', 'Freeze', 0, 0, '가속하는 물결', '연속으로 빠른 물결을 만든다'),
('Warrior', 'Event', 'SR', 'Water', 6, 7, 2, 'Random', 'Freeze', 10, 3, '심해의 투지', '심해의 기운을 받아 공격한다'),



-- 도적(풀) --
('Thief', 'Basic', 'N', 'Grass', 4, 7, 1, 'Pick', 'Poison', 0, 0, '풀의 표창', '잎사귀를 휘감은 표창을 던진다'),
('Thief', 'Battle', 'N', 'Grass', 5, 8, 1, 'Pick', 'Poison', 0, 0, '우드 클로', '나이프를 나무처럼 단단하게 만들어서 공격한다'),
('Thief', 'Battle', 'N', 'Grass', 5, 7, 1, 'Random', 'Poison', 0, 0, '꽃잎 기류', '빠르게 회전하면서 꽃잎을 흩날린다'),

('Thief', 'Battle', 'R', 'Grass', 7, 9, 1, 'All', 'Poison', 10, 2, '플랜트 존', '숲처럼 깊이 상대 전체를 공격한다'),
('Thief', 'Battle', 'R', 'Grass', 4, 5, 2, 'Pick', 'Poison', 10, 3, '아로마 스틸', '향기로 적을 혼란시킨 후 기력을 빼앗는다'),
('Thief', 'Battle', 'R', 'Grass', 2, 4, 3, 'Pick', 'Poison', 30, 3, '가시 찌르기', '가시가 돋아난 표창을 상대에게 여러 번 던진다'),
('Thief', 'Battle', 'R', 'Grass', 8, 10, 1, 'Random', 'Poison', 0, 0, '리프 스핀', '나뭇잎이 날리는 것처럼 회전하여 상대를 공격한다'),

('Thief', 'Battle', 'SR', 'Grass', 13, 15, 1, 'Pick', 'Poison', 30, 4, '그래스 슬래시', '자연의 힘을 모은 나이프로 썰어버린다'),
('Thief', 'Event', 'SR', 'Grass', 11, 12, 1, 'All', 'Poison', 0, 0, '내추럴 트릭', '자연이 놀랄 만큼 강한 기술을 선사한다'),
('Thief', 'Event', 'SR', 'Grass', 6, 7, 2, 'Random', 'Poison', 10, 3, '생명의 의지', '생명의 기운을 받아 공격한다'),

-- 도적(불) --
('Thief', 'Basic', 'N', 'Fire', 4, 7, 1, 'Pick', 'Burn', 0, 0, '불의 표창', '불꽃을 내뿜는 표창을 던진다'),
('Thief', 'Battle', 'N', 'Fire', 5, 8, 1, 'Pick', 'Burn', 0, 0, '스파크 클로', '나이프의 온도를 뜨겁게 높여서 공격한다'),
('Thief', 'Battle', 'N', 'Fire', 5, 7, 1, 'Random', 'Burn', 0, 0, '불꽃 기습', '강하고 빠른 불길을 만든다'),

('Thief', 'Battle', 'R', 'Fire', 7, 9, 1, 'All', 'Burn', 10, 2, '마그마 존', '마그마처럼 퍼지도록 상대 전체를 공격한다'),
('Thief', 'Battle', 'R', 'Fire', 4, 5, 2, 'Pick', 'Burn', 10, 3, '라이징 스틸', '높은 온도로 적을 고통스럽게 공격한다'),
('Thief', 'Battle', 'R', 'Fire', 2, 4, 3, 'Pick', 'Burn', 30, 3, '플레임 브레이크', '상대를 연소시켜서 활활 태워버린다'),
('Thief', 'Battle', 'R', 'Fire', 8, 10, 1, 'Random', 'Burn', 0, 0, '라바 스피어', '용암처럼 뜨거운 표창으로 화재를 일으킨다'),

('Thief', 'Battle', 'SR', 'Fire', 13, 15, 1, 'Pick', 'Burn', 30, 4, '파이어 슬래시', '불타오르는 나이프로 썰어버린다'),
('Thief', 'Event', 'SR', 'Fire', 11, 12, 1,  'All', 'Burn', 0, 0, '화염의 일격', '모든 상대에게 닿는 거대한 불꽃을 선사한다'),
('Thief', 'Event', 'SR', 'Fire', 6, 7, 2, 'Random', 'Burn', 10, 3, '태양의 의지', '태양의 기운을 받아 공격한다'),

-- 도적(물) --
('Thief', 'Basic', 'N', 'Water', 4, 7, 1, 'Pick', 'Freeze', 0, 0, '물의 표창', '물을 머금은 표창을 던진다'),
('Thief', 'Battle', 'N', 'Water', 5, 8, 1, 'Pick', 'Freeze', 0, 0, '아이스 클로', '나이프를 차갑게 얼려서 공격한다'),
('Thief', 'Battle', 'N', 'Water', 5, 7, 1, 'Random', 'Freeze', 0, 0, '다이브 펀치', '커다란 물을 품고 상대 모두를 가격한다'),

('Thief', 'Battle', 'R', 'Water', 7, 9, 1, 'All', 'Freeze', 10, 2, '오션 존', '바다처럼 널리 상대 전체를 공격한다'),
('Thief', 'Battle', 'R', 'Water', 4, 5, 2, 'Pick', 'Freeze', 10, 3, '프로즌 스틸', '낮은 온도로 적을 얼리면서 공격한다'),
('Thief', 'Battle', 'R', 'Water', 2, 4, 3, 'Pick', 'Freeze', 0, 0, '미스트 스로우', '안갯속에서 상대를 여러 번 찌른다'),
('Thief', 'Battle', 'R', 'Water', 8, 10, 1, 'Random', 'Freeze', 30, 3, '바다의 명예', '바다의 찬란함을 느끼며 공격한다'),

('Thief', 'Battle', 'SR', 'Water', 13, 15, 1, 'Pick', 'Freeze', 30, 4, '아쿠아 슬래시', '차가운 물로 둘러싸인 나이프로 썰어버린다'),
('Thief', 'Event', 'SR', 'Water', 11, 12, 1, 'All', 'Freeze', 0, 0, '엄습하는 물결', '연속으로 빠른 물결을 만든다'),
('Thief', 'Event', 'SR', 'Water', 6, 7, 2, 'Random', 'Freeze', 10, 3, '심해의 의지', '심해의 기운을 받아 공격한다'),



-- 마법사(풀) --
('Mage', 'Basic', 'N', 'Grass', 4, 7, 1, 'Pick', 'Poison', 0, 0, '풀의 마나', '잎사귀를 휘감은 덩어리를 발사한다'),
('Mage', 'Battle', 'N', 'Grass', 5, 8, 1, 'Pick', 'Poison', 0, 0, '우드 오브', '마력을 모아 나무처럼 단단하게 만들어서 공격한다'),
('Mage', 'Battle', 'N', 'Grass', 5, 7, 1, 'Random', 'Poison', 0, 0, '꽃잎 폭풍', '빠르게 회전하는 바람을 일으켜 꽃잎을 흩날린다'),

('Mage', 'Battle', 'R', 'Grass', 7, 9, 1, 'All', 'Poison', 10, 2, '플랜트 필드', '숲처럼 깊이 상대 전체를 공격한다'),
('Mage', 'Battle', 'R', 'Grass', 4, 5, 2, 'Pick', 'Poison', 10, 3, '아로마 플레어', '향기로 상대를 유혹한 후 폭발시킨다'),
('Mage', 'Battle', 'R', 'Grass', 2, 4, 3, 'Pick', 'Poison', 30, 3, '가시 발사', '가시를 만들어 상대에게 발사한다'),
('Mage', 'Battle', 'R', 'Grass', 8, 10, 1, 'Random', 'Poison', 0, 0, '리프 슬라이드', '나뭇잎을 회전시켜 상대를 공격한다'),

('Mage', 'Battle', 'SR', 'Grass', 13, 15, 1, 'Pick', 'Poison', 30, 4, '그래스 버스트', '자연의 힘을 모은 마법을 발사한다'),
('Mage', 'Event', 'SR', 'Grass', 11, 12, 1, 'All', 'Poison', 0, 0, '내추럴 블레싱', '자연의 축복을 받는다'),
('Mage', 'Event', 'SR', 'Grass', 6, 7, 2, 'Random', 'Poison', 10, 3, '생명의 심지', '생명의 기운을 받아 공격한다'),

-- 마법사(불) --
('Mage', 'Basic', 'N', 'Fire', 4, 7, 1, 'Pick', 'Burn', 0, 0, '불의 마나', '불꽃을 내뿜는 덩어리를 발사한다'),
('Mage', 'Battle', 'N', 'Fire', 5, 8, 1, 'Pick', 'Burn', 0, 0, '스파크 오브', '마력을 모아 온도를 뜨겁게 높여서 공격한다'),
('Mage', 'Battle', 'N', 'Fire', 5, 7, 1, 'Random', 'Burn', 0, 0, '불꽃 숨결', '강하고 빠른 불길을 만든다'),

('Mage', 'Battle', 'R', 'Fire', 7, 9, 1, 'All', 'Burn', 10, 2, '마그마 필드', '마그마처럼 퍼지도록 상대 전체를 공격한다'),
('Mage', 'Battle', 'R', 'Fire', 4, 5, 2, 'Pick', 'Burn', 10, 3, '라이징 플레어', '높은 온도로 적을 고통스럽게 공격한다'),
('Mage', 'Battle', 'R', 'Fire', 2, 4, 3, 'Pick', 'Burn', 30, 3, '플레임 블로우', '상대를 연소시켜서 활활 태워버린다'),
('Mage', 'Battle', 'R', 'Fire', 8, 10, 1, 'Random', 'Burn', 0, 0, '라바 매직', '용암처럼 뜨거운 마법으로 화재를 일으킨다'),

('Mage', 'Battle', 'SR', 'Fire', 13, 15, 1, 'Pick', 'Burn', 30, 4, '파이어 버스트', '불타오르는 마력을 발사한다'),
('Mage', 'Event', 'SR', 'Fire', 11, 12, 1, 'All', 'Burn', 0, 0, '화염의 폭격', '모든 상대에게 닿는 거대한 불꽃을 선사한다'),
('Mage', 'Event', 'SR', 'Fire', 6, 7, 2, 'Random', 'Burn', 10, 3, '태양의 심지', '태양의 기운을 받아 공격한다'),


-- 마법사(물) --
('Mage', 'Basic', 'N', 'Water', 4, 7, 1, 'Pick', 'Freeze', 0, 0, '물의 마나', '물을 머금은 덩어리를 발사한다'),
('Mage', 'Battle', 'N', 'Water', 5, 8, 1, 'Pick', 'Freeze', 0, 0, '아이스 오브', '마력을 모아 차갑게 얼려서 공격한다'),
('Mage', 'Battle', 'N', 'Water', 5, 7, 1, 'Random', 'Freeze', 0, 0, '다이브 볼', '커다란 물을 품고 상대 모두에게 발사한다'),

('Mage', 'Battle', 'R', 'Water', 7, 9, 1, 'All', 'Freeze', 10, 2, '오션 필드', '바다처럼 널리 상대 전체를 공격한다'),
('Mage', 'Battle', 'R', 'Water', 4, 5, 2, 'Pick', 'Freeze', 10, 3, '프로즌 플레어', '낮은 온도로 적을 얼리면서 공격한다'),
('Mage', 'Battle', 'R', 'Water', 2, 4, 3, 'Pick', 'Freeze', 0, 0, '미스트 제네시스', '안갯속에서 상대를 여러 번 공격한다'),
('Mage', 'Battle', 'R', 'Water', 8, 10, 1, 'Random', 'Freeze', 30, 3, '바다의 광휘', '바다의 찬란함을 느끼며 공격한다'),

('Mage', 'Battle', 'SR', 'Water', 13, 15, 1, 'Pick', 'Freeze', 30, 4, '아쿠아 버스트', '차가운 물로 둘러싼 마력을 발사한다'),
('Mage', 'Event', 'SR', 'Water', 11, 12, 1, 'All', 'Freeze', 0, 0, '밀려오는 물결', '연속으로 빠른 물결을 만든다'),
('Mage', 'Event', 'SR', 'Water', 6, 7, 2, 'Random', 'Freeze', 10, 3, '심해의 심지', '심해의 기운을 받아 공격한다'),



-- 공용 (무속성) --
('Common', 'Basic', 'N', 'None', 5, 7, 1, 'Pick', 'Stun', 0, 0, '휘두르기', '무기를 여러 번 휘두른다'),
('Common', 'Basic', 'N', 'None', 5, 7, 1, 'Pick', 'Stun', 0, 0, '던지기', '주변에 있는 물체를 주워서 던진다'),
('Common', 'Basic', 'N', 'None', 5, 7, 1, 'Pick', 'Stun', 0, 0, '박치기', '온몸을 던져 상대를 공격한다'),

('Common', 'Basic', 'R', 'None', 8, 10, 1, 'Pick', 'Burn', 10, 2, '광선', '빛의 레이저로 공격한다'),
('Common', 'Basic', 'R', 'None', 8, 10, 1, 'Pick', 'Poison', 10, 2, '독침', '독이 묻어있는 침으로 공격한다'),
('Common', 'Basic', 'R', 'None', 8, 10, 1, 'Pick', 'Freeze', 10, 2, '설경', '눈을 던져서 공격한다'),
('Common', 'Basic', 'R', 'None', 7, 9, 2, 'Random', 'Stun', 10, 2, '분노', '분노를 담아 상대를 마구 공격한다'),

('Common', 'Event', 'SR', 'None', 10, 11, 0, 'All', 'Stun', 30, 3, '매혹의 노래', '상대를 유혹하는 노래를 부르며 공격한다'),
('Common', 'Event', 'SR', 'None', 12, 14, 0, 'Pick', 'Stun', 30, 3, '승리의 기도', '하늘에 기도를 올려 특별한 힘을 받아 공격한다'),
('Common', 'Event', 'SR', 'None', 10, 12, 0, 'Random', 'Stun', 30, 3, '혼돈의 춤', '혼란스러운 춤을 추며 공격한다')
