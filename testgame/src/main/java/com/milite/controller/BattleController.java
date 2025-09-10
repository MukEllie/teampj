package com.milite.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.milite.battle.BattleLogEntry;
import com.milite.battle.BattleSession;
import com.milite.battle.artifacts.PhoenixFeatherArtifact;
import com.milite.battle.artifacts.PlayerArtifact;
import com.milite.constants.BattleConstants;
import com.milite.dto.*;
import com.milite.mapper.CharacterStatusMapper;
import com.milite.service.BattleService;
import com.milite.service.RewardService;
import com.milite.service.SkillService;

import lombok.*;

import java.util.*;

import lombok.extern.log4j.Log4j;

@Log4j
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/battle") // 경로는 필요에 의해 수정 해야함
@RestController
public class BattleController {

	@Setter(onMethod_ = @Autowired)
	private BattleService service;

	@Setter(onMethod_ = @Autowired)
	private SkillService skillservice;

	@Setter(onMethod_ = @Autowired)
	private RewardService rewardService;

	@Setter(onMethod_ = @Autowired)
	private CharacterStatusMapper mapper;

	@PostMapping("/start")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> startBattle(@RequestParam("PlayerID") String PlayerID) {
		System.out.println("=== 전투 시작 단계 - Player : " + PlayerID + " ===");
		try {
			BattleResultDto initResult = service.battle(PlayerID);

			Map<String, Object> battleStatus = service.getBattleStatus(PlayerID);
			Map<String, Object> responseMap = new HashMap<>();
			responseMap.put("stage", "battleReady");
			responseMap.put("message", "전투가 시작되었습니다. 스킬을 선택해주세요");
			responseMap.put("initResult", initResult);
			responseMap.put("battleStatus", battleStatus);
			responseMap.put("needsPlayerInput", battleStatus.get("needsPlayerInput"));
			responseMap.put("currentUnit", battleStatus.get("currentUnit"));
			responseMap.put("playerHp", battleStatus.get("playerHp"));
			responseMap.put("aliveMonsters", battleStatus.get("aliveMonsters"));

			return ResponseEntity.ok(responseMap);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorMap = new HashMap<>();
			errorMap.put("error", "전투 시작 중 오류 발생: " + e.getMessage());
			return ResponseEntity.badRequest().body(errorMap);
		}
	}

	// 혼령의 인도인 전투는 battle/event로 연결하게 만들기. 이 경우 몹 생성까지 전부 여기서 만들고 세션 저장을 시켜야함. 전투의
	// 경우 이미 battle/battle에서 혼령까지 되어있으니 문제 없을 것으로 보임

	@PostMapping("/event")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> startEventBattle(@RequestParam("PlayerID") String PlayerID){
		System.out.println("이벤트 전용 배틀 시작 단계 Player : " + PlayerID);
		try {
			BattleResultDto initResult = service.battleEvent(PlayerID);
			
			Map<String, Object> battleStatus = service.getBattleStatus(PlayerID);
			Map<String, Object> responseMap = new HashMap<>();
			responseMap.put("stage", "battleReady");
			responseMap.put("message", "혼령의 인도인과의 전투가 시작되었습니다. 스킬을 선택해주세요");
			responseMap.put("initResult", initResult);
			responseMap.put("battleStatus", battleStatus);
			responseMap.put("needsPlayerInput", battleStatus.get("needsPlayerInput"));
			responseMap.put("currentUnit", battleStatus.get("currentUnit"));
			responseMap.put("playerHp", battleStatus.get("playerHp"));
			responseMap.put("aliveMonsters", battleStatus.get("aliveMonsters"));

			return ResponseEntity.ok(responseMap);
		}catch(Exception e) {
			e.printStackTrace();
			Map<String, Object> errorMap = new HashMap<>();
			errorMap.put("error", "이벤트 전투 시작 중 오류 발생: " + e.getMessage());
			return ResponseEntity.badRequest().body(errorMap);
		}
		
	} 
	
	@PostMapping("/battle")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> executeBattle(@RequestParam("PlayerID") String PlayerID,
			@RequestParam("SkillID") String SkillID,
			@RequestParam(value = "targetIndex", required = false) Integer targetIndex) {
		System.out.println(
				"=== 전투 실행 단계 - Player : " + PlayerID + ", Skill : " + SkillID + ", Target : " + targetIndex + " ===");
		try {
			Map<String, Object> currentStatus = service.getBattleStatus(PlayerID);
			Boolean needsPlayerInput = (Boolean) currentStatus.get("needsPlayerInput");

			if (needsPlayerInput == null || !needsPlayerInput) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "현재 플레이어 턴이 아닙니다");
				errorMap.put("currentStatus", currentStatus);
				return ResponseEntity.badRequest().body(errorMap);
			}

			// 스킬 조회 메서드
			SkillDto skill = getSkillInfo(SkillID);

			if (skill == null) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "존재하지 않는 스킬입니다 : " + SkillID);
				return ResponseEntity.badRequest().body(errorMap);
			}

			BattleResultDto battleResult = service.processNextAction(PlayerID, skill, targetIndex);

			Map<String, Object> updateStatus = service.getBattleStatus(PlayerID);

			boolean battleEnded = checkBattleEndCondition(updateStatus);

			Map<String, Object> response = new HashMap<>();
			response.put("stage", battleEnded ? "battleEnded" : "battleContinue");
			response.put("battleResult", battleResult);
			response.put("updateStatus", updateStatus);
			response.put("battleEnded", battleEnded);
			response.put("needsPlayerInput", updateStatus.get("needsPlayerInput"));
			response.put("nextAction", battleEnded ? "goToEnd" : "waitForNextInput");

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorMap = new HashMap<>();
			errorMap.put("error", "전투 실행 중 오류 발생 : " + e.getMessage());
			return ResponseEntity.badRequest().body(errorMap);
		}
	}

	@PostMapping("/end")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> endBattle(@RequestParam("PlayerID") String PlayerID) {
		System.out.println("=== 전투 종료 단계 - Player : " + PlayerID + " ===");
		try {
			Map<String, Object> finalStatus = service.getBattleStatus(PlayerID);

			boolean playerAlive = (Integer) finalStatus.get("playerHp") > 0;
			boolean hasAliveMonsters = !((List<?>) finalStatus.get("aliveMonsters")).isEmpty();

			String battleResult;
			Map<String, Object> rewards = new HashMap<>();// 보상 설정 관련용

			if (playerAlive && !hasAliveMonsters) {
				battleResult = "Victory";
				// 보상관련 메서드 삽입

				System.out.println("플레이어 승리!");

				try {
					boolean defeatedSummonMaster = checkSummonMasterDefeated(PlayerID);

					RewardDto reward;
					if (defeatedSummonMaster) {
						log.info("혼령의 인도인 처치 완료 - 특수 보상 생성");
						reward = rewardService.generateSpecialBattleReward(PlayerID, 51);
					} else {
						log.info("일반 전투 승리 - 보상 생성");
						reward = rewardService.generateBattleReward(PlayerID);
					}

					if (reward != null && reward.isSuccess()) {
						ActiveRewardDto activeReward = rewardService.createActiveReward(PlayerID, reward);

						if (activeReward != null) {
							rewards = buildVictoryRewardResponse(activeReward);
							System.out.println("보상 생성 완료 : " + reward.getRewardType());
						} else {
							rewards.put("error", "보상 활성화 실패");
							System.err.println("ActiveReward 생성 실패");
						}
					} else {
						rewards.put("error", "보상 생성 실패");
						rewards.put("message", reward != null ? reward.getMessage() : "알 수 없는 오류");
						System.err.println("보상 생성 실패 : " + (reward != null ? reward.getMessage() : "null"));
					}

				} catch (Exception rewardException) {
					System.err.println("보상 처리 중 오류: " + rewardException.getMessage());
					rewards.put("error", "보상 처리 중 오류 발생");
					rewards.put("message", rewardException.getMessage());
				}
			} else if (!playerAlive) {
				battleResult = "Defeat";

				rewards = Map.of("message", "패배하였습니다.");
				System.out.println("플레이어 패배");
			} else {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "비정상적인 전투 종료 상태");
				errorMap.put("finalStatus", finalStatus);
				return ResponseEntity.badRequest().body(errorMap);
			}

			processUsedPhoenixFeather(PlayerID);

			cleanupBattleSession(PlayerID);

			Map<String, Object> responseMap = new HashMap<>();
			responseMap.put("stage", "completed");
			responseMap.put("battleResult", battleResult);
			responseMap.put("rewards", rewards);
			responseMap.put("finalStatus", finalStatus);
			responseMap.put("message", battleResult.equals("Victory") ? "전투에서 승리하였습니다." : "전투에서 패배하였습니다.");

			return ResponseEntity.ok(responseMap);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorMap = new HashMap<>();
			errorMap.put("error", "전투 종료 중 오류 발생 : " + e.getMessage());
			return ResponseEntity.badRequest().body(errorMap);
		}
	}

	/*
	 * @GetMapping("/test")
	 * 
	 * @ResponseBody public ResponseEntity<String> test() {
	 * System.out.println("=== TEST 메서드 호출됨 ==="); System.out.println("현재 시간: " +
	 * new java.util.Date()); return ResponseEntity.ok("테스트 성공! 컨트롤러가 정상 작동합니다."); }
	 */

	@GetMapping("/status")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getBattleStatus(@RequestParam("PlayerID") String PlayerID) {
		try {
			Map<String, Object> status = service.getBattleStatus(PlayerID);

			if (status.containsKey("error")) {
				return ResponseEntity.badRequest().body(status);
			}

			return ResponseEntity.ok(status);
		} catch (Exception e) {
			Map<String, Object> errorMap = new HashMap<>();
			errorMap.put("error", "상태 조회 중 오류 발생 : " + e.getMessage());
			return ResponseEntity.badRequest().body(errorMap);
		}
	}

	private SkillDto getSkillInfo(String skillID) {
		try {
			Integer skillIdInt = Integer.parseInt(skillID);
			return skillservice.getSkillInfo(skillIdInt);
		} catch (NumberFormatException e) {
			log.error("잘못된 스킬 ID 형식 : " + skillID);
			return null;
		}
	}

	private boolean checkBattleEndCondition(Map<String, Object> status) {
		Integer playerHp = (Integer) status.get("playerHp");
		List<?> aliveMonsters = (List<?>) status.get("aliveMonsters");

		return playerHp <= 0 || aliveMonsters.isEmpty();
	}

	private void cleanupBattleSession(String PlayerID) {
		System.out.println("전투 세션 정리 완료 : " + PlayerID);
	}

	private void processUsedPhoenixFeather(String playerID) {
		try {
			BattleSession session = service.getCurrentBattleSession(playerID);
			if (session == null) {
				System.out.println("전투 세션 미발견 : " + playerID);
				return;
			}

			PlayerDto player = session.getPlayer();
			boolean needReplacement = false;

			for (PlayerArtifact artifact : player.getArtifacts()) {
				if (artifact instanceof PhoenixFeatherArtifact) {
					PhoenixFeatherArtifact feather = (PhoenixFeatherArtifact) artifact;
					if (feather.isUsed()) {
						needReplacement = true;
						break;
					}
				}
			}

			if (needReplacement) {
				replacePhoenixFeatherInDB(playerID);
				System.out.println("불사조의 하얀 깃털 -> 불사조의 빛바랜 깃털 : " + playerID);
			}
		} catch (Exception e) {
			System.err.println("불사조 깃털 처리 중 오류: " + e.getMessage());
		}
	}

	private void replacePhoenixFeatherInDB(String playerID) {
		try {
			int updatedRows = mapper.replacePhoenixFeathers(playerID);

			if (updatedRows > 0) {
				System.out.println("DB 아티팩트 교체 성공: " + playerID + " (불사조의 하얀 깃털 → 빛바랜 깃털)");
			} else {
				System.out.println("DB 아티팩트 교체 실패: " + playerID + " (해당 아티팩트를 찾을 수 없음)");
			}
		} catch (Exception e) {
			System.err.println("DB 아티팩트 교체 중 오류: " + playerID + " - " + e.getMessage());
		}
	}

	private boolean checkSummonMasterDefeated(String PlayerID) {
		try {
			BattleSession session = service.getCurrentBattleSession(PlayerID);
			if (session == null) {
				return false;
			}

			List<BattleLogEntry> battleLog = session.getBattleLog();
			// final int SUMMON_MASTER_ID = BattleConstants.getSummonMasterId();

			// 이부분은 실제 배틀로그 쪽에 저 문구를 썼는지 확인할 것
			return battleLog.stream().anyMatch(
					log -> log.getActionType().equals("monster_defeat") && log.getActorName().contains("혼령의 인도인"));
		} catch (Exception e) {
			System.err.println("혼령의 인도인 처치 확인 중 오류 : " + e.getMessage());
			return false;
		}
	}

	private Map<String, Object> buildVictoryRewardResponse(ActiveRewardDto activeReward) {
		Map<String, Object> rewardResponse = new HashMap<>();

		rewardResponse.put("type", activeReward.getRewardType());
		rewardResponse.put("message", "보상을 획득하세요");
		rewardResponse.put("nextStep", "claimRewards");

		if (activeReward.hasAvailableSkills()) {
			List<Map<String, Object>> skillChoices = new ArrayList<>();
			for (SkillDto skill : activeReward.getAvailableSkills()) {
				Map<String, Object> skillInfo = new HashMap<>();
				skillInfo.put("skillID", skill.getSkill_id());
				skillInfo.put("name", skill.getSkill_name());
				skillInfo.put("description", skill.getSkill_text());
				skillInfo.put("damage", skill.getMin_damage() + "~" + skill.getMax_damage());
				skillInfo.put("element", skill.getElement());
				skillInfo.put("rarity", skill.getRarity());
				skillChoices.add(skillInfo);
			}
			rewardResponse.put("skillChoices", skillChoices);
			rewardResponse.put("skillChoicesCount", skillChoices.size());
		}

		if (activeReward.hasAvailableArtifact()) {
			ArtifactDto artifact = activeReward.getAvailableArtifact();
			Map<String, Object> artifactInfo = new HashMap<>();
			artifactInfo.put("ArtifactID", artifact.getArtifactID());
			artifactInfo.put("name", artifact.getArtifactName());
			artifactInfo.put("description", artifact.getArtifactText());
			artifactInfo.put("effect", artifact.getArtifactEffect());
			rewardResponse.put("artifact", artifactInfo);
		}

		rewardResponse.put("healAvailable", activeReward.hasAvailableHeal());
		rewardResponse.put("healDescription", "최대 체력의 10% 회복");

		if (activeReward.hasAvailableGold()) {
			rewardResponse.put("gold", activeReward.getGoldAmount());
			rewardResponse.put("goldAvailable", true);
		}

		int totalRewards = 1; // 스킬은 확정 드랍이라 무조건 1 이상
		if (activeReward.hasAvailableArtifact()) {
			totalRewards++;
		}
		if (activeReward.hasAvailableHeal()) {
			totalRewards++;
		}
		if (activeReward.hasAvailableGold()) {
			totalRewards++;
		}

		rewardResponse.put("totalRewardType", totalRewards);
		rewardResponse.put("rewardSummary", buildRewardSummary(activeReward));

		return rewardResponse;
	}

	private String buildRewardSummary(ActiveRewardDto activeReward) {
		StringBuilder summary = new StringBuilder();

		summary.append("스킬 선택 (3개 중 1개)");

		if (activeReward.hasAvailableArtifact()) {
			summary.append(" + 아티팩트 획득");
		}

		if (activeReward.hasAvailableHeal()) {
			summary.append(" + 체력 회복");
		}

		if (activeReward.hasAvailableGold()) {
			summary.append(" + ").append(activeReward.getGoldAmount()).append(" 골드");
		}

		return summary.toString();
	}

	@PostMapping("/claim/heal")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> claimHealReward(@RequestParam("PlayerID") String PlayerID) {
		System.out.println("회복 보상 수령 - Player : " + PlayerID);

		try {
			ActiveRewardDto activeReward = rewardService.getCurrentRewards(PlayerID);
			if (activeReward == null) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "활성 보상이 없습니다");
				errorMap.put("message", "전투를 완료해주세요");
				return ResponseEntity.badRequest().body(errorMap);
			}

			if (!activeReward.hasAvailableHeal()) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "사용 가능한 회복 보상이 없습니다");
				errorMap.put("message", "이미 수령했거나 회복 보상이 없습니다");
				return ResponseEntity.badRequest().body(errorMap);
			}

			String healResult = rewardService.claimHealReward(PlayerID);

			boolean success = healResult.contains("회복하였습니다");

			Map<String, Object> responseMap = new HashMap<>();
			responseMap.put("stage", "claimCompleted");
			responseMap.put("claimType", "heal");
			responseMap.put("success", success);
			responseMap.put("message", healResult);
			if (success) {
				Map<String, Object> remainingRewards = getRemainingRewardsStatus(activeReward);
				responseMap.put("remainingRewards", remainingRewards);
				responseMap.put("nextStep", determineNextStep(activeReward));

				System.out.println("회복 보상 수령 완료 : " + healResult);
			} else {
				responseMap.put("error", "회복 보상 적용 실패");
				System.err.println("회복 보상 적용 실패 : " + healResult);
			}

			return ResponseEntity.ok(responseMap);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorMap = new HashMap<>();
			errorMap.put("error", "회복 보상 수령 중 오류 발생");
			errorMap.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(errorMap);
		}
	}

	private Map<String, Object> getRemainingRewardsStatus(ActiveRewardDto activeReward) {
		Map<String, Object> remaining = new HashMap<>();

		remaining.put("skillAvailable", activeReward.hasAvailableSkills());
		remaining.put("artifactAvailable", activeReward.hasAvailableArtifact());
		remaining.put("healAvailable", activeReward.hasAvailableHeal());
		remaining.put("goldAvailable", activeReward.hasAvailableGold());

		if (activeReward.hasAvailableSkills()) {
			remaining.put("skillChoiceCount", activeReward.getAvailableSkills().size());
			remaining.put("skillRequired", true);
		} else {
			remaining.put("skillRequired", false);
		}

		int remainingCount = 0;
		if (activeReward.hasAvailableSkills()) {
			remainingCount++;
		}
		if (activeReward.hasAvailableArtifact()) {
			remainingCount++;
		}
		if (activeReward.hasAvailableHeal()) {
			remainingCount++;
		}
		if (activeReward.hasAvailableGold()) {
			remainingCount++;
		}

		remaining.put("totalRemaining", remainingCount);
		remaining.put("hasAnyRemaining", remainingCount > 0);

		return remaining;
	}

	private String determineNextStep(ActiveRewardDto activeReward) {
		if (activeReward.hasAvailableSkills()) {
			return "claimSkill";
		}
		if (activeReward.hasAvailableArtifact()) {
			return "claimArtifact";
		}
		if (activeReward.hasAvailableHeal()) {
			return "claimHeal";
		}
		if (activeReward.hasAvailableGold()) {
			return "claimGold";
		}

		return "proceedToCamp";
	}

	@PostMapping("/claim/gold")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> claimGoldReward(@RequestParam("PlayerID") String PlayerID) {
		System.out.println("골드 보상 수령 - Player : " + PlayerID);

		try {
			ActiveRewardDto activeReward = rewardService.getCurrentRewards(PlayerID);
			if (activeReward == null) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "활성 보상이 없습니다");
				errorMap.put("message", "전투를 완료해주세요");
				return ResponseEntity.badRequest().body(errorMap);
			}

			if (!activeReward.hasAvailableGold()) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "사용 가능한 골드 보상이 없습니다");
				errorMap.put("message", "이미 수령했거나 골드 보상이 없습니다");
				return ResponseEntity.badRequest().body(errorMap);
			}

			int goldAmount = activeReward.getGoldAmount();

			String goldResult = rewardService.claimGoldReward(PlayerID);

			boolean success = goldResult.contains("골드를 획득하였습니다");

			Map<String, Object> responseMap = new HashMap<>();
			responseMap.put("stage", "claimCompleted");
			responseMap.put("claimType", "gold");
			responseMap.put("success", success);
			responseMap.put("message", goldResult);

			if (success) {
				responseMap.put("goldReceived", goldAmount);
				responseMap.put("goldMessage", goldAmount + " 골드를 획득했습니다");

				Map<String, Object> remainingRewards = getRemainingRewardsStatus(activeReward);
				responseMap.put("remainingRewards", remainingRewards);
				responseMap.put("nextStep", determineNextStep(activeReward));

				System.out.println("골드 보상 수령 완료 : " + goldAmount + " 골드");
			} else {
				responseMap.put("error", "골드 보상 적용 실패");
				System.err.println("골드 보상 적용 실패 : " + goldResult);
			}

			return ResponseEntity.ok(responseMap);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorMap = new HashMap<>();
			errorMap.put("error", "골드 보상 수령 중 오류 발생");
			errorMap.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(errorMap);
		}
	}

	@PostMapping("/claim/artifact")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> claimArtifactReward(@RequestParam("PlayerID") String PlayerID) {
		System.out.println("아티팩트 보상 - Player : " + PlayerID);

		try {
			ActiveRewardDto activeReward = rewardService.getCurrentRewards(PlayerID);
			if (activeReward == null) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "활성 보상이 없습니다");
				errorMap.put("message", "전투를 완료해주세요");
				return ResponseEntity.badRequest().body(errorMap);
			}

			if (!activeReward.hasAvailableArtifact()) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "사용 가능한 아티팩트 보상이 없습니다");
				errorMap.put("message", "이미 수령했거나 아티팩트 보상이 없습니다");
				return ResponseEntity.badRequest().body(errorMap);
			}

			ArtifactDto artifact = activeReward.getAvailableArtifact();

			String artifactResult = rewardService.claimArtifactReward(PlayerID);

			boolean success = artifactResult.contains("획득 완료");

			Map<String, Object> responseMap = new HashMap<>();
			responseMap.put("stage", "claimCompleted");
			responseMap.put("claimType", "artifact");
			responseMap.put("success", success);
			responseMap.put("message", artifactResult);

			if (success) {
				Map<String, Object> artifactInfo = new HashMap<>();
				artifactInfo.put("artifactID", artifact.getArtifactID());
				artifactInfo.put("name", artifact.getArtifactName());
				artifactInfo.put("description", artifact.getArtifactText());
				artifactInfo.put("effect", artifact.getArtifactEffect());

				responseMap.put("artifactReceived", artifactInfo);
				responseMap.put("artifactMessage", artifact.getArtifactName() + "을 획득했습니다");

				Map<String, Object> remainingRewards = getRemainingRewardsStatus(activeReward);
				responseMap.put("remainingRewards", remainingRewards);
				responseMap.put("nextStep", determineNextStep(activeReward));

				System.out.println("아티팩트 보상 수령 완료 : " + artifact.getArtifactName());
			} else {
				responseMap.put("error", "아티팩트 보상 적용 실패");
				System.err.println("아티팩트 보상 적용 실패 : " + artifactResult);
			}

			return ResponseEntity.ok(responseMap);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorMap = new HashMap<>();
			errorMap.put("error", "아티팩트 보상 수령 중 오류 발생");
			errorMap.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(errorMap);
		}
	}

	@PostMapping("/claim/skill")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> claimSkillReward(@RequestParam("PlayerID") String PlayerID,
			@RequestParam("selectedSkillID") int selectedSkillID) {
		System.out.println("스킬 보상 수령 - Player : " + PlayerID + ", SelectedSkill : " + selectedSkillID);

		try {
			ActiveRewardDto activeReward = rewardService.getCurrentRewards(PlayerID);
			if (activeReward == null) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "활성 보상이 없습니다");
				errorMap.put("message", "전투를 완료해주세요");
				return ResponseEntity.badRequest().body(errorMap);
			}

			if (!activeReward.hasAvailableSkills()) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "사용 가능한 스킬 보상이 없습니다");
				errorMap.put("message", "이미 수령했거나 스킬 보상이 없습니다");
				return ResponseEntity.badRequest().body(errorMap);
			}

			SkillDto selectedSkill = null;
			for (SkillDto skill : activeReward.getAvailableSkills()) {
				if (skill.getSkill_id() == selectedSkillID) {
					selectedSkill = skill;
					break;
				}
			}

			if (selectedSkill == null) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "잘못된 스킬 선택");
				errorMap.put("message", "선택 가능한 스킬 목록에 없는 스킬입니다");
				errorMap.put("availableSkillIDs",
						activeReward.getAvailableSkills().stream().map(SkillDto::getSkill_id).toArray());
				return ResponseEntity.badRequest().body(errorMap);
			}

			int currentSkillCount = skillservice.getOwnedSkillCount(PlayerID);

			Map<String, Object> responseMap = new HashMap<>();

			if (currentSkillCount < 10) {
				String result = rewardService.claimSkillReward(PlayerID, selectedSkillID);
				boolean success = result.contains("획득하였습니다");

				responseMap.put("stage", "skillAdded");
				responseMap.put("success", success);
				responseMap.put("message", result);
				responseMap.put("action", "added");

				if (success) {
					Map<String, Object> skillInfo = createSkillInfoMap(selectedSkill);

					responseMap.put("skillReceived", skillInfo);
				}
			} else {
				List<SkillDto> currentSkills = skillservice.getPlayerSkillList(PlayerID);

				responseMap.put("stage", "skillReplaceRequired");
				responseMap.put("success", false);
				responseMap.put("message", "보유 스킬이 10개입니다. 교체할 스킬을 선택해주세요");
				responseMap.put("action", "replace_required");
				responseMap.put("nextStep", "selectSkill");

				Map<String, Object> selectedSkillInfo = createSkillInfoMap(selectedSkill);

				responseMap.put("selectedSkill", selectedSkillInfo);

				List<Map<String, Object>> currentSkillsList = new ArrayList<>();
				for (SkillDto skill : currentSkills) {
					Map<String, Object> skillInfo = createSkillInfoMap(skill);
					currentSkillsList.add(skillInfo);
				}

				responseMap.put("currentSkills", currentSkillsList);
				responseMap.put("currentSkillCount", currentSkills.size());
			}

			return ResponseEntity.ok(responseMap);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorMap = new HashMap<>();
			errorMap.put("error", "스킬 보상 수령 중 오류 발생");
			errorMap.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(errorMap);
		}
	}

	@PostMapping("/replace/skill")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> replaceSkillReward(@RequestParam("PlayerID") String PlayerID,
			@RequestParam("newSkillID") int newSkillID, @RequestParam("oldSkillID") int oldSkillID) {
		System.out.println("스킬 교체 시도 : " + PlayerID);

		try {
			ActiveRewardDto activeReward = rewardService.getCurrentRewards(PlayerID);
			if (activeReward == null) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "활성 보상이 없습니다");
				errorMap.put("message", "전투를 완료해주세요");
				return ResponseEntity.badRequest().body(errorMap);
			}

			if (!activeReward.hasAvailableSkills()) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "사용 가능한 스킬 보상이 없습니다");
				errorMap.put("message", "이미 수령했거나 스킬 보상이 없습니다");
				return ResponseEntity.badRequest().body(errorMap);
			}

			if (!activeReward.isSkillAvailable(newSkillID)) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "유효하지 않은 새 스킬입니다");
				errorMap.put("message", "선택 가능한 스킬이 아닙니다");
				return ResponseEntity.badRequest().body(errorMap);
			}

			List<SkillDto> currentSkills = skillservice.getPlayerSkillList(PlayerID);
			SkillDto oldSkill = null;
			SkillDto newSkill = null;

			for (SkillDto skill : currentSkills) {
				if (skill.getSkill_id() == oldSkillID) {
					oldSkill = skill;
					break;
				}
			}

			for (SkillDto skill : activeReward.getAvailableSkills()) {
				if (skill.getSkill_id() == newSkillID) {
					newSkill = skill;
					break;
				}
			}

			if (oldSkill == null) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "교체하려는 스킬을 보유하고 있지 않습니다");
				errorMap.put("message", "올바른 스킬을 선택해주세요");
				return ResponseEntity.badRequest().body(errorMap);
			}

			if (newSkill == null) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "새로운 스킬 정보를 찾을 수 없습니다");
				return ResponseEntity.badRequest().body(errorMap);
			}

			String result = skillservice.replacePlayerSkill(PlayerID, String.valueOf(oldSkillID),
					String.valueOf(newSkillID));

			boolean success = result.contains("성공");

			Map<String, Object> responseMap = new HashMap<>();
			responseMap.put("stage", "skillReplaced");
			responseMap.put("success", success);
			responseMap.put("message", result);
			responseMap.put("action", "replaced");

			if (success) {
				activeReward.claimSkill(newSkillID);

				Map<String, Object> newSkillInfo = createSkillInfoMap(newSkill);
				responseMap.put("newSkill", newSkillInfo);

				Map<String, Object> oldSkillInfo = createSkillInfoMap(oldSkill);
				responseMap.put("oldSkill", oldSkillInfo);
			}

			return ResponseEntity.ok(responseMap);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorMap = new HashMap<>();
			errorMap.put("error", "스킬 교체 중 오류 발생 : " + e.getMessage());
			return ResponseEntity.badRequest().body(errorMap);
		}
	}

	@GetMapping("/skills/current")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> getCurrentSkills(@RequestParam("PlayerID") String PlayerID) {
		System.out.println("현재 스킬 목록 조회 : " + PlayerID);

		try {
			List<SkillDto> currentSkills = skillservice.getPlayerSkillList(PlayerID);
			int skillCount = currentSkills.size();

			Map<String, Object> responseMap = new HashMap<>();
			responseMap.put("success", true);
			responseMap.put("skillCount", skillCount);
			responseMap.put("maxSkillCount", 10);
			responseMap.put("canAddDirectly", skillCount < 10);

			List<Map<String, Object>> skillsList = createSkillListMap(currentSkills);

			responseMap.put("skills", skillsList);
			responseMap.put("message", "현재 보유 스킬 목록 조회 완료");
			
			return ResponseEntity.ok(responseMap);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorMap = new HashMap<>();
			errorMap.put("error", "스킬 목록 조회 중 오류 발생 : " + e.getMessage());
			errorMap.put("success", false);
			return ResponseEntity.badRequest().body(errorMap);
		}
	}

	private SkillDto validateSelectedSkill(ActiveRewardDto activeReward, int skillID) {
		return activeReward.getAvailableSkills().stream().filter(skill -> skill.getSkill_id() == skillID).findFirst()
				.orElse(null);
	}

	private Map<String, Object> createSkillInfoMap(SkillDto skill) {
		Map<String, Object> skillInfo = new HashMap<>();
		skillInfo.put("skillID", skill.getSkill_id());
		skillInfo.put("name", skill.getSkill_name());
		skillInfo.put("description", skill.getSkill_text());
		skillInfo.put("damage", skill.getMin_damage() + "~" + skill.getMax_damage());
		skillInfo.put("element", skill.getElement());
		skillInfo.put("rarity", skill.getRarity());
		skillInfo.put("type", skill.getSkill_type());
		skillInfo.put("target", skill.getHit_target());
		return skillInfo;
	}

	private List<Map<String, Object>> createSkillListMap(List<SkillDto> skills) {
		List<Map<String, Object>> skillList = new ArrayList<>();
		for (SkillDto skill : skills) {
			skillList.add(createSkillInfoMap(skill));
		}
		return skillList;
	}

	private Map<String, Object> createErrorResponse(String message) {
		Map<String, Object> errorMap = new HashMap<>();
		errorMap.put("success", false);
		errorMap.put("error", message);
		return errorMap;
	}

	@PostMapping("/claim/proceed")
	@ResponseBody
	public ResponseEntity<Map<String, Object>> proceedToCamp(@RequestParam("PlayerID") String PlayerID) {
		System.out.println("캠프로 이동 - Player : " + PlayerID);

		try {
			ActiveRewardDto activeReward = rewardService.getCurrentRewards(PlayerID);
			if (activeReward == null) {
				Map<String, Object> errorMap = new HashMap<>();
				errorMap.put("error", "활성 보상이 없습니다");
				errorMap.put("message", "이미 처리되었거나 전투를 완료하지 않았습니다");
				return ResponseEntity.badRequest().body(errorMap);
			}

			List<String> availableRewards = new ArrayList<>();
			if (activeReward.hasAvailableSkills()) {
				availableRewards.add("스킬 선택 (" + activeReward.getAvailableSkills().size() + " 개");
			}
			if (activeReward.hasAvailableArtifact()) {
				availableRewards.add("아티팩트: " + activeReward.getAvailableArtifact().getArtifactName());
			}
			if (activeReward.hasAvailableHeal()) {
				availableRewards.add("회복 보상");
			}
			if (activeReward.hasAvailableGold()) {
				availableRewards.add("골드: " + activeReward.getGoldAmount());
			}

			String proceedResult = rewardService.proceedToCamp(PlayerID);

			processUsedPhoenixFeather(PlayerID);
			cleanupBattleSession(PlayerID);

			Map<String, Object> responseMap = new HashMap<>();
			responseMap.put("stage", "battlePhaseCompleted");
			responseMap.put("action", "proceedToCamp");
			responseMap.put("success", true);
			responseMap.put("message", proceedResult);

			if (!availableRewards.isEmpty()) {
				responseMap.put("availableRewards", availableRewards);
				responseMap.put("availableCount", availableRewards.size());
				responseMap.put("note", "챙길 것을 챙기고 캠프로 이동했습니다");
			} else {
				responseMap.put("note", "모든 것을 챙기고 캠프로 이동했습니다");
			}

			Map<String, Object> campInfo = new HashMap<>();
			campInfo.put("nextStageEndpoint", "/api/camp/nextstage"); // 이부분은 나중에 수정
			campInfo.put("method", "POST");
			campInfo.put("parameter", Map.of("playerId", "PlayerID"));
			campInfo.put("description", "다음 여정을 위해 캠프로 이동합니다");

			responseMap.put("camfInfo", campInfo);
			responseMap.put("nextStep", "camp");
			responseMap.put("battlePhase", "ended");

			System.out.println("전투 페이즈 종료 - 캠프로 이동 : " + PlayerID);

			return ResponseEntity.ok(responseMap);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorMap = new HashMap<>();
			errorMap.put("error", "캠프 이동 중 오류 발생");
			errorMap.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(errorMap);
		}
	}

}
