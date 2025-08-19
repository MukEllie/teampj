package com.milite.dto;

import lombok.Data;

@Data
public class CardEventDto {
	private int ceId;
	private String ceName;
	private String ceSession; // none, water, fire, grass
	private int ceDmg; // 0이면 SkillDB, 아니면 PlayerDB.Own_Skill
}