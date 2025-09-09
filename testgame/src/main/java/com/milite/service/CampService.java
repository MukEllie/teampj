package com.milite.service;

public interface CampService {
	/**
	 * true = 전투, false = 이벤트 (정비소에서 '다음 스테이지 진행' 클릭 시: WhereStage +1 하고, 5/10층 진입이면
	 * 전투 강제)
	 */
	boolean decideBattleOrEvent(String playerId);

	/** 현재 상태에서 '다음 계층으로 이동' 버튼을 보여줄 수 있는가? (예: 10층 보스 격파 직후) */
	boolean canAdvanceLayer(String playerId);

	/** 계층 순환(물→불→풀) + WhereStage=1 로 리셋하고 저장. 변경 후 세션명 반환 */
	String advanceLayer(String playerId);
}