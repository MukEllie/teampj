package com.milite.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.milite.service.CampService;
import com.milite.service.EventService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/camp")
@RequiredArgsConstructor
public class CampController {

	private final CampService campService;
	private final EventService eventService; // 이벤트 분기 시 기존 로직 재사용

	/** 정비소 화면 */
	@GetMapping
	public String showCamp(@RequestParam String playerId, Model model) {
		model.addAttribute("playerId", playerId);
		// 필요하면 현재 덱/아티팩트/골드 등도 모델에 담기 (차후 확장)
		return "camp";
	}

	/**
	 * 다음 스테이지로: 70% 전투 / 30% 이벤트 - 전투: BattleController가 POST /battle/start 만 받으므로,
	 * 중간 JSP에서 자동 POST - 이벤트: 기존 EventService 로직으로 비보스 랜덤 이벤트 화면 바로 반환
	 */
	@PostMapping("/nextstage")
	public String nextStage(@RequestParam String playerId, Model model) {
		boolean goBattle = campService.decideBattleOrEvent(); // true=전투, false=이벤트
		if (goBattle) {
			// battle/start는 POST, 파라미터명은 PlayerID 이므로 중간 페이지에서 자동 submit
			model.addAttribute("playerId", playerId);
			return "camp/battle_start";
		} else {
			// 이벤트는 기존 로직 재사용 (비보스 랜덤)
			return eventService.triggerRandomNonBoss(playerId);
		}
	}
}