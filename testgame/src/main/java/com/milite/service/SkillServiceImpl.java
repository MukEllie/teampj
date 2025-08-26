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
	public SkillDto getSkillInfo(Integer skillID) {
		return mapper.getSkillInfo(skillID);
	}

	@Override
	public List<SkillDto> getSkillReward(String job, String rarity, String type, String element) {
		return mapper.getSkillReward(job, rarity, type, element);
	}

	public List<SkillDto> getSkillReward(String job, String rarity) {
		return getSkillReward(job, rarity, "Battle", null);
	}

	public List<SkillDto> getSkillEvent(String job, String type, String element) {
		// 필요하다면 type 파라미터 삭제 후 직접 "Event" 입력
		return getSkillReward(job, null, type, element);
	}

	public SkillDto getRewardSkill(List<SkillDto> skillList) {
		if (skillList == null || skillList.isEmpty()) {
			log.warn("빈 스킬 리스트");
			return null;
		}
		int r = CommonUtil.Dice(skillList.size());
		SkillDto rewardSkill = skillList.get(r - 1);
		log.info("선택된 스킬: " + rewardSkill.getSkill_name() + " (" + rewardSkill.getRarity() + ")");
		return rewardSkill;
	}
}
