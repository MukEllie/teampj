package com.milite.mapper;

import java.util.List;
import com.milite.dto.SkillDto;

public interface SkillMapper {
	//@param : Skill의 ID @return : 스킬의 정보(Dto 형태)
	public SkillDto getSkillInfo(Integer skillID);
	public SkillDto getSkillInfoByString(String skillID);
	
	//@param : 캐릭터의 직업, 스킬의 희귀도, 스킬의 획득처, 스킬의 속성 @return : 해당 조건들에 맞는 스킬들의 목록
	public List<SkillDto> getSkillReward(String job, String rarity, String type, String element);

}
