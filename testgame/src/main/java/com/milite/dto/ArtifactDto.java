package com.milite.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArtifactDto {
	private int ArtifactID;
	private String ArtifactName;
	private String ArtifactJob; // common / warrior / mage / thief
	private String ArtifactSession; // none / event / unique
	private String ArtifactEffect;
	private String ArtifactText;
}
