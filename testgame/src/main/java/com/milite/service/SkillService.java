package com.milite.service;

import java.util.List;
import java.util.Map;

import com.milite.dto.SkillDto;

public interface SkillService {
	// 스킬 정보 조회(id를 어떤 식으로 입력해도 괜찮게 두 개 제작)
	public SkillDto getSkillInfo(Integer skillID);
	public SkillDto getSkillInfo(String skillID);
	
	// 조건에 맞는 스킬 리스트 뽑기
	public List<SkillDto> getSkillReward(String job, String rarity, String type, String element);
	
	// 유저의 스킬 리스트 가져오기
	public List<SkillDto> getPlayerSkillList(String playerID);
	
	// 유저의 스킬 리스트를 문자열로 전환
	public String convertSkillListToString(List<SkillDto> skillList);
	
	// 유저가 새로운 스킬을 추가할지, 교체할지 정하기
	public String managePlayerSkill(String playerID, String newSkillID);
	
	// 스킬 추가하기
	public String addSkillToPlayer(String playerID, String newSkillID);
	
	// 스킬 교체하기
	public String replacePlayerSkill(String playerID, String oldSkillID, String newSkillID);
	
	// 보유중인 스킬이 몇 개인지 반환
	public int getOwnedSkillCount(String playerID);
	
	public List<SkillDto> getOwnSkillList(String playerID);
	
	public List<SkillDto> getUsingSkillList(String playerID);
	
	public boolean isOwnSkill(String playerID, String skillID);
	
	public Map<String, Object> setUsingSkill(String playerID, String skillID);
	
	public Map<String, Object> validateUsingSkill(String playerID, List<String> skillIDs);
}
