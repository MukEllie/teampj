package com.milite.battle.artifacts;

import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;
import com.milite.battle.BattleContext;

public class ElementStoneArtifact implements PlayerArtifact {
	private static final String ARTIFACT_NAME = "원소의 돌";
	private static final String ARTIFACT_DESCRIPTION = "우세 상성 공격 시, 배율이 10% 증가";

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

	public boolean hasElementAdvantage(double baseMultiplier) {
		return baseMultiplier > 1.0;
	}

	public double getElementAdvantageBonus() {
		return BattleConstants.getElementStoneBonus();
	}

	public String getEffectDescription(double baseMultiplier) {
		if (hasElementAdvantage(baseMultiplier)) {
			double finalMultiplier = baseMultiplier + BattleConstants.getElementStoneBonus();
			return String.format("원소의 돌 효과 : %.1f배 -> %.1f배", baseMultiplier, finalMultiplier);
		}
		return "우세 상성이 아니기에 원소의 돌 효과가 적용되지 않음";
	}
}
