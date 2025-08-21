package com.milite.battle;

import java.util.*;

public interface BattleUnit {
	String getName();

	int getHp();

	boolean isAlive();

	String getUnitType();

	default int getInitiative() {
		if (hasSwift())
			return 100;
		if (hasPlayerPriority())
			return 50;
		return 0;
	}

	default boolean hasSwift() {
		return false;
	}

	default boolean hasPlayerPriority() {
		return false;
	}

	default String getSpecial() {
		return null;
	}

	default Map<String, Integer> getStatusEffects() {
		return new HashMap<>();
	}

	default void setStatusEffects(Map<String, Integer> statusEffects) {
	}
	
	default int getMax_hp() {
		return 0;
	}
}
