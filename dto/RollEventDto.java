package com.milite.dto;

import lombok.Data;

@Data
public class RollEventDto {
	private int reId;
	private String reName;
	private String reSession;
	private int reDice;
	private int reDicelimit;
	private int rePhp;
	private int reMhp;
	private int rePatk;
	private int reMatk;
	private int reGold;
	private int reLuck;
}