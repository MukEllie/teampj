package com.milite.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.milite.dto.ArtifactDto;
import com.milite.dto.ArtifactEventDto;
import com.milite.dto.BossEventDto;
import com.milite.dto.CardEventDto;
import com.milite.dto.NormalEventDto;
import com.milite.dto.RollEventDto;
import com.milite.dto.SelectChoiceDto;
import com.milite.dto.SelectEventDto;
import com.milite.dto.SkillDto;
import com.milite.dto.TrapEventDto;
import com.milite.service.EventService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/event")
public class EventController {

	private final EventService eventService;

	/** 랜덤 이벤트 트리거 진입 */
	@GetMapping("/trigger/{playerId}")
	public ResponseEntity<ApiResponse<String>> trigger(@PathVariable String playerId) {
		String next = eventService.triggerRandomEvent(playerId);
		return ResponseEntity.ok(ApiResponse.ok("랜덤 이벤트 트리거 완료", next));
	}

	/** 보스 제외 랜덤 트리거 */
	@GetMapping("/trigger/non-boss/{playerId}")
	public ResponseEntity<ApiResponse<String>> triggerNonBoss(@PathVariable String playerId) {
		String next = eventService.triggerRandomNonBoss(playerId);
		return ResponseEntity.ok(ApiResponse.ok("보스 제외 트리거 완료", next));
	}

	/* Normal */
	/** 일반 이벤트 조회 */
	@GetMapping("/normal")
	public ResponseEntity<ApiResponse<NormalEventDto>> normal(@RequestParam String playerId) {
		NormalEventDto e = eventService.prepareNormal(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 일반 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok("일반 이벤트 조회 완료", e));
	}

	/** 일반 이벤트 적용 */
	@PostMapping(value = "/normal/apply", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	public ResponseEntity<ApiResponse<String>> normalApply(@RequestParam String playerId, @RequestParam int ne_id) {
		return ResponseEntity.ok(ApiResponse.ok("적용 완료", eventService.applyNormal(playerId, ne_id)));
	}

	/* Roll */
	/** 주사위 이벤트 조회 */
	@GetMapping("/roll")
	public ResponseEntity<ApiResponse<RollEventDto>> roll(@RequestParam String playerId) {
		RollEventDto e = eventService.prepareRoll(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 주사위 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok("주사위 이벤트 조회 완료", e));
	}

	/** 주사위 이벤트 적용 */
	@PostMapping(value = "/roll/apply", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	public ResponseEntity<ApiResponse<String>> rollApply(@RequestParam String playerId, @RequestParam int re_id) {
		return ResponseEntity.ok(ApiResponse.ok("적용 완료", eventService.applyRoll(playerId, re_id)));
	}

	/* Trap */
	/** 함정 이벤트 조회 */
	@GetMapping("/trap")
	public ResponseEntity<ApiResponse<TrapEventDto>> trap(@RequestParam String playerId) {
		TrapEventDto e = eventService.prepareTrap(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 함정 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok("함정 이벤트 조회 완료", e));
	}

	/** 함정 이벤트 적용 */
	@PostMapping(value = "/trap/apply", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	public ResponseEntity<ApiResponse<String>> trapApply(@RequestParam String playerId, @RequestParam int te_id) {
		return ResponseEntity.ok(ApiResponse.ok("적용 완료", eventService.applyTrap(playerId, te_id)));
	}

	/* Select */
	/** 선택 이벤트 조회 */
	@GetMapping("/select")
	public ResponseEntity<ApiResponse<SelectEventDto>> select(@RequestParam String playerId) {
		SelectEventDto e = eventService.prepareSelect(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 선택 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok("선택 이벤트 조회 완료", e));
	}

	/** 선택 이벤트 선택지 조회 */
	@GetMapping("/select/choices")
	public ResponseEntity<ApiResponse<List<SelectChoiceDto>>> selectChoices(@RequestParam int se_id) {
		List<SelectChoiceDto> choices = eventService.getSelectChoices(se_id);
		return ResponseEntity.ok(ApiResponse.ok("선택지 조회 완료", choices));
	}

	/** 선택 이벤트 적용 */
	@PostMapping(value = "/select/apply", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	public ResponseEntity<ApiResponse<String>> selectApply(@RequestParam String playerId, @RequestParam int sec_id) {
		return ResponseEntity.ok(ApiResponse.ok("적용 완료", eventService.applySelect(playerId, sec_id)));
	}

	/* Card */
	/** 카드 이벤트 조회 */
	@GetMapping("/card")
	public ResponseEntity<ApiResponse<CardEventDto>> card(@RequestParam String playerId) {
		CardEventDto e = eventService.prepareCard(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 카드 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok("카드 이벤트 조회 완료", e));
	}

	/** 카드 후보 3장 조회 */
	@GetMapping("/card/candidates")
	public ResponseEntity<ApiResponse<List<SkillDto>>> cardCandidates(@RequestParam String playerId) {
		List<SkillDto> skills = eventService.getCardChoicesFromSkillDB(playerId);
		return ResponseEntity.ok(ApiResponse.ok("카드 후보 조회 완료", skills));
	}

	/** 카드 이벤트 적용 */
	@PostMapping(value = "/card/apply", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	public ResponseEntity<ApiResponse<String>> cardApply(@RequestParam String playerId, @RequestParam int ce_id,
			@RequestParam int skillId) {
		return ResponseEntity.ok(ApiResponse.ok("적용 완료", eventService.applyCardGain(playerId, ce_id, skillId)));
	}

	/* Artifact */
	/** 아티팩트 이벤트 조회 */
	@GetMapping("/artifact")
	public ResponseEntity<ApiResponse<ArtifactEventDto>> artifact(@RequestParam String playerId) {
		ArtifactEventDto e = eventService.prepareArtifact(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 아티팩트 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok("아티팩트 이벤트 조회 완료", e));
	}

	/** 아티팩트 후보 3개 조회 */
	@GetMapping("/artifact/candidates")
	public ResponseEntity<ApiResponse<List<ArtifactDto>>> artifactCandidates(@RequestParam String playerId) {
		List<ArtifactDto> items = eventService.getArtifactCandidates(playerId);
		return ResponseEntity.ok(ApiResponse.ok("아티팩트 후보 조회 완료", items));
	}

	/** 아티팩트 이벤트 적용 */
	@PostMapping(value = "/artifact/apply", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	public ResponseEntity<ApiResponse<String>> artifactApply(@RequestParam String playerId, @RequestParam int ae_id,
			@RequestParam int artifactId) {
		return ResponseEntity.ok(ApiResponse.ok("적용 완료", eventService.applyArtifactGain(playerId, ae_id, artifactId)));
	}

	/* Boss */
	/** 보스 이벤트 조회 */
	@GetMapping("/boss")
	public ResponseEntity<ApiResponse<BossEventDto>> boss(@RequestParam String playerId) {
		BossEventDto e = eventService.prepareBoss(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 보스 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok("보스 이벤트 조회 완료", e));
	}

	/** 보스 이벤트 진행(전투 진입) */
	@PostMapping(value = "/boss/fight", consumes = { MediaType.APPLICATION_JSON_VALUE,
			MediaType.APPLICATION_FORM_URLENCODED_VALUE })
	public ResponseEntity<ApiResponse<String>> bossFight(@RequestParam String playerId, @RequestParam int be_id) {
		String msg = eventService.applyBossEnter(playerId, be_id);
		// 프론트는 이 응답을 받은 뒤 POST /battle/event 호출로 전투 진입
		return ResponseEntity.ok(ApiResponse.ok(msg, "/battle/event"));
	}

	/* 공통 */
	/** API 응답 래퍼 */
	@Data
	static class ApiResponse<T> {
		private boolean success;
		private String message;
		private T data;

		static <T> ApiResponse<T> ok(String message, T data) {
			ApiResponse<T> r = new ApiResponse<>();
			r.success = true;
			r.message = message;
			r.data = data;
			return r;
		}

		static <T> ApiResponse<T> fail(String message) {
			ApiResponse<T> r = new ApiResponse<>();
			r.success = false;
			r.message = message;
			return r;
		}

		static <T> ApiResponse<T> fail(String message, T data) {
			ApiResponse<T> r = new ApiResponse<>();
			r.success = false;
			r.message = message;
			r.data = data;
			return r;
		}
	}
}