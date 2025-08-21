package com.milite.dto;

import lombok.Data;

@Data
public class SelectChoiceDto {
	private int sec_id;
	private int se_id;
	private int sec_opt;

	private int sec_php; // 플레이어 HP 변화
	private int sec_pmaxhp; // 플레이어 MaxHP 변화
	private int sec_mhp; // 몬스터 HP 변화
	private int sec_mmaxhp; // 몬스터 MaxHP 변화
	private int sec_patk; // 플레이어 ATK 변화
	private int sec_matk; // 몬스터 ATK 변화
	private int sec_gold; // 골드 변화 (±)
	private int sec_luck; // 플레이어 LUCK 변화

	private String sec_text; // 버튼 문구
}