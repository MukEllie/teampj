package com.milite.util;

import com.milite.constants.BattleConstants;

public class RewardUtil {
	public static String determineSkillRarity() {
		int srChance = BattleConstants.getRewardSkillSRChance();
		int rChance = BattleConstants.getRewardSkillRChance();
		return CommonUtil.determineRarity(srChance, rChance);
	}

	public static boolean shouldDropArtifact() {
		int dropChance = BattleConstants.getRewardArtifactDropChance();
		return CommonUtil.rollChance(dropChance);
	}

	public static int getSkillChoiceCount() {
		return BattleConstants.getRewardSkillChoiceCount();
	}

	public static int getBossClearGoldAmount(int stage) {
		if (stage == 5 || stage == 10) {
			return BattleConstants.getRewardGoldBossClear();
		}
		return 0;
	}
	
	
}
