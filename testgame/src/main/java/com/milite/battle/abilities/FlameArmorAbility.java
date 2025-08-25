package com.milite.battle.abilities;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;
import com.milite.util.KoreanUtil;

public class FlameArmorAbility implements SpecialAbility {
	// private static final int REFLECT_DAMAGE = 3;

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
		if (attacker != null && attacker.isAlive()) {
			context.addReflectDamage(attacker, BattleConstants.getFlameArmorReflect());
			context.addLogEntry(defender.getName(), "flame_armor", defender.getName() + "의 불꽃 갑옷이 " + attacker.getName()
					+ KoreanUtil.getJosa(attacker.getName(), "을 ", "를 ") + "태웠습니다!");
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
		return "FlameArmor";
	}
}
