package com.milite.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.milite.constants.BattleConstants;
import com.milite.dto.ActiveRewardDto;
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

	private static final ConcurrentHashMap<String, ActiveRewardDto> activeRewards = new ConcurrentHashMap<>();

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

	@Override
	public ActiveRewardDto createActiveReward(String playerID, RewardDto reward) {
		log.info("활성 보상 생성 시작");

		try {
			if (reward == null || !reward.isSuccess()) {
				log.warn("유효하지 않은 보상");
				return null;
			}

			ActiveRewardDto activeReward = new ActiveRewardDto(playerID, reward);
			activeRewards.put(playerID, activeReward);

			log.info("활성 보상 저장 완료");

			return activeReward;
		} catch (Exception e) {
			log.error("활성 보상 생성 실패 : " + e.getMessage(), e);
			return null;
		}
	}

	@Override
	public ActiveRewardDto getCurrentRewards(String playerID) {
		return activeRewards.get(playerID);
	}

	@Override
	public String claimSkillReward(String playerID, int selectedSkillID) {
		log.info("스킬 보상 개별 적용 시작");

		try {
			ActiveRewardDto activeReward = getCurrentRewards(playerID);
			if (activeReward == null) {
				return "활성 보상이 없습니다";
			}

			if (!activeReward.hasAvailableSkills()) {
				return "선택 가능한 스킬 보상이 없습니다";
			}

			SkillDto selectedSkill = activeReward.claimSkill(selectedSkillID);
			if (selectedSkill == null) {
				return "해당 스킬을 찾을 수 없습니다";
			}

			String result = applySkillReward(playerID, selectedSkillID);
			if (result.contains("실패") || result.contains("오류")) {
				return result;
			}

			log.info("스킬 보상 개별 적용 완료");
			return "스킬 " + selectedSkill.getSkill_name() + "을 획득하였습니다";
		} catch (Exception e) {
			log.error("스킬 보상 개별 적용 실패 : " + e.getMessage(), e);
			return "스킬 보상 적용 중 오류 발생 : " + e.getMessage();
		}
	}

	@Override
	public String claimArtifactReward(String playerID) {
		log.info("아티팩트 보상 개별 적용 시작");

		try {
			ActiveRewardDto activeReward = getCurrentRewards(playerID);
			if (activeReward == null) {
				return "활성 보상이 없습니다";
			}

			if (!activeReward.hasAvailableArtifact()) {
				return "선택 가능한 아티팩트 보상이 없습니다";
			}

			ArtifactDto artifact = activeReward.claimArtifact();
			String result = applyArtifactReward(playerID, artifact.getArtifactID());

			if (result.contains("획득 완료")) {
				log.info("아티팩트 보상 적용 완료");
				return result;
			} else {
				return result;
			}
		} catch (Exception e) {
			log.error("아티팩트 보상 적용 실패 : " + e.getMessage(), e);
			return "아티팩트 보상 적용 오류 발생 : " + e.getMessage();
		}
	}

	@Override
	public String claimHealReward(String playerID) {
		log.info("회복 보상 개별 적용 시작");

		try {
			ActiveRewardDto activeReward = getCurrentRewards(playerID);
			if (activeReward == null) {
				return "활성 보상이 없습니다";
			}

			if (!activeReward.hasAvailableHeal()) {
				return "사용 가능한 회복 보상이 없습니다";
			}

			boolean claimed = activeReward.claimHeal();
			if (!claimed) {
				return "회복 보상 적용에 실패했습니다";
			}

			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null) {
				return "플레이어 정보 찾기 실패";
			}

			int maxHp = player.getMax_hp();
			int healAmount = Math.max(1, (int) (maxHp * 0.1));
			int newHp = Math.min(maxHp, player.getCurr_hp() + healAmount);

			player.setCurr_hp(newHp);
			characterMapper.updateStatus(player);

			log.info("회복 보상 적용 완료");
			return healAmount + "를 회복하였습니다";
		} catch (Exception e) {
			log.error("회복 보상 개별 적용 실패 : " + e.getMessage(), e);
			return "회복 보상 개별 적용 중 오류 발생 : " + e.getMessage();
		}
	}

	@Override
	public String claimGoldReward(String playerID) {
		log.info("골드 보상 개별 적용 시작");

		try {
			ActiveRewardDto activeReward = getCurrentRewards(playerID);
			if (activeReward == null) {
				return "활성 보상이 없습니다";
			}

			if (!activeReward.hasAvailableGold()) {
				return "획득 가능한 골드 보상이 없습니다";
			}

			int goldAmount = activeReward.claimGold();
			String result = applyGoldReward(playerID, goldAmount);

			log.info("골드 보상 개별 적용 완료 : " + goldAmount + " 골드를 획득하였습니다");
			return result;
		} catch (Exception e) {
			log.error("골드 보상 개별 적용 실패 : " + e.getMessage(), e);
			return "골드 보상 개별 적용 중 오류 발생 : " + e.getMessage();
		}
	}

	@Override
	public String proceedToCamp(String playerID) {
		log.info("캠프로 이동");

		try {
			ActiveRewardDto activeReward = activeRewards.remove(playerID);
			if (activeReward == null) {
				return "처리할 보상이 없습니다";
			}

			List<String> remainingRewards = new ArrayList<>();
			if (activeReward.hasAvailableSkills()) {
				remainingRewards.add("스킬 " + activeReward.getAvailableSkills().size());
			}
			if (activeReward.hasAvailableArtifact()) {
				remainingRewards.add("아티팩트");
			}
			if (activeReward.hasAvailableHeal()) {
				remainingRewards.add("회복");
			}
			if (activeReward.hasAvailableGold()) {
				remainingRewards.add("골드 " + activeReward.getGoldAmount());
			}

			if (!remainingRewards.isEmpty()) {
				log.info("포기한 보상 : " + String.join(", ", remainingRewards));
				return "캠프로 이동합니다. 두고가는 것들 : " + String.join(", ", remainingRewards);
			} else {
				return "모든 것을 챙기고 캠프로 이동합니다";
			}
		} catch (Exception e) {
			log.error("캠프 이동 실패: " + e.getMessage(), e);
			return "캠프 이동 중 오류 발생: " + e.getMessage();
		}
	}

	@Override
	public boolean isSkillInActiveReward(String playerID, int skillID) {
		try {
			ActiveRewardDto activeReward = getCurrentRewards(playerID);
			if (activeReward == null) {
				return false;
			}

			return activeReward.isSkillAvailable(skillID);
		} catch (Exception e) {
			log.error("스킬 보상 확인 중 오류 : " + e.getMessage(), e);
			return false;
		}
	}
}