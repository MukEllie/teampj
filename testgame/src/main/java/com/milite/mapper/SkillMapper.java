package com.milite.mapper;

import java.util.List;

import com.milite.dto.SkillDto;

public interface SkillMapper {
	public SkillDto getSkillInfo(Integer skillID);
	public List<SkillDto> getSkillReward(String job, String rarity);
}
