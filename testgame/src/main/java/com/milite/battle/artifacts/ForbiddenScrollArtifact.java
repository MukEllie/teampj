package com.milite.battle.artifacts;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;

public class ForbiddenScrollArtifact implements PlayerArtifact {
	private static final String ARTIFACT_NAME = "금단의 주문서";
	private static final String ARTIFACT_DESCRIPTION = "우세 상성 공격 시, 배율 20% 증가 및 약세 상성 공격 시, 배율 20% 감소";

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

	public boolean hasElementDisadvantage(double baseMultiplier) {
		return baseMultiplier < 1.0;
	}

	public double getElementAdvantageBonus() {
		return BattleConstants.getForbiddenScrollBonus();
	}

	public double getElementDisadvantageBonus() {
		return BattleConstants.getForbiddenScrollMinus();
	}

	public String getEffectDescription(double baseMultiplier) {
		if (hasElementAdvantage(baseMultiplier)) {
			double finalMultiplier = baseMultiplier + getElementAdvantageBonus();
			return String.format("금단의 주문서 효과(우세): %.1f배 → %.1f배로 증가", baseMultiplier, finalMultiplier);
		} else if (hasElementDisadvantage(baseMultiplier)) {
			double finalMultiplier = baseMultiplier - getElementDisadvantageBonus();
			return String.format("금단의 주문서 효과(약세): %.1f배 → %.1f배로 감소", baseMultiplier, finalMultiplier);
		}
		return "동등 상성이므로 금단의 주문서 효과가 적용되지 않음";
	}

}
