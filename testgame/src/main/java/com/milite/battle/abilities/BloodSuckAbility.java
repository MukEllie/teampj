package com.milite.battle.abilities;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;
import com.milite.util.KoreanUtil;

public class BloodSuckAbility implements SpecialAbility {
	@Override
	public void onAttack(BattleUnit attacker, BattleUnit target, BattleContext context) {

	}

	@Override
	public void onHit(BattleUnit attacker, BattleUnit target, int damageDealt, BattleContext context) {
		if (damageDealt <= 0) {
			return;
		}

		int healAmount = (int) Math.ceil(damageDealt * BattleConstants.getBloodSuckRatio());

		if (healAmount > 0) {
			int actualHealed = context.healUnit(attacker, healAmount);
			context.addLogEntry(attacker.getName(), "blood_suck", attacker.getName()
					+ KoreanUtil.getJosa(attacker.getName(), "이 ", "가 ") + "흡혈로 " + actualHealed + "만큼 체력을 회복했습니다.");
		}
	}

	@Override
	public void onDefensePerHit(BattleUnit defender, BattleUnit attacker, int damage, BattleContext context) {

	}

	@Override
	public void onDefensePerTurn(BattleUnit defender, BattleUnit attacker, int totalDamage, BattleContext context) {

	}

	@Override
	public void onTurnStart(BattleUnit unit, BattleContext context) {

	}

	@Override
	public void onTurnEnd(BattleUnit unit, BattleContext context) {

	}

	@Override
	public String getName() {
		return "BloodSuck";
	}
}
