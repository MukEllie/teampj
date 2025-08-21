package com.milite.service;

import java.util.Map;

import com.milite.dto.BattleResultDto;
import com.milite.dto.SkillDto;

public interface BattleService {
	public BattleResultDto battle(String PlayerId);
	
	public BattleResultDto processNextAction(String playerID, SkillDto playerSkill, Integer targetIndex);
	
	public Map<String, Object> getBattleStatus(String playerID);
}
