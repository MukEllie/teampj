package com.milite.battle.artifacts;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;

public class ShadowDeviceArtifact implements PlayerArtifact {
	private static final String ARTIFACT_NAME = "그림자 생성 장치";
	private static final String ARTIFACT_DESCRIPTION = "공격 횟수 1회 증가";

	@Override
	public void onPlayerAttack(BattleUnit attacker, BattleUnit target, BattleContext context) {

	}

	@Override
	public void onPlayerHit(BattleUnit attacker, BattleUnit target, int damageDealt, BattleContext context) {

	}

	@Override
	public void onPlayerDefensePerHit(BattleUnit defender, BattleUnit attacker, int damage, BattleContext context) {

	}

	@Override
	public void onPlayerDefensePerTurn(BattleUnit defender, BattleUnit attacker, int totalDamage,
			BattleContext context) {

	}

	@Override
	public void onPlayerTurnStart(BattleUnit unit, BattleContext context) {

	}

	@Override
	public void onPlayerTurnEnd(BattleUnit unit, BattleContext context) {

	}

	@Override
	public String getArtifactName() {
		return ARTIFACT_NAME;
	}

	@Override
	public String getArtifactDescription() {
		return ARTIFACT_DESCRIPTION;
	}
	
	public int getHitTimeBonus() {
		return BattleConstants.getShadowDeviceBonus();
	}
	
	public String getEffectDescription() {
		return String.format("그림자 생성 장치 효과: 공격 횟수 +%d회", getHitTimeBonus());
	}
}
