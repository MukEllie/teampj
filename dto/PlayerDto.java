package com.milite.dto;

import lombok.*;
import com.milite.battle.BattleUnit;
import java.util.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerDto implements BattleUnit{
	String PlayerID;
	String Using_Character;
	int curr_hp;
	int max_hp;
	int atk;
	int luck;
	String WhereSession;
	int WhereStage;
	Map<String, Integer> statusEffects = new HashMap<>();
	//private booleanSwiftSkill = false;
	
	@Override
	public String getName() {
		return this.Using_Character;
	}
	
	@Override
	public int getHp() {
		return this.curr_hp;
	}
	
	@Override
	public boolean isAlive() {
		return this.curr_hp > 0;
	}
	
	@Override
	public String getUnitType() {
		return "Player";
	}
	
	@Override
	public boolean hasPlayerPriority() {
		return true;
	}
	
	@Override
	public Map<String, Integer> getStatusEffects(){
		return this.statusEffects;
	}
	
	@Override
	public void setStatusEffects(Map<String, Integer> statusEffects) {
		this.statusEffects = statusEffects;
	}
}
