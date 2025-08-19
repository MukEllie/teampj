package com.milite.dto;

import lombok.Data;

@Data
public class NormalEventDto {
	private int eId;
	private String eName;
	private String eSession; // none, water, fire, grass
	private int eDice;
	private int ePhp;
	private int eMhp;
	private int ePatk;
	private int eMatk;
	private int eGold;
	private int eLuck;
}