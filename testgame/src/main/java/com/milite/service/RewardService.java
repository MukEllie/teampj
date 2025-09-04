package com.milite.service;

import com.milite.dto.*;

public interface RewardService {
	public RewardDto generateBattleReward(String playerID);
	
	public RewardDto generateSpecialBattleReward(String playerID, int defeatedMonsterID);
	
	public ActiveRewardDto createActiveReward(String playerID, RewardDto reward);
	
	public ActiveRewardDto getCurrentRewards(String playerID);
	
	public String claimSkillReward(String playerID, int selectedSkillID);
	
	public String claimArtifactReward(String playerID);
	
	public String claimHealReward(String playerID);
	
	public String claimGoldReward(String playerID);
	
	public String proceedToCamp(String playerID);
	
	public String applySkillReward(String playerID, int selectedSkillID);
	
	public String applyArtifactReward(String playerID, int artifactID);
	
	public String applyGoldReward(String playerID, int goldAmount);
}
