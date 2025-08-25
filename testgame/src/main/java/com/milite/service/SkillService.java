package com.milite.service;

import java.util.List;

import com.milite.dto.SkillDto;

public interface SkillService {
	public SkillDto getSkillInfo(Integer skillID);

	public List<SkillDto> getSkillReward(String job, String rarity);
}
