use testgame;

select * from CharacterDB;

create table CharacterDB (
name varchar(20),
hp int,
atk int,
luck int
);

insert into CharacterDB values ("Warrior", 100, 10, 5);
insert into CharacterDB values ("Thief", 90, 5, 10);
insert into CharacterDB values ("Mage", 80, 15, 3);

drop table CharacterDB;

CREATE TABLE MonsterDB (
    MonsterID INT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Session VARCHAR(20) NOT NULL,
    Type VARCHAR(20) NOT NULL,
    Element VARCHAR(10) NOT NULL,
    min_hp INT NOT NULL,
    max_hp INT NOT NULL,
    min_atk INT NOT NULL,
    max_atk INT NOT NULL,
    luck INT NOT NULL,
    Special TEXT,
    Description TEXT
);

-- 데이터 삽입
INSERT INTO MonsterDB (MonsterID, Name, Session, Type, Element, min_hp, max_hp, min_atk, max_atk, luck, Special, Description) VALUES
(10, '미공수', 'Fire', 'Boss', 'Fire', 200, 200, 13, 13, 5, 'BraveBite', '공포심이 없는 짐승, 자신을 공격하는 자를 언제나 물어뜯을 준비가 되어있다'),
(20, '미형수', 'Water', 'Boss', 'Water', 220, 220, 10, 10, 5, 'FormChange', '형태 없는 물, 그 모습을 바꿔가며 적을 잡아먹는다'),
(30, '미지수', 'Grass', 'Boss', 'Grass', 250, 250, 8, 8, 5, 'ThreeChance', '알 수 없는 거대한 나무, 일정 주기로 그 거대한 몸체로 짓누른다'),
(11, '타오르는 갑옷', 'Fire', 'MiddleBoss', 'Fire', 120, 120, 10, 10, 5, 'FlameArmor', '불꽃에 휩싸여있는 갑옷, 공격하기 위해 다가가면 그 열기에 상처입을 것 같다'),
(21, '거대한 슬라임', 'Water', 'MiddleBoss', 'Water', 150, 150, 6, 6, 5, 'PropertyChange', '포식과 휴식을 반복하는 거대한 슬라임, 포식하는 순간이 가장 위험하지만 가장 좋은 기회다'),
(31, '나무지기', 'Grass', 'MiddleBoss', 'Grass', 180, 180, 6, 6, 5, 'ThreeStack', '거대한 나무를 지키는 자, 일정 주기로 강력한 공격을 해온다'),
(12, '자그마한 불똥', 'Fire', 'Common', 'Fire', 15, 20, 5, 6, 5, NULL, '어디선가 붙은 불, 물 뿌려서 끄기엔 늦은 것 같다'),
(13, '불을 두른 도마뱀', 'Fire', 'Common', 'Fire', 20, 25, 3, 5, 5, NULL, '불타오르는 것처럼 보이는 도마뱀, 보기보단 안뜨겁다'),
(14, '검은 물', 'Fire', 'Common', 'Water', 25, 30, 3, 5, 5, NULL, '그저 검은 물, 불을 붙이는 건 좋지 않은 생각인 것 같다'),
(15, '붉은 얼음', 'Fire', 'Common', 'Water', 18, 22, 5, 7, 5, NULL, '붉은 색의 얼음, 이 더운 곳에서 얼어있는 것을 보니 정상적인 무언가는 아니다'),
(16, '풀잎새', 'Fire', 'Common', 'Grass', 35, 40, 2, 3, 5, 'Swift', '풀잎처럼 생긴 새. 여간 재빠른게 아니다'),
(17, '검은 나무', 'Fire', 'Common', 'Grass', 11, 15, 7, 9, 5, NULL, '그을린 듯이 새까만 나무, 다행히 단단하진 않다'),
(22, '용암 거인', 'Water', 'Common', 'Fire', 40, 45, 3, 5, 5, NULL, '사람 형태의 용암, 튼튼해보인다'),
(23, '불타는 액체', 'Water', 'Common', 'Fire', 15, 20, 3, 8, 5, NULL, '불이 붙은 투명한 액체, 활활 타오르며 스스로 증발하고 있는 것처럼 보인다'),
(24, '물방울', 'Water', 'Common', 'Water', 20, 25, 6, 8, 5, NULL, '떠다니는 물방울, 시원하지만 마시면 배탈날 것 같다'),
(25, '무지개빛 구슬', 'Water', 'Common', 'Water', 30, 33, 11, 5, 5, 'Blind', '색이 시시각각 변하는 이상한 구슬, 위험도도 시시각각 변한다'),
(26, '거미', 'Water', 'Common', 'Grass', 10, 16, 8, 8, 4, NULL, '흔히 보이는 거미, 집은 안짓고 직접 먹잇감을 덮친다'),
(27, '뿔난 소', 'Water', 'Common', 'Grass', 25, 35, 7, 8, 3, NULL, '말 그대로 뿔이 난 소, 언제나 돌진할 준비가 되어있다'),
(32, '풀로 가려진 불', 'Grass', 'Common', 'Fire', 23, 27, 5, 10, 5, NULL, '풀로 가려진 불꽃, 언제라도 주변 풀을 연료삼아 커질 것 같다'),
(33, '불을 두른 말', 'Grass', 'Common', 'Fire', 30, 32, 5, 7, 5, NULL, '불을 두른 채 달리는 말, 멀리까지 달릴 수 있을 것 같다'),
(34, '이끼정령', 'Grass', 'Common', 'Water', 19, 26, 8, 12, 2, NULL, '이끼로 덮여 원래 무슨 정령인지도 알아보기 힘든 정령, 축축하다'),
(35, '늪에 숨은 것', 'Grass', 'Common', 'Water', 30, 35, 8, 12, 0, NULL, '늪에서 살고 있는 무언가, 정체가 뭔지는 알 수 없지만 상당히 위험해보인다'),
(36, '이끼골렘', 'Grass', 'Common', 'Grass', 40, 45, 3, 6, 5, 'Immun', '이끼로 덮인 골렘, 몸이 매우 단단하고 매우 둔감해보인다'),
(37, '우거진 수풀들', 'Grass', 'Common', 'Grass', 16, 30, 5, 7, 5, NULL, '다양한 수풀들이 얽혀 움직이는 것, 얽힌 수풀에 따라 강함이 달라진다'),
(41, '쌍칼잡이', 'Fire', 'Common', 'None', 30, 35, 3, 5, 5, 'DoubleAttack', '검 두 자루를 들고 있는 자, 무리해서 두 자루를 동시에 휘두르려 하고 있다'),
(42, '오크', 'Fire', 'Common', 'None', 40, 42, 5, 7, 5, NULL, '맨손의 오크, 무기는 없다지만 그 육체는 여전히 위협적이다'),
(43, '거머리', 'Water', 'Common', 'None', 22, 25, 8, 12, 3, 'BloodSuck', '달라붙는 거머리, 그 이빨은 매우 날카롭게 피를 탐하려 한다'),
(44, '작은 해골', 'Water', 'Common', 'None', 20, 25, 4, 5, 10, NULL, '어느 작은 생물의 해골, 작기에 약하나 작기에 날렵하다'),
(45, '꽃풀찾이', 'Grass', 'Common', 'None', 40, 45, 2, 3, 0, 'Recovery', '언제나 꽃풀을 찾아다니며 수집하는 동물, 몸에 지닌 꽃풀은 항상 활력을 복돋는다'),
(46, '송곳니 늑대', 'Grass', 'Common', 'None', 30, 30, 7, 10, 5, NULL, '날카로운 송곳니의 늑대, 무리 생활은 하지 않지만 그만큼 은밀하게 기회를 노린다'),
(51, '혼령의 인도인', 'None', 'Unique', 'None', 300, 300, 20, 20, 0, 'Summon', '떠도는 혼을 인도하는 이, 살아있는 생명이여 그 모습을 드러내지 말지어다'),
(52, '사로잡힌 혼', 'None', 'Servant', 'None', 20, 20, 5, 5, -50, NULL, '옛날 옛 적 혼령의 인도인의 앞에 나타났던 이');