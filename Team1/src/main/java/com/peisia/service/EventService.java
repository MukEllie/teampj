package com.peisia.service;

import com.peisia.dto.EventDto;
import com.peisia.dto.PlayerDto;

public interface EventService {
	// 던전 레벨별 랜덤 이벤트 하나 선택 (인트로용)
	EventDto pickEvent(int dungeonLevel);

	// 이벤트 아이디로 이벤트 조회 (결과화면용)
	EventDto getEventById(int eventId);

	// 이벤트 효과 플레이어 데이터에 적용 후 플레이어DB에 업데이트
	PlayerDto applyEventToPlayer(EventDto event, int playerId);

	// 던전 레벨과 플레이어ID 받아 이벤트 선택, 효과 적용 후 이벤트 결과 반환 (강제 이벤트용)
	EventDto getProcessedEvent(int dungeonLevel, int playerId);

	// 플레이어 골드 반환
	int getPlayerGold();
}