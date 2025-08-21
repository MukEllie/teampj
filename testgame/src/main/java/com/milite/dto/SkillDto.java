package com.milite.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillDto {
	String skill_ID;
	String skill_Job; // 전사 도적 마법사 공용
	String skill_Type; // BattleCard, EventCard
	String rarity;
	String element;
	int min_damage;
	int max_damage;
	int hit_time;
	String target;

	String statusEffectName;
	Integer statusEffectRate;
	Integer statusEffectTurn;

	int image_ID;

	// 새로 추가
	String skill_name;
	String skill_text;
}