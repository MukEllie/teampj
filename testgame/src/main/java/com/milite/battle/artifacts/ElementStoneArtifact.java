package com.milite.battle.artifacts;

import com.milite.battle.BattleUnit;

import java.util.Map;

import com.milite.battle.BattleContext;

public class ElementStoneArtifact implements PlayerArtifact {
	private static final String ARTIFACT_NAME = "원소의 돌";
	private static final String ARTIFACT_DESCRIPTION = "속성 우세 시 데미지가 1.3배로 증가합니다";
	private static final double ADVANTAGE_BONUS = 0.1;

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

	@Override
	public String getArtifactRarity() {
		return "Common";
	}

	public double getElementBonus(double currentMultiplier, String attackElement, String targetElement) {
		double originalMultiplier = getOriginalElementMultiplier(attackElement, targetElement);

		if (originalMultiplier > 1.0) {
			return ADVANTAGE_BONUS;
		}
		return 0.0;
	}

	private double getOriginalElementMultiplier(String attackElement, String targetElement) {
		Map<String, Map<String, Double>> ORIGINAL_EFFECTIVENESS = Map.of("Fire",
				Map.of("Grass", 1.2, "Water", 0.8, "Fire", 1.0, "None", 1.0), "Water",
				Map.of("Fire", 1.2, "Grass", 0.8, "Water", 1.0, "None", 1.0), "Grass",
				Map.of("Water", 1.2, "Fire", 0.8, "Grass", 1.0, "None", 1.0), "None",
				Map.of("Fire", 1.0, "Water", 1.0, "Grass", 1.0, "None", 1.0));

		return ORIGINAL_EFFECTIVENESS.get(attackElement).get(targetElement);
	}

	public boolean affectsElementCombination(double baseMultiplier) {
		return baseMultiplier > 1.0;
	}
	
	public double getAdvantageBonus() {
		return ADVANTAGE_BONUS;
	}
	
	public String getEffectDescription(double baseMultiplier, String attackElement, String targetElement) {
		double bonus = getElementBonus(baseMultiplier, attackElement, targetElement);
		
		if(bonus > 0) {
			double finalMultiplier = baseMultiplier + bonus;
			return String.format("원소의 돌 효과 : %.1f배 -> %.1f배", baseMultiplier, finalMultiplier);
		}
		return "우세 상성이 아니기에 원소의 돌 효과가 적용되지 않음";
	}
}
