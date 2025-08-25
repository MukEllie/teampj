package com.milite.battle.artifacts;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;

public class DarkHammerArtifact implements PlayerArtifact {
	private static final String ARTIFACT_NAME = "어두운 망치";
	private static final String ARTIFACT_DESCRIPTION = "기절 상태이상 부여 시, 유지시간 1턴 증가";

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

	public int getStunBonus() {
		return BattleConstants.getDarkHammerStunBonus();
	}

	public int calculateStunTurns(int baseTurns) {
		return baseTurns + getStunBonus();
	}
	
	public String getEffectDescription(int baseTurns) {
		int totalTurns = calculateStunTurns(baseTurns);
		return String.format("어두운 망치 효과: 기절 %d턴 → %d턴으로 증가", baseTurns, totalTurns);
	}
}
