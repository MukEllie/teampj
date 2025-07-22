package com.peisia.dto;

import lombok.Data;

@Data
public class PlayerDto {
	private int p_id;
	private String p_name;
	private int p_maxhp;
	private int p_currenthp;
	private int p_atk;
	private int p_luck;
	// 골드는 제외
}