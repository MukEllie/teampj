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

	/** 정비소 초기 데이터 */
	@GetMapping
	public ResponseEntity<Map<String, Object>> getCamp(@RequestParam String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		Map<String, Object> body = new HashMap<>();
		body.put("playerId", playerId);
		body.put("whereStage", p != null ? p.getWhereStage() : null);
		body.put("whereSession", p != null ? p.getWhereSession() : null);
		body.put("canAdvanceLayer", p != null && p.getWhereStage() == 10);
		return ResponseEntity.ok(body);
	}

	/**
	 * 다음 스테이지 진행 (스테이지 +1 및 5/10층 전투강제 포함) - 단, 현재 스테이지가 10이면 '전투로 가지 않고' 캠프로 되돌리도록
	 * 지시(방어 로직)
	 */
	@PostMapping("/nextstage")
	public ResponseEntity<Map<String, Object>> nextStage(@RequestParam String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);

		// ★ 방어: 10층에서는 nextstage 금지 → 클라이언트에 캠프로 돌아가라 지시
		if (p != null && p.getWhereStage() >= 10) {
			Map<String, Object> guard = new HashMap<>();
			guard.put("decision", "redirectToCamp");
			guard.put("redirect", "/camp?playerId=" + playerId);
			guard.put("reason", "stage_is_10__nextstage_not_allowed");
			// 상태코드는 200으로 두고 클라이언트에서 분기 처리(핸들링 쉬움)
			return ResponseEntity.ok(guard);
			// 만약 409 등의 에러코드를 쓰고 싶다면:
			// return ResponseEntity.status(409).body(guard);
		}

		boolean goBattle = campService.decideBattleOrEvent(playerId);

		// +1 반영 후 최신 상태 재조회
		p = characterStatusMapper.getPlayerInfo(playerId);

		Map<String, Object> body = new HashMap<>();
		body.put("playerId", playerId);
		body.put("whereStage", p != null ? p.getWhereStage() : null);
		body.put("whereSession", p != null ? p.getWhereSession() : null);
		body.put("canAdvanceLayer", p != null && p.getWhereStage() == 10);

		if (goBattle) {
			body.put("decision", "battle");
			Map<String, Object> battle = new HashMap<>();
			battle.put("url", "/battle/start");
			battle.put("method", "POST");
			Map<String, String> form = new HashMap<>();
			form.put("PlayerID", playerId); // 대소문자 주의
			battle.put("form", form);
			body.put("battleStart", battle);
		} else {
			body.put("decision", "event");
			body.put("eventRouter", "/api/event/triggerNonBoss");
		}
		return ResponseEntity.ok(body);
	}

	/** 다음 계층으로 이동 (계층 순환 + 스테이지=1) */
	@PostMapping("/nextlayer")
	public ResponseEntity<Map<String, Object>> nextLayer(@RequestParam String playerId) {
		String nextSession = campService.advanceLayer(playerId);
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);

		Map<String, Object> body = new HashMap<>();
		body.put("ok", nextSession != null);
		body.put("playerId", playerId);
		body.put("whereStage", p != null ? p.getWhereStage() : null);
		body.put("whereSession", p != null ? p.getWhereSession() : null);
		body.put("canAdvanceLayer", p != null && p.getWhereStage() == 10);
		return ResponseEntity.ok(body);
	}
}