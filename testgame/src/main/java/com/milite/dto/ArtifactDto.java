package com.milite.dto;

import lombok.Data;

@Data
public class ArtifactDto {
	private int artifact_id;
	private String artifact_name;
	private String artifact_job; // none / warrior / mage / thief
	private String artifact_session; // none / water / fire / grass / event
	private String artifact_text;
}