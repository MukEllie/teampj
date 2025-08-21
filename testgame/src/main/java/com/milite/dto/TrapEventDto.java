package com.milite.dto;

import lombok.Data;

@Data
public class TrapEventDto {
	private int te_id;
	private String te_name;
	private String te_session;
	private int te_dice;
	private int te_dicelimit;
	private int te_php;
	private int te_maxhp;
	private int te_patk;
	private int te_luck;
}