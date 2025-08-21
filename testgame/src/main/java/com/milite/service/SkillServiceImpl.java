package com.milite.service;

import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.milite.dto.SkillDto;
import com.milite.mapper.SkillMapper;
import com.milite.util.CommonUtil;

import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class SkillServiceImpl implements SkillService {
	@Setter(onMethod_ = @Autowired)
	private SkillMapper mapper;

	@Override
	public SkillDto getSkillInfo(String SkillID) {
		return mapper.getSkillInfo(SkillID);
	}
	
	@Override
	public List<SkillDto> getSkillReward(String job, String Rarity){
		return mapper.getSkillReward(job, Rarity);
	}
	
	public SkillDto getRewardSkill(List<SkillDto> SkillList) {
		int r = CommonUtil.Dice(SkillList.size());
		SkillDto RewardSkill = SkillList.get(r-1);
		return RewardSkill;
	}
}
