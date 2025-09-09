package com.milite.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.milite.dto.PlayerDto;
import com.milite.mapper.CharacterStatusMapper;
import com.milite.service.CampService;
import com.milite.service.EventService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/camp")
@RequiredArgsConstructor
public class CampController {

	private final CampService campService;
	private final EventService eventService;
	private final CharacterStatusMapper characterStatusMapper;

	/** 정비소 화면 (JSP) */
	@GetMapping
	public String showCamp(@RequestParam String playerId, Model model) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		model.addAttribute("playerId", playerId);
		model.addAttribute("whereStage", p != null ? p.getWhereStage() : null);
		model.addAttribute("whereSession", p != null ? p.getWhereSession() : null);
		model.addAttribute("canAdvanceLayer", campService.canAdvanceLayer(playerId));
		return "camp";
	}

	/** 다음 스테이지로 (스테이지 +1 및 5/10층 전투강제 포함) */
	@PostMapping("/nextstage")
	public String nextStage(@RequestParam String playerId, Model model) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);

		// ★ 방어 처리: 10층에서는 nextstage 금지
		if (p != null && p.getWhereStage() >= 10) {
			return "redirect:/camp?playerId=" + playerId;
		}

		boolean goBattle = campService.decideBattleOrEvent(playerId);
		if (goBattle) {
			model.addAttribute("playerId", playerId);
			return "camp/battle_start"; // 자동 POST → /battle/start
		} else {
			return eventService.triggerRandomNonBoss(playerId);
		}
	}

	/** 다음 계층으로 이동 (계층 순환 + WhereStage=1) */
	@PostMapping("/nextlayer")
	public String nextLayer(@RequestParam String playerId, Model model) {
		String next = campService.advanceLayer(playerId);
		// 이동 후 정비소 다시 표시 (새 세션/1층)
		model.addAttribute("playerId", playerId);
		return "redirect:/camp?playerId=" + playerId;
	}
}