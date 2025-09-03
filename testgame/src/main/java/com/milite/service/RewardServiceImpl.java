package com.milite.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.milite.constants.BattleConstants;
import com.milite.dto.ArtifactDto;
import com.milite.dto.PlayerDto;
import com.milite.dto.RewardDto;
import com.milite.dto.SkillDto;
import com.milite.mapper.ArtifactMapper;
import com.milite.mapper.CharacterStatusMapper;
import com.milite.mapper.UserMapper;
import com.milite.util.CommonUtil;
import com.milite.util.RewardUtil;

import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@Service
@Transactional
public class RewardServiceImpl implements RewardService {
	@Setter(onMethod_ = @Autowired)
	private CharacterStatusMapper characterMapper;

	@Setter(onMethod_ = @Autowired)
	private SkillService skillService;

	@Setter(onMethod_ = @Autowired)
	private ArtifactMapper artifactMapper;

	@Setter(onMethod_ = @Autowired)
	private UserMapper userMapper;

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

			List<SkillDto> skillChoices = generateSkillChoices(playerID, playerJob);
			if (skillChoices.isEmpty()) {
				return new RewardDto("스킬 보상 생성에 실패했습니다", false);
			}

			if (RewardUtil.shouldDropArtifact()) {
				log.info("아티팩트 보상 추가 생성");
				ArtifactDto artifact = generateArtifactReward(playerJob, player);
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

	public RewardDto generateSpecialBattleReward(String playerID, int defeatedMonsterID) {
		log.info("특수 보상 생성");

		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null) {
				return new RewardDto("플레이어 정보 찾기 실패", false);
			}

			String playerJob = player.getUsing_Character();
			int currentStage = player.getWhereStage();
			int goldAmount = RewardUtil.getBossClearGoldAmount(currentStage);

			List<SkillDto> skillChoices = generateSkillChoices(playerID, playerJob);
			if (skillChoices.isEmpty()) {
				return new RewardDto("스킬 보상 생성에 실패", false);
			}

			if (defeatedMonsterID == BattleConstants.getSummonMasterId()) {
				log.info("혼령의 인도인 처치 - 특수 보상 드랍");
				ArtifactDto shadowDevice = artifactMapper.getArtifactByID(121);
				if (shadowDevice != null) {
					return new RewardDto(skillChoices, shadowDevice, goldAmount);
				}
			}

			return generateBattleReward(playerID);
		} catch (Exception e) {
			log.error("특수 보상 생성 실패 : " + e.getMessage(), e);
			return new RewardDto("특수 보상 생성 오류 : " + e.getMessage(), false);
		}
	}

	private List<SkillDto> generateSkillChoices(String playerID, String playerJob) {
		List<SkillDto> skillChoices = new ArrayList<>();
		int choiceCount = RewardUtil.getSkillChoiceCount(); // 기본값 3개

		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			Set<Integer> ownedSkillIDs = new HashSet<>();
			if (player != null) {
				List<String> ownSkills = player.getOwnSkillList();

				for (String skillID : ownSkills) {
					ownedSkillIDs.add(Integer.parseInt(skillID));
				}
				log.info("플레이어 보유 스킬 개수 : " + ownSkills.size());
			}

			List<SkillDto> srSkills = skillService.getSkillReward(playerJob, "SR", "Battle", null);
			List<SkillDto> rSkills = skillService.getSkillReward(playerJob, "R", "Battle", null);
			List<SkillDto> nSkills = skillService.getSkillReward(playerJob, "N", "Battle", null);

			if (srSkills != null) {
				srSkills.removeIf(skill -> ownedSkillIDs.contains(skill.getSkill_id()));
			} else {
				srSkills = new ArrayList<>();
			}

			if (rSkills != null) {
				rSkills.removeIf(skill -> ownedSkillIDs.contains(skill.getSkill_id()));
			} else {
				rSkills = new ArrayList<>();
			}

			if (nSkills != null) {
				nSkills.removeIf(skill -> ownedSkillIDs.contains(skill.getSkill_id()));
			} else {
				nSkills = new ArrayList<>();
			}

			for (int i = 0; i < choiceCount; i++) {
				String rarity = RewardUtil.determineSkillRarity();
				SkillDto selectedSkill = null;

				switch (rarity) {
				case "SR":
					if (!srSkills.isEmpty()) {
						selectedSkill = srSkills.remove(0);
					}
					break;
				case "R":
					if (!rSkills.isEmpty()) {
						selectedSkill = rSkills.remove(0);
					}
					break;
				case "N":
					if (!nSkills.isEmpty()) {
						selectedSkill = nSkills.remove(0);
					}
					break;
				}

				if (selectedSkill == null) {
					if (!srSkills.isEmpty()) {
						selectedSkill = srSkills.remove(0);
					} else if (!rSkills.isEmpty()) {
						selectedSkill = rSkills.remove(0);

					} else if (!nSkills.isEmpty()) {
						selectedSkill = nSkills.remove(0);
					}
				}

				if (selectedSkill != null) {
					skillChoices.add(selectedSkill);
					log.info("스킬 " + (i + 1) + " : " + selectedSkill.getSkill_name());
				} else {
					log.warn("사용 가능 스킬이 없음");
				}
			}
		} catch (Exception e) {
			log.error("스킬 선택지 생성 오류");
		}
		return skillChoices;
	}

	private ArtifactDto generateArtifactReward(String playerJob, PlayerDto player) {
		try {
			List<ArtifactDto> availableArtifacts = artifactMapper.getAvailableArtifacts(playerJob, "None");

			if (availableArtifacts == null || availableArtifacts.isEmpty()) {
				log.warn("사용 가능 아티팩트 없음");
				return null;
			}

			List<ArtifactDto> filteredArtifacts = new ArrayList<>();
			List<String> ownedArtifacts = player.getOwnArtifactList();

			for (ArtifactDto artifact : availableArtifacts) {
				String artifactIDStr = String.valueOf(artifact.getArtifactID());
				if (!ownedArtifacts.contains(artifactIDStr)) {
					filteredArtifacts.add(artifact);
				}
			}

			if (filteredArtifacts.isEmpty()) {
				log.info("모든 아티팩트를 보유 중");
				return null;
			}

			int randomIndex = CommonUtil.Dice(filteredArtifacts.size()) - 1;
			ArtifactDto selectedArtifact = filteredArtifacts.get(randomIndex);
			log.info("선택된 아티팩트 : " + selectedArtifact.getArtifactName());

			return selectedArtifact;
		} catch (Exception e) {
			log.error("아티팩트 보상 생성 실패");
			return null;
		}
	}

	@Override
	public String applySkillReward(String playerID, int selectedSkillID) {
		log.info("스킬 보상 적용");

		try {
			String skillIDStr = String.valueOf(selectedSkillID);
			return skillService.managePlayerSkill(playerID, skillIDStr);
		} catch (Exception e) {
			log.error("스킬 보상 적용 실패 : " + e.getMessage(), e);
			return "스킬 보상 적용 중 오류 발생 : " + e.getMessage();
		}
	}

	@Override
	public String applyArtifactReward(String playerID, int artifactID) {
		log.info(playerID);

		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null) {
				return "플레이어 정보 찾기 실패";
			}

			if (player.hasArtifact(String.valueOf(artifactID))) {
				return "이미 보유한 아티팩트입니다";
			}

			characterMapper.addArtifactToPlayer(playerID, artifactID);

			ArtifactDto artifact = artifactMapper.getArtifactByID(artifactID);
			String artifactName = (artifact != null) ? artifact.getArtifactName() : "아티팩트가 없음";

			log.info("아티팩트 보상 적용 완료");
			return "아티팩트 획득 완료 : " + artifactName;
		} catch (Exception e) {
			log.error("아티팩트 보상 적용 실패 : " + e.getMessage(), e);
			return "아티팩트 보상 적용 중 오류 : " + e.getMessage();
		}
	}

	@Override
	public String applyGoldReward(String playerID, int goldAmount) {
		log.info("골드 보상 적용 시작");
		try {
			if (goldAmount <= 0) {
				return "골드 보상이 없습니다.";
			}

			int updateResult = userMapper.addGold(playerID, goldAmount);

			if (updateResult > 0) {
				log.info("골드 보상 적용 완료");
				return goldAmount + " 골드를 획득하였습니다";
			} else {
				log.warn("골드 보상 적용 실패");
				return "플레이어 정보 찾기 실패";
			}
		} catch (Exception e) {
			log.error("골드 보상 적용 실패 : " + e.getMessage(), e);
			return "골드 보상 적용 중 오류 발생 : " + e.getMessage();
		}
	}
}