package com.milite.dto;

import java.util.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActiveRewardDto {
	private String playerID;
	private String rewardType;
	
	private List<SkillDto> availableSkills;
	private ArtifactDto availableArtifact;
	private boolean healAvailable;
	private int goldAmount;
	
	private List<String> claimedRewards;
	
	public ActiveRewardDto(String playerID, RewardDto reward) {
		this.playerID = playerID;
		this.rewardType = reward.getRewardType();
		
		this.availableSkills = new ArrayList<>(reward.getSkillChoices());
		this.availableArtifact = reward.getArtifact();
		this.healAvailable = true;
		this.goldAmount = reward.getGoldAmount();
		
		this.claimedRewards = new ArrayList<>();
	}
	
	public boolean hasAvailableSkills() {
		return availableSkills != null && !availableSkills.isEmpty();
	}
	
	public boolean hasAvailableArtifact() {
		return availableArtifact != null;
	}
	
	public boolean hasAvailableHeal() {
		return healAvailable;
	}
	
	public boolean hasAvailableGold() {
		return goldAmount > 0;
	}
	
	public boolean hasAnyRewards() {
		return hasAvailableSkills() || hasAvailableArtifact() || hasAvailableHeal() || hasAvailableGold();
	}
	
	public SkillDto claimSkill(int skillID) {
		if(availableSkills == null) {
			return null;
		}
		
		SkillDto selectedSkill = null;
		for(int i = 0; i < availableSkills.size(); i++) {
			SkillDto skill = availableSkills.get(i);
			if(skill.getSkill_id() == skillID) {
				selectedSkill = skill;
				availableSkills.clear();
				claimedRewards.add("스킬 : " + skill.getSkill_name());
				break;
			}
		}
		return selectedSkill;
	}
	
	public ArtifactDto claimArtifact() {
		if(availableArtifact == null) {
			return null;
		}
		
		ArtifactDto artifact = availableArtifact;
		availableArtifact = null;
		claimedRewards.add("아티팩트 : " + artifact.getArtifactName());
		return artifact;
	}
	
	public boolean claimHeal() {
		if(!healAvailable) {
			return false;
		}
		
		healAvailable = false;
		claimedRewards.add("회복");
		return true;
	}
	
	public int claimGold() {
		if(goldAmount <= 0) {
			return 0;
		}
		
		int gold = goldAmount;
		goldAmount = 0;
		claimedRewards.add("골드 : " + gold);
		return gold;
	}
}
