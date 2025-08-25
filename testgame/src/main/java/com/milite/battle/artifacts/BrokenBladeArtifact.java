package com.milite.battle.artifacts;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;
import com.milite.util.KoreanUtil;

public class BrokenBladeArtifact implements PlayerArtifact {
	private static final String ARTIFACT_NAME = "부서진 칼날";
	private static final String ARTIFACT_DESCRIPTION = "피격 시, 2 피해 반사";

	@Override
	public void onPlayerAttack(BattleUnit attacker, BattleUnit target, BattleContext context) {

	}

	@Override
	public void onPlayerHit(BattleUnit attacker, BattleUnit target, int damageDealt, BattleContext context) {

	}

	@Override
	public void onPlayerDefensePerHit(BattleUnit defender, BattleUnit attacker, int damage, BattleContext context) {
		if (attacker != null && attacker.isAlive()) {
			context.addReflectDamage(attacker, BattleConstants.getBrokenBladeReflectDamage());
			System.out.println("반사 피해 예약 : " + BattleConstants.getBrokenBladeReflectDamage());

			context.addLogEntry(defender.getName(), "Broken_Blade", defender.getName()
					+ KoreanUtil.getJosa(defender.getName(), "의 ", "의 ") + ARTIFACT_NAME + "이 날카롭게 빛을 냅니다.");
		} else {
			System.out.println("BrokenBlade 발동 실패 : 공격자가 없거나 사망");
		}
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
}
