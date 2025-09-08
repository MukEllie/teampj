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

	/** 정비소 화면 초기 데이터 */
	@GetMapping
	public ResponseEntity<Map<String, Object>> getCamp(@RequestParam String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		Map<String, Object> body = new HashMap<>();
		body.put("playerId", playerId);
		body.put("whereStage", p != null ? p.getWhereStage() : null);
		body.put("whereSession", p != null ? p.getWhereSession() : null);
		// TODO: 카드/아티팩트/골드 등 필요시 추가
		return ResponseEntity.ok(body);
	}

	/** 다음 스테이지로 (스테이지 +1 및 보스층 강제 전투 포함) */
	@PostMapping("/nextstage")
	public ResponseEntity<Map<String, Object>> nextStage(@RequestParam String playerId) {
		boolean goBattle = campService.decideBattleOrEvent(playerId);

		// +1 반영 후 최신 상태 재조회
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);

		Map<String, Object> body = new HashMap<>();
		body.put("playerId", playerId);
		body.put("whereStage", p != null ? p.getWhereStage() : null);
		body.put("whereSession", p != null ? p.getWhereSession() : null);

		if (goBattle) {
			body.put("decision", "battle");
			// BattleController는 PlayerID(대소문자 주의)로 POST /battle/start
			Map<String, Object> battle = new HashMap<>();
			battle.put("url", "/battle/start");
			battle.put("method", "POST");
			Map<String, String> form = new HashMap<>();
			form.put("PlayerID", playerId);
			battle.put("form", form);
			body.put("battleStart", battle);
		} else {
			body.put("decision", "event");
			// 이벤트는 클라이언트에서 /api/event/triggerNonBoss 등을 호출해 다음 타입 결정
			body.put("eventRouter", "/api/event/triggerNonBoss");
		}

		return ResponseEntity.ok(body);
	}
}