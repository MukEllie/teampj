package com.milite.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillDto {
	Integer skill_id; 
	String skill_job; // Warrior, Thief, Mage, Common
	String skill_type; // Basic, Battle, Event
	String rarity; // N, R, SR
	String element; // Fire, Water, Grass, None
	
	Integer min_damage;
	Integer max_damage;
	Integer hit_time;
	String hit_target;
	
	String statusEffect_name; // Burn, Poison, Freeze, Stun
	Integer statusEffect_rate;
	Integer statusEffect_turn;
	
	String skill_name;
	String skill_text;
	
	//int image_ID; 현재 DB에 구현되어있지 않음
}