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

import com.milite.service.CampService;
import com.milite.service.EventService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/camp")
@CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000" }, allowCredentials = "true")
@RequiredArgsConstructor
public class CampRestController {

	private final CampService campService;
	private final EventService eventService;

	/** 정비소 화면 초기 데이터 (필요 시 확장) */
	@GetMapping
	public ResponseEntity<Map<String, Object>> getCamp(@RequestParam String playerId) {
		Map<String, Object> body = new HashMap<>();
		body.put("playerId", playerId);
		// TODO: 현재 카드/골드/아티팩트 요약 등 필요하면 채워넣기
		return ResponseEntity.ok(body);
	}

	/** 다음 스테이지: 70% 전투 / 30% 이벤트 */
	@PostMapping("/nextstage")
	public ResponseEntity<Map<String, Object>> nextStage(@RequestParam String playerId) {
		boolean goBattle = campService.decideBattleOrEvent(); // true=전투(70), false=이벤트(30)
		Map<String, Object> body = new HashMap<>();
		body.put("playerId", playerId);
		if (goBattle) {
			// React가 직접 /battle/start 로 POST하기 위한 명세 제공
			Map<String, Object> battle = new HashMap<>();
			battle.put("url", "/battle/start");
			battle.put("method", "POST");
			// BattleController 요구 파라미터명은 PlayerID (대소문자 주의)
			Map<String, String> form = new HashMap<>();
			form.put("PlayerID", playerId);
			battle.put("form", form);

			body.put("decision", "battle");
			body.put("battleStart", battle);
		} else {
			body.put("decision", "event");
			// 이벤트는 EventRestController를 활용해서 클라이언트가 이어가도록
			// 즉시 특정 타입을 정하고 싶다면 여기서 eventService.prepare*() 결과를 내려도 됨.
		}
		return ResponseEntity.ok(body);
	}
}