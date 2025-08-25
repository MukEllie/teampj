package com.milite.battle.artifacts;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;
import com.milite.util.KoreanUtil;

public class DeepsPearlArtifact implements PlayerArtifact {
	private static final String ARTIFACT_NAME = "심해의 진주";
	private static final String ARTIFACT_DESCRIPTION = "공격 적중 시 2 회복";

	@Override
	public void onPlayerAttack(BattleUnit attacker, BattleUnit target, BattleContext context) {

	}

	@Override
	public void onPlayerHit(BattleUnit attacker, BattleUnit target, int damageDealt, BattleContext context) {
		if (damageDealt > 0) {
			int healAmount = getHealAmount();
			int actualHealed = context.healUnit(attacker, healAmount);

			if (actualHealed > 0) {
				context.addLogEntry(attacker.getName(), "artifact_heal",
						attacker.getName() + KoreanUtil.getJosa(attacker.getName(), "이 ", "가 ") + "심해의 진주 효과로 "
								+ actualHealed + "만큼 회복했습니다.");
			}
		}
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

	public int getHealAmount() {
		return BattleConstants.getDeapsPearlHealAmount();
	}

	public String getEffectDescription() {
		return String.format("심해의 진주 효과: 공격 명중 시 %d 회복", getHealAmount());
	}
}
