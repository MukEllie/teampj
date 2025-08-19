package com.peisia.dto;

import lombok.Data;

@Data
public class EventDto {
	private int e_id;
	private String e_name;
	private int e_type;
	private int e_dice;
	private int e_phealth;
	private int e_mhealth;
	private int e_patk;
	private int e_matk;
	private int e_gold;
	private int e_luck;

	// 효과값 계산용 필드 (서비스에서 세팅)
	private int effectPhealth;
	private int effectMhealth;
	private int effectPatk;
	private int effectMatk;
	private int effectGold;
	private int effectLuck;
	private int effectDiceResult; // 다이스 결과 저장용
}