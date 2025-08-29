package com.milite.service;

import java.util.List;

import com.milite.dto.SkillDto;

public interface SkillService {
	public SkillDto getSkillInfo(Integer skillID);
	public List<SkillDto> getSkillReward(String job, String rarity, String type, String element);
	
	public List<SkillDto> getPlayerSkillList(String playerID);
	
	public String convertSkillListToString(List<SkillDto> skillList);
	
	public String managePlayerSkill(String playerID, String newSkillID);
	
	public String addPlayerSkill(String playerID, String newSkillID);
	
	public String replacePlayerSkill(String playerID, String oldSkillID, String newSkillID);
	
	public int getOwnedSkillCount(String playerID);
}
