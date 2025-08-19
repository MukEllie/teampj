package com.milite.dto;

import lombok.Data;

@Data
public class TrapEventDto {
	private int teId;
	private String teName;
	private String teSession;
	private int teDice;
	private int teDicelimit;
	private int tePhp;
	private int teMhp;
	private int tePatk;
	private int teMatk;
	private int teGold;
	private int teLuck;
}