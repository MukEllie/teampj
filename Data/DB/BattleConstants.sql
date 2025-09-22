USE tesplayerdbplayerdbcharacterdbcharacterdbartifactdbartifactdbtgame;

select * from Battle_Constants;
-- 테이블 생성
CREATE TABLE Battle_Constants (
    name VARCHAR(50) PRIMARY KEY,
    value DECIMAL(10,3) NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT
);

-- ================================================
-- 시스템 기본 상수들
-- ================================================
INSERT INTO Battle_Constants (name, value, type, description) VALUES
-- 상태이상 관련
('system_burn_damage', 3, 'SYSTEM', '화상 상태이상 턴당 고정 피해량'),
('system_base_dodge_roll', 15, 'SYSTEM', '기본 회피 판정 주사위 범위'),
('system_dodge_multiplier', 2, 'SYSTEM', '회피 계산 시 행운 배수'),
('system_blind_dodge_bonus', 50, 'SYSTEM', '실명 상태 시 명중률 감소량'),

-- 전투 시스템
('system_battle_atk_divisor', 5, 'SYSTEM', '공격력을 데미지로 변환할 때 나누는 수'),
('system_battle_hit_roll_max', 100, 'SYSTEM', '명중 판정 최대 주사위 값'),

-- 특별 몬스터 ID
('system_summon_master_id', 51, 'SYSTEM', '혼령의 인도인 몬스터 ID'),
('system_servant_monster_id', 52, 'SYSTEM', '사로잡힌 혼 몬스터 ID'),

-- ================================================
-- 특수능력 상수들
-- ================================================
-- 회복/흡혈 관련
('ability_blood_suck_ratio', 0.5, 'ABILITY', '흡혈 시 피해량 대비 회복 비율'),
('ability_recovery_amount', 4, 'ABILITY', '꽃풀찾이 턴 시작 시 회복량'),

-- 반사 데미지
('ability_brave_bite_reflect', 3, 'ABILITY', '용맹한 이빨 피격 시 반사 데미지'),
('ability_flame_armor_reflect', 3, 'ABILITY', '불꽃 갑옷 턴당 반사 데미지'),

-- 공격력 증가
('ability_three_chance_multiplier', 1.5, 'ABILITY', '3찬스 3배수 턴 공격력 배수'),
('ability_three_stack_multiplier', 1.333, 'ABILITY', '3스택 3배수 턴 공격력 배수'),

-- 태세 변경 (FormChange)
('ability_form_change_offense_atk', 1.3, 'ABILITY', '폼체인지 공격태세 공격력 배수'),
('ability_form_change_offense_def', 1.3, 'ABILITY', '폼체인지 공격태세 피해 증가 배수'),
('ability_form_change_defense_atk', 0.7, 'ABILITY', '폼체인지 방어태세 공격력 감소 배수'),
('ability_form_change_defense_def', 0.7, 'ABILITY', '폼체인지 방어태세 피해 감소 배수'),

-- 모드 변경 (ModeSwitch)
('ability_mode_switch_offense_atk', 1.2, 'ABILITY', '모드스위치 포식모드 공격력 배수'),
('ability_mode_switch_offense_def', 1.2, 'ABILITY', '모드스위치 포식모드 피해 증가 배수'),
('ability_mode_switch_defense_atk', 0.8, 'ABILITY', '모드스위치 휴식모드 공격력 감소 배수'),
('ability_mode_switch_defense_def', 0.8, 'ABILITY', '모드스위치 휴식모드 피해 감소 배수'),

-- 상태이상 부여
('ability_blind_chance', 25, 'ABILITY', '실명 상태이상 부여 확률 (%)'),
('ability_blind_turn', 1, 'ABILITY', '실명 상태이상 지속 턴 수'),

-- 소환 관련
('ability_summon_chance', 25, 'ABILITY', '혼령 소환 확률 (%)'),
('ability_summon_max_servants', 2, 'ABILITY', '최대 소환 가능한 하수인 수'),

-- ================================================
-- 아티팩트 효과 상수들
-- ================================================
-- 속성별 데미지 증가 아티팩트
('artifact_fighter_guild_damage', 2, 'ARTIFACT', '파이터 길드 메달 - 무속성 데미지 증가량'),
('artifact_lava_stone_damage', 2, 'ARTIFACT', '작열하는 용암석 - 불속성 데미지 증가량'),
('artifact_blue_trident_damage', 2, 'ARTIFACT', '푸른 빛의 삼지창 - 물속성 데미지 증가량'),
('artifact_druid_belt_damage', 2, 'ARTIFACT', '드루이드의 벨트 - 풀속성 데미지 증가량'),

-- 상성 관련 아티팩트
('artifact_element_stone_bonus', 0.1, 'ARTIFACT', '원소의 돌 - 우세 상성 시 추가 배율'),
('artifact_magic_amulet_bonus', 0.1, 'ARTIFACT', '마법사의 부적 - 약세 상성 시 추가 배율'),
('artifact_forbidden_scroll_advantage', 0.2, 'ARTIFACT', '금단의 주문서 - 우세 상성 추가 배율'),
('artifact_forbidden_scroll_disadvantage', 0.2, 'ARTIFACT', '금단의 주문서 - 약세 상성 배율 감소'),

-- 상태이상 관련 아티팩트
('artifact_dry_wood_burn_bonus', 1, 'ARTIFACT', '잘 마른 나무 - 화상 데미지 증가량'),
('artifact_poison_needle_stack_ratio', 0.5, 'ARTIFACT', '바늘 달린 독 장치 - 중독 스택 추가 피해 비율'),
('artifact_dark_hammer_stun_bonus', 1, 'ARTIFACT', '어두운 망치 - 기절 지속시간 증가 턴'),

-- 방어/회피 관련 아티팩트
('artifact_broken_blade_reflect', 2, 'ARTIFACT', '부서진 칼날 - 피격 시 반사 데미지'),
('artifact_gray_cloak_dodge', 5, 'ARTIFACT', '회색 망토 - 회피율 증가 (5%)'),
('artifact_blurry_lens_hit', 5, 'ARTIFACT', '흐릿한 렌즈 - 적 회피율 감소 (5%)'),

-- 회복 관련 아티팩트
('artifact_sea_heart_heal_per_turn', 5, 'ARTIFACT', '바다의 심장 - 매턴 회복량'),
('artifact_deeps_pearl_heal_on_hit', 2, 'ARTIFACT', '심해의 진주 - 공격 명중 시 회복량'),
('artifact_black_coral_heal_on_attack', 3, 'ARTIFACT', '검은 산고 - 공격 시 회복량'),

-- 특수 효과 아티팩트
('artifact_phoenix_feather_revival_hp', 0.5, 'ARTIFACT', '불사조의 하얀 깃털 - 부활 시 회복 비율 (50%)'),
('artifact_shadow_device_extra_attack', 1, 'ARTIFACT', '그림자 생성 장치 - 추가 공격 횟수'),

-- ================================================
-- 속성 상성표
-- ================================================
-- 불속성 공격
('element_fire_vs_grass', 1.2, 'ELEMENT', '불속성이 풀속성 공격 시 데미지 배수'),
('element_fire_vs_water', 0.8, 'ELEMENT', '불속성이 물속성 공격 시 데미지 배수'),
('element_fire_vs_fire', 1.0, 'ELEMENT', '불속성이 불속성 공격 시 데미지 배수'),
('element_fire_vs_none', 1.0, 'ELEMENT', '불속성이 무속성 공격 시 데미지 배수'),

-- 물속성 공격
('element_water_vs_fire', 1.2, 'ELEMENT', '물속성이 불속성 공격 시 데미지 배수'),
('element_water_vs_grass', 0.8, 'ELEMENT', '물속성이 풀속성 공격 시 데미지 배수'),
('element_water_vs_water', 1.0, 'ELEMENT', '물속성이 물속성 공격 시 데미지 배수'),
('element_water_vs_none', 1.0, 'ELEMENT', '물속성이 무속성 공격 시 데미지 배수'),

-- 풀속성 공격
('element_grass_vs_water', 1.2, 'ELEMENT', '풀속성이 물속성 공격 시 데미지 배수'),
('element_grass_vs_fire', 0.8, 'ELEMENT', '풀속성이 불속성 공격 시 데미지 배수'),
('element_grass_vs_grass', 1.0, 'ELEMENT', '풀속성이 풀속성 공격 시 데미지 배수'),
('element_grass_vs_none', 1.0, 'ELEMENT', '풀속성이 무속성 공격 시 데미지 배수'),

-- 무속성 공격
('element_none_vs_fire', 1.0, 'ELEMENT', '무속성이 불속성 공격 시 데미지 배수'),
('element_none_vs_water', 1.0, 'ELEMENT', '무속성이 물속성 공격 시 데미지 배수'),
('element_none_vs_grass', 1.0, 'ELEMENT', '무속성이 풀속성 공격 시 데미지 배수'),
('element_none_vs_none', 1.0, 'ELEMENT', '무속성이 무속성 공격 시 데미지 배수'),

-- ================================================
-- 몬스터 생성 관련 상수들
-- ================================================
('monster_stage_1_3_dice', 4, 'MONSTER', '1-3스테이지 몬스터 선택 주사위'),
('monster_stage_4_7_max_count', 2, 'MONSTER', '4,6,7스테이지 최대 몬스터 수'),
('monster_stage_8_9_count', 2, 'MONSTER', '8-9스테이지 고정 몬스터 수'),

-- ================================================
-- 상태이상 기본 지속시간
-- ================================================
('status_default_burn_turns', 3, 'STATUS', '화상 기본 지속 턴 수'),
('status_default_poison_turns', 2, 'STATUS', '중독 기본 지속 턴 수'),
('status_default_freeze_turns', 1, 'STATUS', '빙결 기본 지속 턴 수'),
('status_default_stun_turns', 1, 'STATUS', '기절 기본 지속 턴 수'),
('status_default_blind_turns', 1, 'STATUS', '실명 기본 지속 턴 수'),

-- ================================================
-- 전투　보상　관련　상수들
-- ================================================
('reward_skill_sr_chance', 10, 'REWARD' , 'SR 등급 스킬 등장 확률'),
('reward_skill_r_chance', 30, 'REWARD', 'R 등급 스킬 등장 확률'),
('reward_skill_n_chance', 60, 'REWARD', 'N 등급 스킬 등장 확률'),

('reward_artifact_drop_chance', 30, 'REWARD', '아티팩트 등장 확률'),
('artifact_shadow_device_id', 121,'ARTIFACT', '그림자 생성장치 아티팩트 ID'),

('reward_skill_choice_count', 3, 'REWARD' , '스킬 선택지 개수'),

('reward_gold_boss_clear',100,'REWARD','보스 클리어 골드 보상');