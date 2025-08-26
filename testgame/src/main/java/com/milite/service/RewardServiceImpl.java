package com.milite.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;

import com.milite.dto.*;
import com.milite.mapper.*;
import com.milite.util.*;
import com.milite.constants.BattleConstants;

import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class RewardServiceImpl implements RewardService {
	@Setter(onMethod_ = @Autowired)
	private CharacterStatusMapper characterMapper;

	@Setter(onMethod_ = @Autowired)
	private SkillService skillService;

	@Setter(onMethod_ = @Autowired)
	private ArtifactMapper artifactMapper;

	@Override
	public RewardDto generateBattleReward(String playerID) {
		log.info("보상 생성 시작 : " + playerID);

		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null) {
				return new RewardDto("플레이어 정보 찾기 실패", false);
			}

			String playerJob = player.getUsing_Character();
			int currentStage = player.getWhereStage();
			int goldAmount = RewardUtil.getBossClearGoldAmount(currentStage);

			List<SkillDto> skillChoices = generateSkillChoices(playerJob);
			if (skillChoices.isEmpty()) {
				return new RewardDto("스킬 보상 생성에 실패했습니다", false);
			}

			if (RewardUtil.shouldDropArtifact()) {
				log.info("아티팩트 보상 추가 생성");
				ArtifactDto artifact = generateArtifactReward(playerJob);
				if (artifact != null) {
					return new RewardDto(skillChoices, artifact, goldAmount);
				}
			}
			
			log.info("스킬 보상만 생성");
			return new RewardDto(skillChoices, goldAmount);
		} catch (Exception e) {
			log.error("보상 생성 실패 : " + e.getMessage(), e);
			return new RewardDto("보상 생성 중 오류 발생 : " + e.getMessage(), false);
		}
	}
	
	private List<SkillDto> generateSkillChoices()
}
