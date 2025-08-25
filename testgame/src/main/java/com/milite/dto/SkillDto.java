package com.milite.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillDto {
	Integer skill_id; 
	String skill_job; // 전사 도적 마법사 공용
	String skill_type; // BattleCard, EventCard
	String rarity;
	String element;
	
	Integer min_damage;
	Integer max_damage;
	Integer hit_time;
	String hit_target;
	
	String statusEffect_name;
	Integer statusEffect_rate;
	Integer statusEffect_turn;
	
	String skill_name;
	String skill_text;
	
	//int image_ID;
}