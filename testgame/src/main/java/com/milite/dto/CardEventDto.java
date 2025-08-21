package com.milite.dto;

import lombok.Data;

@Data
public class CardEventDto {
	private int ce_id;
	private String ce_name;
	private String ce_session;
	private int ce_dmg; // 0 → SkillDB, 그 외 → PlayerDB.Own_Skill
}