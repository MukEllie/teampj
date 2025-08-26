package com.milite.dto;

import java.util.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RewardDto {
	private String rewardType;
	private List<SkillDto> skillChoices;
	private ArtifactDto artifact;
	private int goldAmount;
	private String message;
	private boolean success;

	public RewardDto(String message, boolean success) {
		this.message = message;
		this.success = success;
		this.skillChoices = new ArrayList<>();
		this.goldAmount = 0;
	}

	public RewardDto(List<SkillDto> skillChoices, int goldAmount) {
		// 스킬만 등장하는 일반적인 
		this.rewardType = "SKILL";
		this.skillChoices = skillChoices;
		this.goldAmount = goldAmount;
		this.success = true;
		this.message = "스킬 보상 생성 완료";
	}

	public RewardDto(List<SkillDto> skillChoices, ArtifactDto artifact, int goldAmount) {
		// 30% 확률로 아티팩트까지 드랍되었을 때
		this.rewardType = "SKILL_ARTIFACT";
		this.skillChoices = skillChoices;
		this.artifact = artifact;
		this.goldAmount = goldAmount;
		this.success = true;
		this.message = "스킬 + 아티팩트 보상 생성 완료";
	}
	
	// 편의용 메서드
	public boolean hasSkillChoices() {
		return skillChoices != null && !skillChoices.isEmpty();
	}

	public boolean hasArtifact() {
		return artifact != null;
	}

	public boolean hasGold() {
		return goldAmount > 0;
	}

	public boolean isRewardEmpty() {
		return !hasSkillChoices() && !hasArtifact() && !hasGold();
	}
}
