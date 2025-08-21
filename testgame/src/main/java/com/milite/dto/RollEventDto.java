package com.milite.dto;

import lombok.Data;

@Data
public class RollEventDto {
	private int re_id;
	private String re_name;
	private String re_session;

	private int re_dice;
	private int re_dicelimit;

	private int re_php; // 플레이어 HP 변화
	private int re_pmaxhp; // 플레이어 MaxHP 변화 (스키마 반영)
	private int re_mhp; // 몬스터 HP 변화
	private int re_mmaxhp; // 몬스터 MaxHP 변화
	private int re_patk; // 플레이어 ATK 변화
	private int re_matk; // 몬스터 ATK 변화
	private int re_gold; // 골드 변화 (±)
	private int re_luck; // 플레이어 LUCK 변화
}