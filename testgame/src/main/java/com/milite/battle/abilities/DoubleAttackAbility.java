package com.milite.battle.abilities;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;

public class DoubleAttackAbility implements SpecialAbility {
	// 현재 공격횟수로 이미 구현되어있음
	@Override
	public void onAttack(BattleUnit attacker, BattleUnit target, BattleContext context) {

	}

	@Override
	public void onHit(BattleUnit attacker, BattleUnit target,int damageDealt, BattleContext context) {

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
		return "DoubleAttack";
	}
}
