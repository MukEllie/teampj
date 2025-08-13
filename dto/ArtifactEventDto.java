package com.milite.dto;

import lombok.Data;

@Data
public class ArtifactEventDto {
	private int aeId;
	private String aeName;
	private String aeSession; // none, water, fire, grass
}