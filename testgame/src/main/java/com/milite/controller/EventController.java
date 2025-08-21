package com.milite.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

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

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/event")
@RequiredArgsConstructor
public class EventController {

	private final EventService eventService;

	/* 홈 → 랜덤 이벤트 라우팅 */
	// /event/trigger/test01 형태로 호출
	@GetMapping("/trigger/{playerId}")
	public String trigger(@PathVariable String playerId) {
		return eventService.triggerRandomEvent(playerId);
	}

	/* ===== Normal ===== */
	@GetMapping("/normal")
	public String showNormal(@RequestParam String playerId, Model model) {
		NormalEventDto e = eventService.prepareNormal(playerId);
		if (e == null) {
			model.addAttribute("message", "표시할 일반 이벤트가 없습니다.");
			model.addAttribute("playerId", playerId);
			return "event/normal_result";
		}
		model.addAttribute("playerId", playerId);
		model.addAttribute("event", e);
		return "event/normal";
	}

	@PostMapping("/normal/apply")
	public String applyNormal(@RequestParam String playerId, @RequestParam int ne_id, Model model) {
		String msg = eventService.applyNormal(playerId, ne_id);
		model.addAttribute("message", msg);
		model.addAttribute("playerId", playerId);
		return "event/normal_result";
	}

	/* ===== Roll ===== */
	@GetMapping("/roll")
	public String showRoll(@RequestParam String playerId, Model model) {
		RollEventDto e = eventService.prepareRoll(playerId);
		if (e == null) {
			model.addAttribute("message", "표시할 주사위 이벤트가 없습니다.");
			model.addAttribute("playerId", playerId);
			return "event/roll_result";
		}
		model.addAttribute("playerId", playerId);
		model.addAttribute("event", e);
		return "event/roll";
	}

	@PostMapping("/roll/apply")
	public String applyRoll(@RequestParam String playerId, @RequestParam int re_id, Model model) {
		String msg = eventService.applyRoll(playerId, re_id);
		model.addAttribute("message", msg);
		model.addAttribute("playerId", playerId);
		return "event/roll_result";
	}

	/* ===== Trap ===== */
	@GetMapping("/trap")
	public String showTrap(@RequestParam String playerId, Model model) {
		TrapEventDto e = eventService.prepareTrap(playerId);
		if (e == null) {
			model.addAttribute("message", "표시할 함정 이벤트가 없습니다.");
			model.addAttribute("playerId", playerId);
			return "event/trap_result";
		}
		model.addAttribute("playerId", playerId);
		model.addAttribute("event", e);
		return "event/trap";
	}

	@PostMapping("/trap/apply")
	public String applyTrap(@RequestParam String playerId, @RequestParam int te_id, Model model) {
		String msg = eventService.applyTrap(playerId, te_id);
		model.addAttribute("message", msg);
		model.addAttribute("playerId", playerId);
		return "event/trap_result";
	}

	/* ===== Select ===== */
	@GetMapping("/select")
	public String showSelect(@RequestParam String playerId, Model model) {
		SelectEventDto e = eventService.prepareSelect(playerId);
		if (e == null) {
			model.addAttribute("message", "표시할 선택 이벤트가 없습니다.");
			model.addAttribute("playerId", playerId);
			return "event/select_result";
		}
		List<SelectChoiceDto> choices = eventService.getSelectChoices(e.getSe_id());
		model.addAttribute("playerId", playerId);
		model.addAttribute("event", e);
		model.addAttribute("choices", choices);
		return "event/select";
	}

	@PostMapping("/select/apply")
	public String applySelect(@RequestParam String playerId, @RequestParam int sec_id, Model model) {
		String msg = eventService.applySelect(playerId, sec_id);
		model.addAttribute("message", msg);
		model.addAttribute("playerId", playerId);
		return "event/select_result";
	}

	/* ===== Card ===== */
	@GetMapping("/card")
	public String showCard(@RequestParam String playerId, Model model) {
		CardEventDto ce = eventService.prepareCard(playerId);
		if (ce == null) {
			model.addAttribute("message", "표시할 카드 이벤트가 없습니다.");
			model.addAttribute("playerId", playerId);
			return "event/card_result";
		}
		List<SkillDto> candidates = (ce.getCe_dmg() == 0) ? eventService.getCardChoicesFromSkillDB(playerId)
				: eventService.getCardChoicesFromOwned(playerId);
		model.addAttribute("playerId", playerId);
		model.addAttribute("event", ce);
		model.addAttribute("skills", candidates);
		return "event/card";
	}

	@PostMapping("/card/apply")
	public String applyCard(@RequestParam String playerId, @RequestParam int ce_id, @RequestParam int skillId,
			Model model) {
		String msg = eventService.applyCardGain(playerId, ce_id, skillId);
		model.addAttribute("message", msg);
		model.addAttribute("playerId", playerId);
		return "event/card_result";
	}

	/* ===== Artifact ===== */
	@GetMapping("/artifact")
	public String showArtifact(@RequestParam String playerId, Model model) {
		ArtifactEventDto e = eventService.prepareArtifact(playerId);
		if (e == null) {
			model.addAttribute("message", "표시할 아티팩트 이벤트가 없습니다.");
			model.addAttribute("playerId", playerId);
			return "event/artifact_result";
		}
		List<ArtifactDto> list = eventService.getArtifactCandidates(playerId);
		model.addAttribute("playerId", playerId);
		model.addAttribute("event", e);
		model.addAttribute("artifacts", list);
		return "event/artifact";
	}

	@PostMapping("/artifact/apply")
	public String applyArtifact(@RequestParam String playerId, @RequestParam int ae_id, @RequestParam int artifactId,
			Model model) {
		String msg = eventService.applyArtifactGain(playerId, ae_id, artifactId);
		model.addAttribute("message", msg);
		model.addAttribute("playerId", playerId);
		return "event/artifact_result";
	}

	/* ===== Boss ===== */
	@GetMapping("/boss")
	public String showBoss(@RequestParam String playerId, Model model) {
		BossEventDto e = eventService.prepareBoss(playerId);
		if (e == null) {
			// 보스가 이미 소모되었으면 비보스 랜덤 이벤트로
			return eventService.triggerRandomNonBoss(playerId);
		}
		model.addAttribute("playerId", playerId);
		model.addAttribute("event", e);
		return "event/boss";
	}

	@PostMapping("/boss/fight")
	public String bossFight(@RequestParam String playerId, @RequestParam int be_id, Model model) {
		String msg = eventService.applyBossEnter(playerId, be_id);
		model.addAttribute("message", msg);
		model.addAttribute("playerId", playerId);
		return "event/boss_result";
	}
}