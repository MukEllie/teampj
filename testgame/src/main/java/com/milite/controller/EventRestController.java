package com.milite.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
@RequestMapping("/api/event")
@RequiredArgsConstructor
public class EventRestController {

	private final EventService eventService;

	/* ===================== Trigger ===================== */

	/** 랜덤 이벤트 타입 리다이렉션 힌트 제공 (문자열 그대로 반환) */
	@GetMapping("/trigger/{playerId}")
	public ResponseEntity<ApiResponse<Map<String, String>>> trigger(@PathVariable String playerId) {
		String next = eventService.triggerRandomEvent(playerId); // 예: "forward:/event/normal?playerId=xxx"
		Map<String, String> data = new HashMap<>();
		data.put("next", next);
		data.put("playerId", playerId);
		return ResponseEntity.ok(ApiResponse.ok(data));
	}

	/** 보스 제외 랜덤 이벤트 */
	@GetMapping("/trigger/non-boss/{playerId}")
	public ResponseEntity<ApiResponse<Map<String, String>>> triggerNonBoss(@PathVariable String playerId) {
		String next = eventService.triggerRandomNonBoss(playerId);
		Map<String, String> data = new HashMap<>();
		data.put("next", next);
		data.put("playerId", playerId);
		return ResponseEntity.ok(ApiResponse.ok(data));
	}

	/* ===================== Normal ===================== */

	/** 일반 이벤트 1건 준비 */
	@GetMapping("/normal")
	public ResponseEntity<ApiResponse<NormalEventDto>> showNormal(@RequestParam String playerId) {
		NormalEventDto e = eventService.prepareNormal(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 일반 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok(e));
	}

	/** 일반 이벤트 적용 */
	@PostMapping("/normal/apply")
	public ResponseEntity<ApiResponse<String>> applyNormal(@RequestBody NormalApplyRequest req) {
		String msg = eventService.applyNormal(req.getPlayerId(), req.getNe_id());
		return ResponseEntity.ok(ApiResponse.ok(msg));
	}

	/* ===================== Roll ===================== */

	/** 주사위 이벤트 1건 준비 */
	@GetMapping("/roll")
	public ResponseEntity<ApiResponse<RollEventDto>> showRoll(@RequestParam String playerId) {
		RollEventDto e = eventService.prepareRoll(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 주사위 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok(e));
	}

	/** 주사위 이벤트 적용 (Luck 보정은 ServiceImpl에 이미 반영됨) */
	@PostMapping("/roll/apply")
	public ResponseEntity<ApiResponse<String>> applyRoll(@RequestBody RollApplyRequest req) {
		String msg = eventService.applyRoll(req.getPlayerId(), req.getRe_id());
		return ResponseEntity.ok(ApiResponse.ok(msg));
	}

	/* ===================== Trap ===================== */

	/** 함정 이벤트 1건 준비 */
	@GetMapping("/trap")
	public ResponseEntity<ApiResponse<TrapEventDto>> showTrap(@RequestParam String playerId) {
		TrapEventDto e = eventService.prepareTrap(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 함정 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok(e));
	}

	/** 함정 이벤트 적용 (Luck 보정은 ServiceImpl에 이미 반영됨) */
	@PostMapping("/trap/apply")
	public ResponseEntity<ApiResponse<String>> applyTrap(@RequestBody TrapApplyRequest req) {
		String msg = eventService.applyTrap(req.getPlayerId(), req.getTe_id());
		return ResponseEntity.ok(ApiResponse.ok(msg));
	}

	/* ===================== Select ===================== */

	/** 선택 이벤트 본문 준비 */
	@GetMapping("/select")
	public ResponseEntity<ApiResponse<SelectEventDto>> showSelect(@RequestParam String playerId) {
		SelectEventDto e = eventService.prepareSelect(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 선택 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok(e));
	}

	/** 선택 이벤트 선택지 조회 */
	@GetMapping("/select/choices")
	public ResponseEntity<ApiResponse<List<SelectChoiceDto>>> getSelectChoices(@RequestParam int se_id) {
		List<SelectChoiceDto> choices = eventService.getSelectChoices(se_id);
		return ResponseEntity.ok(ApiResponse.ok(choices));
	}

	/** 선택 이벤트 적용 */
	@PostMapping("/select/apply")
	public ResponseEntity<ApiResponse<String>> applySelect(@RequestBody SelectApplyRequest req) {
		String msg = eventService.applySelect(req.getPlayerId(), req.getSec_id());
		return ResponseEntity.ok(ApiResponse.ok(msg));
	}

	/* ===================== Card ===================== */

	/** 카드 이벤트 인트로 */
	@GetMapping("/card")
	public ResponseEntity<ApiResponse<CardEventDto>> showCard(@RequestParam String playerId) {
		CardEventDto e = eventService.prepareCard(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 카드 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok(e));
	}

	/** 카드 후보 3장 (SkillDB 기준, 보유 제외) */
	@GetMapping("/card/skills")
	public ResponseEntity<ApiResponse<List<SkillDto>>> getCardSkills(@RequestParam String playerId) {
		List<SkillDto> skills = eventService.getCardChoicesFromSkillDB(playerId);
		return ResponseEntity.ok(ApiResponse.ok(skills));
	}

	/** 카드 이벤트 적용 */
	@PostMapping("/card/apply")
	public ResponseEntity<ApiResponse<String>> applyCard(@RequestBody CardApplyRequest req) {
		String msg = eventService.applyCardGain(req.getPlayerId(), req.getCe_id(), req.getSkillId());
		return ResponseEntity.ok(ApiResponse.ok(msg));
	}

	/* ===================== Artifact ===================== */

	/** 아티팩트 이벤트 인트로 */
	@GetMapping("/artifact")
	public ResponseEntity<ApiResponse<ArtifactEventDto>> showArtifact(@RequestParam String playerId) {
		ArtifactEventDto e = eventService.prepareArtifact(playerId);
		if (e == null)
			return ResponseEntity.ok(ApiResponse.fail("표시할 아티팩트 이벤트가 없습니다."));
		return ResponseEntity.ok(ApiResponse.ok(e));
	}

	/** 아티팩트 후보 3개 */
	@GetMapping("/artifact/candidates")
	public ResponseEntity<ApiResponse<List<ArtifactDto>>> getArtifactCandidates(@RequestParam String playerId) {
		List<ArtifactDto> list = eventService.getArtifactCandidates(playerId);
		return ResponseEntity.ok(ApiResponse.ok(list));
	}

	/** 아티팩트 적용 (200번대는 즉시효과 ServiceImpl에서 반영됨) */
	@PostMapping("/artifact/apply")
	public ResponseEntity<ApiResponse<String>> applyArtifact(@RequestBody ArtifactApplyRequest req) {
		String msg = eventService.applyArtifactGain(req.getPlayerId(), req.getAe_id(), req.getArtifactId());
		return ResponseEntity.ok(ApiResponse.ok(msg));
	}

	/* ===================== Boss ===================== */

	/** 보스 이벤트 인트로 */
	@GetMapping("/boss")
	public ResponseEntity<ApiResponse<Object>> showBoss(@RequestParam String playerId) {
		BossEventDto e = eventService.prepareBoss(playerId);
		if (e == null) {
			Map<String, Object> hint = new HashMap<>();
			hint.put("reroute", "nonBoss");
			return ResponseEntity.ok(ApiResponse.fail("보스 이벤트 없음", hint));
		}
		return ResponseEntity.ok(ApiResponse.ok(e));
	}

	/** 보스 전투 진입 */
	@PostMapping("/boss/fight")
	public ResponseEntity<ApiResponse<String>> bossFight(@RequestBody BossFightRequest req) {
		String msg = eventService.applyBossEnter(req.getPlayerId(), req.getBe_id());
		return ResponseEntity.ok(ApiResponse.ok(msg));
	}

	/* ===================== Request DTOs ===================== */

	@Data
	static class NormalApplyRequest {
		private String playerId;
		private int ne_id;
	}

	@Data
	static class RollApplyRequest {
		private String playerId;
		private int re_id;
	}

	@Data
	static class TrapApplyRequest {
		private String playerId;
		private int te_id;
	}

	@Data
	static class SelectApplyRequest {
		private String playerId;
		private int sec_id;
	}

	@Data
	static class CardApplyRequest {
		private String playerId;
		private int ce_id;
		private int skillId;
	}

	@Data
	static class ArtifactApplyRequest {
		private String playerId;
		private int ae_id;
		private int artifactId;
	}

	@Data
	static class BossFightRequest {
		private String playerId;
		private int be_id;
	}

	/* ===================== Response Wrapper ===================== */

	@Data
	static class ApiResponse<T> {
		private boolean success;
		private String message;
		private T data;

		static <T> ApiResponse<T> ok(T data) {
			ApiResponse<T> r = new ApiResponse<>();
			r.success = true;
			r.data = data;
			r.message = "OK";
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