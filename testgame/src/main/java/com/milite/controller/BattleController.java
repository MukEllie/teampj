package com.milite.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.milite.dto.*;
import com.milite.service.BattleService;
import com.milite.service.SkillService;

import lombok.*;

import java.util.*;

@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/battle") // 경로는 필요에 의해 수정 해야함
@RestController
public class BattleController {

	@Setter(onMethod_ = @Autowired)
	private BattleService service;

	@Setter(onMethod_ = @Autowired)
	private SkillService skillservice;

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
			Map<String, Object> rewards = Map.of();// 보상 설정 관련용

			if (playerAlive && !hasAliveMonsters) {
				battleResult = "Victory";
				// 보상관련 메서드 삽입
				System.out.println("플레이어 승리!");
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

			cleanupBattleSession(PlayerID);

			  Map<String, Object> responseMap = new HashMap<>();
	            responseMap.put("stage", "completed");
	            responseMap.put("battleResult", battleResult);
	            responseMap.put("rewards", rewards);
	            responseMap.put("finalStatus", finalStatus);
	            responseMap.put("message", battleResult.equals("Victory") 
	                    ? "전투에서 승리하였습니다." 
	                    : "전투에서 패배하였습니다.");
	            
	            return ResponseEntity.ok(responseMap);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("error", "전투 종료 중 오류 발생 : " + e.getMessage());
            return ResponseEntity.badRequest().body(errorMap);
		}
	}

	/*@GetMapping("/test")
	@ResponseBody
	public ResponseEntity<String> test() {
		System.out.println("=== TEST 메서드 호출됨 ===");
		System.out.println("현재 시간: " + new java.util.Date());
		return ResponseEntity.ok("테스트 성공! 컨트롤러가 정상 작동합니다.");
	}*/

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
		return skillservice.getSkillInfo(skillID);
	}

	private boolean checkBattleEndCondition(Map<String, Object> status) {
		Integer playerHp = (Integer) status.get("playerHp");
		List<?> aliveMonsters = (List<?>) status.get("aliveMonsters");

		return playerHp <= 0 || aliveMonsters.isEmpty();
	}

	private void cleanupBattleSession(String PlayerID) {
		System.out.println("전투 세션 정리 완료 : " + PlayerID);
	}
}
