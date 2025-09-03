package com.milite.service;

public interface CampService {
	/** true = 전투(70%), false = 이벤트(30%) */
	boolean decideBattleOrEvent();
}