package com.milite.dto;

import java.util.*;

import com.milite.battle.BattleLogEntry;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleResultDto {
	private String Message;
	private int damage;
	private int newHp;
	private boolean isHit;
	private boolean isDefeated;
	
	private List<BattleLogEntry> battleLog;
}
