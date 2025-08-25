package com.milite.battle.artifacts;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;
import com.milite.util.KoreanUtil;

public class SeaHeartArtifact implements PlayerArtifact {
	private static final String ARTIFACT_NAME = "바다의 심장";
	private static final String ARTIFACT_DESCRIPTION = "턴 시작 시 5 회복";

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
		int healAmount = getHealAmount();
		int actualHealed = context.healUnit(unit, healAmount);

		if (actualHealed > 0) {
			context.addLogEntry(unit.getName(), "artifact_heal", unit.getName()
					+ KoreanUtil.getJosa(unit.getName(), "이 ", "가 ") + "바다의 심장 효과로 " + actualHealed + "만큼 회복했습니다.");
		}
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

	public int getHealAmount() {
		return BattleConstants.getSeaHeartHealAmount();
	}
}
