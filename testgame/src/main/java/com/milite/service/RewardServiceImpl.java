package com.milite.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.milite.constants.BattleConstants;
import com.milite.dto.ArtifactDto;
import com.milite.dto.PlayerDto;
import com.milite.dto.RewardDto;
import com.milite.dto.SkillDto;
import com.milite.mapper.ArtifactMapper;
import com.milite.mapper.CharacterStatusMapper;
import com.milite.util.RewardUtil;

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

	private List<SkillDto> generateSkillChoices(String playerJob) {
		List<SkillDto> skillChoices = new ArrayList<>();
		int choiceCount = RewardUtil.getSkillChoiceCount(); // 기본값 3개
		int maxAttempts = BattleConstants.getRewardMaxSkillAttempts();

		Set<Integer> usedSkillIDs = new HashSet<>();

		for (int i = 0; i < choiceCount; i++) {
			SkillDto selectedSkill = null;
			int attempts = 0;
			while (selectedSkill == null && attempts < maxAttempts) {
				String rarity = RewardUtil.determineSkillRarity();
				List<SkillDto> availableSkills = skillService.getSkillReward(playerJob, rarity, "Battle", null);

				if (availableSkills != null && !availableSkills.isEmpty()) {
					SkillDto candidate = availableSkills.get(0);

					if (!usedSkillIDs.contains(candidate.getSkill_id())) {
						selectedSkill = candidate;
						usedSkillIDs.add(candidate.getSkill_id());
						log.info("스킬" + (i + 1) + " : " + candidate.getSkill_name());
					}
				}
				attempts++;
			}
<<<<<<< HEAD

			if (selectedSkill == null) {
				selectedSkill = getDefaultSkill(playerJob);
			}

			if (selectedSkill != null) {
=======
			
			if(selectedSkill == null) {
				selectedSkill=getDefaultSkill(playerJob);
			}
			
			if(selectedSkill != null) {
>>>>>>> 4297196a91675f2bffe8a201f698102660a03142
				skillChoices.add(selectedSkill);
			}
		}
		return skillChoices;
<<<<<<< HEAD
=======
	}
	
	private ArtifactDto generateArtifactReward(String playerJob) {
		try {
			List<ArtifactDto> availableArtifacts = artifactMapper.getAvailableArtifacts(playerJob, "None");
			
			 if(availableArtifacts == null || availableArtifacts.isEmpty()) {
				 log.warn("사용 가능 아티팩트 없음");
				 return null;
			 }
		}catch(Exception e) {
			
		}
>>>>>>> 4297196a91675f2bffe8a201f698102660a03142
	}

	private ArtifactDto generateArtifactReward(String playerJob) {
		try {
			List<ArtifactDto> availableArtifacts = artifactMapper.getAvailableArtifacts(playerJob, "None");

			if (availableArtifacts == null || availableArtifacts.isEmpty()) {
				log.warn("사용 가능 아티팩트 없음");
				return null;
			}
		} catch (Exception e) {

		}
	}
}