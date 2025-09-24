package com.milite.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.milite.dto.SkillDto;

public interface SkillMapper {
	// @param : Skill의 ID @return : 스킬의 정보(Dto 형태)
	public SkillDto getSkillInfo(Integer skillID);

	public SkillDto getSkillInfoByString(String skillID);

	// @param : 캐릭터의 직업, 스킬의 희귀도, 스킬의 획득처, 스킬의 속성 @return : 해당 조건들에 맞는 스킬들의 목록
	public List<SkillDto> getSkillReward(String job, String rarity, String type, String element);

	/*
	 * 기본 스킬 ID 조회 — rarity='N' AND skill_type='Basic' AND (skill_job=직업 OR
	 * 'Common')
	 */
	List<Integer> findDefaultSkillIds(@Param("job") String job);

}
