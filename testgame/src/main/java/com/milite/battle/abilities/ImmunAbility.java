package com.milite.battle.abilities;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleMonsterUnit;
import com.milite.battle.BattleUnit;
import com.milite.util.KoreanUtil;

public class ImmunAbility implements SpecialAbility {
	@Override
	public void onAttack(BattleUnit attacker, BattleUnit target, BattleContext context) {

	}

	@Override
	public void onHit(BattleUnit attacker, BattleUnit target, int damageDealt, BattleContext context) {

	}

	@Override
	public void onDefensePerHit(BattleUnit defender, BattleUnit attacker, int damage, BattleContext context) {

	}

	@Override
	public void onDefensePerTurn(BattleUnit defender, BattleUnit attacker, int totalDamage, BattleContext context) {
		if (defender.getStatusEffects() != null && !defender.getStatusEffects().isEmpty()) {
			defender.getStatusEffects().clear();
			context.addLogEntry(defender.getName(), "immune",
					defender.getName() + KoreanUtil.getJosa(defender.getName(), "의 ", "의 ") + "면역력으로 상태이상이 정화되었습니다.");
		}
	}

	@Override
	public void onTurnStart(BattleUnit unit, BattleContext context) {

	}

	@Override
	public void onTurnEnd(BattleUnit unit, BattleContext context) {

	}

	@Override
	public String getName() {
		return "Immun";
	}

	public static boolean isImmun(BattleUnit unit) {
		if (unit instanceof BattleMonsterUnit) {
			BattleMonsterUnit monster = (BattleMonsterUnit) unit;
			return "Immun".equals(monster.getSpecial());
		}
		return false;
	}
}