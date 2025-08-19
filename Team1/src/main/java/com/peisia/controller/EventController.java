package com.peisia.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.peisia.dto.EventDto;
import com.peisia.dto.PlayerDto;
import com.peisia.mapper.PlayerMapper;
import com.peisia.service.EventService;

@Controller
public class EventController {

	@Autowired
	private EventService eventService;

	@Autowired
	private PlayerMapper playerMapper;

	// 예시로 playerId 0 고정 (실제로는 로그인 세션에서 받아오세요)
	private final int defaultPlayerId = 0;

	// 1) 인트로: 이벤트 선택 및 인트로 화면 보여주기
	@GetMapping("/event/{dungeonLevel}")
	public String showEventIntro(@PathVariable int dungeonLevel, Model model) {
		EventDto event = eventService.pickEvent(dungeonLevel);
		if (event == null) {
			model.addAttribute("message", "이벤트를 불러올 수 없습니다.");
			return "error";
		}
		model.addAttribute("event", event);
		model.addAttribute("dungeonLevel", dungeonLevel); // 다음 화면 이동시 사용
		return "event/intro"; // 인트로 jsp
	}

	// 2) 진행하기 클릭: 이벤트 처리 후 결과 화면 보여주기
	@GetMapping("/event/{dungeonLevel}/proceed/{eventId}")
	public String proceedEvent(@PathVariable int dungeonLevel, @PathVariable int eventId, Model model) {

		EventDto event = eventService.getEventById(eventId);
		if (event == null) {
			model.addAttribute("message", "이벤트를 불러올 수 없습니다.");
			return "error";
		}

		// 이벤트를 플레이어에게 적용 (효과 반영)
		PlayerDto player = eventService.applyEventToPlayer(event, defaultPlayerId);
		if (player == null) {
			model.addAttribute("message", "플레이어 정보를 불러올 수 없습니다.");
			return "error";
		}

		model.addAttribute("event", event);
		model.addAttribute("player", player);
		model.addAttribute("playerGold", eventService.getPlayerGold());

		return "event/result"; // 결과 jsp
	}

	// 3) 지나간다 클릭 시 홈으로 이동 ("/" 또는 "/home" 페이지)
	@GetMapping("/")
	public String home() {
		return "home"; // 홈 화면 jsp (필요에 따라 수정)
	}
}