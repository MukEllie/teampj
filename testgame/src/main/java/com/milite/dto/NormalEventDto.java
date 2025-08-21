package com.milite.dto;

import lombok.Data;

@Data
public class NormalEventDto {
	private int ne_id;
	private String ne_name;
	private String ne_session;

	private int ne_dice; // 스키마에 존재(설명용/연출용)
	private int ne_php; // 플레이어 HP 변화
	private int ne_mhp; // 몬스터 HP 변화(이벤트값)
	private int ne_patk; // 플레이어 ATK 변화
	private int ne_matk; // 몬스터 ATK 변화(이벤트값)
	private int ne_gold; // 골드 변화(±)
	private int ne_luck; // 플레이어 LUCK 변화
}