package com.milite.battle;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BattleLogEntry {
	private String actorName;
	private String actionType;
	private String detail;
	private int turnNumber;
	
    public BattleLogEntry(String actorName, String actionType, String detail) {
        this.actorName = actorName;
        this.actionType = actionType;
        this.detail = detail;
        this.turnNumber = 0; // 기본값
    }
}
