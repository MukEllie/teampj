package com.milite.battle.abilities;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;
import static com.milite.constants.BattleConstants.*;
import com.milite.util.KoreanUtil;

public class BlindAbility implements SpecialAbility {
	private static final int BLIND_CHANCE = 25;
	private static final int BLIND_TURN = 1;

	@Override
	public void onAttack(BattleUnit attacker, BattleUnit target, BattleContext context) {

	}

	@Override
	public void onHit(BattleUnit attacker, BattleUnit target, int damageDealt, BattleContext context) {
		if (damageDealt <= 0) {
			return;
		}

		if (!target.getUnitType().equals("Player")) {
			return;
		}

		int roll = (int) (Math.random() * 100) + 1;
		if (roll <= BLIND_CHANCE) {
			boolean wasAlreadyBlind = isBlind(target);

			context.addStatusEffect(target, STATUS_BLIND, BLIND_TURN);

			if (wasAlreadyBlind) {
				context.addLogEntry(attacker.getName(), "blind_refresh",
						attacker.getName() + "의 공격으로 " + target.getName() + "의 실명이 갱신되었습니다!");
			} else {
				context.addLogEntry(attacker.getName(), STATUS_BLIND, attacker.getName() + "의 공격으로 " + target.getName()
						+ KoreanUtil.getJosa(target.getName(), "이 ", "가 ") + "실명 상태에 걸렸습니다!");
			}
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
		return "Blind";
	}

	public static boolean isBlind(BattleUnit unit) {
		if (unit.getStatusEffects() != null) {
			return unit.getStatusEffects().getOrDefault(STATUS_BLIND, 0) > 0;
		}
		return false;
	}

	public static int getBlindDodgeBonus() {
		return 50;// 실명 명중 감소율을 건드리고 싶다면 여기
	}
}
