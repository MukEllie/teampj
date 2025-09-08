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

	@Override
	public boolean decideBattleOrEvent(String playerId) {
		// 현재 스테이지 조회
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		int curr = p.getWhereStage();
		int next = curr + 1;

		// ★ 1) 스테이지 즉시 +1 반영 (정비소에서 '다음' 누르는 시점)
		p.setWhereStage(next);
		characterStatusMapper.updateStatus(p);

		// ★ 2) 보스층 진입(5, 10)은 이벤트 금지, 무조건 전투
		if (next == 5 || next == 10) {
			return true; // 전투 강제
		}

		// ★ 3) 일반 규칙: 70% 전투 / 30% 이벤트
		return ThreadLocalRandom.current().nextDouble() < 0.7;
	}
}