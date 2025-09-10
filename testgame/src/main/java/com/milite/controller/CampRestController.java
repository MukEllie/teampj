package com.milite.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.milite.dto.PlayerDto;
import com.milite.mapper.CharacterStatusMapper;
import com.milite.service.CampService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/camp")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" }, allowCredentials = "true")
@RequiredArgsConstructor
public class CampRestController {

	private final CampService campService;
	private final CharacterStatusMapper characterStatusMapper;

	/** 정비소 초기 상태 (Battle 스타일: PlayerID 파라미터) */
	@GetMapping
	public ResponseEntity<Map<String, Object>> getCamp(@RequestParam("PlayerID") String PlayerID) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(PlayerID);

		Map<String, Object> body = new HashMap<>();
		body.put("playerId", PlayerID); // 응답 키는 프런트 호환 위해 그대로 소문자 사용
		body.put("whereStage", p != null ? p.getWhereStage() : null);
		body.put("whereSession", p != null ? p.getWhereSession() : null);
		body.put("canAdvanceLayer", p != null && p.getWhereStage() == 10);
		return ResponseEntity.ok(body);
	}

	/** 다음 스테이지 진행: 5/10층 진입은 전투 강제, 10층에서는 방어(redirectToCamp) */
	@PostMapping("/nextstage")
	public ResponseEntity<Map<String, Object>> nextStage(@RequestParam("PlayerID") String PlayerID) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(PlayerID);

		// ★ 10층 방어: nextstage 호출 금지 → 앱 레벨 시그널로 캠프로 리디렉션
		if (p != null && p.getWhereStage() == 10) {
			Map<String, Object> guard = new HashMap<>();
			guard.put("decision", "redirectToCamp");
			guard.put("redirect", "/camp?PlayerID=" + PlayerID);
			guard.put("reason", "stage_is_10__nextstage_not_allowed");
			return ResponseEntity.ok(guard);
		}

		// 서비스에서 whereStage += 1 && 70%/30% && (5/10층 전투강제) 처리
		boolean goBattle = campService.decideBattleOrEvent(PlayerID);

		// 최신 상태 재조회
		p = characterStatusMapper.getPlayerInfo(PlayerID);

		Map<String, Object> body = new HashMap<>();
		body.put("playerId", PlayerID);
		body.put("whereStage", p != null ? p.getWhereStage() : null);
		body.put("whereSession", p != null ? p.getWhereSession() : null);
		body.put("canAdvanceLayer", p != null && p.getWhereStage() == 10);

		if (goBattle) {
			body.put("decision", "battle");
			Map<String, Object> battle = new HashMap<>();
			battle.put("url", "/battle/start");
			battle.put("method", "POST");
			Map<String, String> form = new HashMap<>();
			form.put("PlayerID", PlayerID); // Battle과 동일
			battle.put("form", form);
			body.put("battleStart", battle);
		} else {
			body.put("decision", "event");
			body.put("eventRouter", "/api/event/trigger/non-boss");
		}
		return ResponseEntity.ok(body);
	}

	/** 다음 계층으로 이동: 세션 순환(물→불→풀→물...) + 스테이지 1로 초기화 */
	@PostMapping("/nextlayer")
	public ResponseEntity<Map<String, Object>> nextLayer(@RequestParam("PlayerID") String PlayerID) {
		String nextSession = campService.advanceLayer(PlayerID);
		PlayerDto p = characterStatusMapper.getPlayerInfo(PlayerID);

		Map<String, Object> body = new HashMap<>();
		body.put("ok", nextSession != null);
		body.put("playerId", PlayerID);
		body.put("whereStage", p != null ? p.getWhereStage() : null);
		body.put("whereSession", p != null ? p.getWhereSession() : null);
		body.put("canAdvanceLayer", p != null && p.getWhereStage() == 10);
		return ResponseEntity.ok(body);
	}
}