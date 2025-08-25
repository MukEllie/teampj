package com.milite.battle.abilities;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;
import com.milite.util.KoreanUtil;

public class BraveBiteAbility implements SpecialAbility {
	@Override
	public void onAttack(BattleUnit attacker, BattleUnit target, BattleContext context) {

	}

	@Override
	public void onHit(BattleUnit attacker, BattleUnit target, int damageDealt, BattleContext context) {

	}

	@Override
	public void onDefensePerHit(BattleUnit defender, BattleUnit attacker, int damage, BattleContext context) {
		System.out.println("BraveBite 발동 " + defender.getName() + " → " + attacker.getName());
		if (attacker != null && attacker.isAlive()) {
			context.addReflectDamage(attacker, BattleConstants.getBraveBiteReflect());
			System.out.println("반사 피해 예약 : " + BattleConstants.getBraveBiteReflect());

			context.addLogEntry(defender.getName(), "brave_bite", defender.getName()
					+ KoreanUtil.getJosa(defender.getName(), "이 ", "가 ") + attacker.getName() + "을(를) 물어뜯었습니다!");
		} else {
			System.out.println("BraveBite 발동 실패 : 공격자가 없거나 사망");
		}
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
		return "BraveBite";
	}

	public int getReflectDamage() {
		return BattleConstants.getBraveBiteReflect();
	}
}
