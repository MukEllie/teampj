package com.milite.service;

public interface CampService {
	/**
	 * true = 전투, false = 이벤트 이 메서드는 '다음 스테이지로' 누를 때 즉시 WhereStage 를 +1 하고,
	 * 보스층(5,10) 진입이면 전투를 강제한다.
	 */
	boolean decideBattleOrEvent(String playerId);
}