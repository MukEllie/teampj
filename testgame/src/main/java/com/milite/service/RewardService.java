package com.milite.service;

import com.milite.dto.*;

public interface RewardService {
	public RewardDto generateBattleReward(String playerID);
	
	public String applySkillReward(String playerID, int selectedSkillID);
	
	public String applyArtifactReward(String playerID, int artifactID);
	
	public String applyGoldReward(String playerID, int goldAmount);
}
