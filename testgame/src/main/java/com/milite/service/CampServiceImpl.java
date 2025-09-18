package com.milite.service;

import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;

import com.milite.dto.PlayerDto;
import com.milite.mapper.CharacterStatusMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CampServiceImpl implements CampService {

	private final CharacterStatusMapper characterStatusMapper;
	private final EventService eventService;

	// 세션 표기 규칙: 프로젝트 전반과 맞추세요. (예: "Water", "Fire", "Grass")
	private static final String SESSION_WATER = "Water";
	private static final String SESSION_FIRE = "Fire";
	private static final String SESSION_GRASS = "Grass";

	private String nextSession(String current) {
		if (SESSION_WATER.equalsIgnoreCase(current))
			return SESSION_FIRE;
		if (SESSION_FIRE.equalsIgnoreCase(current))
			return SESSION_GRASS;
		// 기본/기타는 GRASS 다음 = WATER 로 순환
		return SESSION_WATER;
	}

	@Override
	public boolean decideBattleOrEvent(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		int curr = p.getWhereStage();

		// ★ 10층에서는 nextstage가 호출되면 안됨.
		// (UI에서는 nextlayer 버튼만 노출됨)
		// 만약 직접 호출되면 false를 반환 → 컨트롤러에서 리다이렉트 처리
		if (curr >= 10) {
			return false;
		}

		int next = curr + 1;
		p.setWhereStage(next);
		characterStatusMapper.updateStatus(p);

		// 5, 10층 진입은 이벤트 금지 → 전투 강제
		if (next == 5 || next == 10)
			return true;

		// 일반 규칙: 70% 전투 / 30% 이벤트
		return ThreadLocalRandom.current().nextDouble() < 0.7;
	}

	@Override
	public boolean canAdvanceLayer(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		// 보스 격파 후 캠프로 온 상황을 전제로, 단순히 10층 도달로 판단
		// (만약 '격파 여부'를 별도 플래그로 관리한다면 그 플래그를 함께 체크)
		return p != null && p.getWhereStage() >= 10;
	}

	@Override
	public String advanceLayer(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		if (p == null)
			return null;

		String current = p.getWhereSession();
		String next = nextSession(current);

		// 계층 전환 + 스테이지 0 리셋
		p.setWhereSession(next);
		p.setWhereStage(0);
		characterStatusMapper.updateStatus(p);

		// 계층 이동 시 used_events 레코드 초기화 여기서 호출:
		eventService.resetLayerUsed(playerId, next);

		return next;
	}
}