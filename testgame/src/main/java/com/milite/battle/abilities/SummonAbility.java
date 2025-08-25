package com.milite.battle.abilities;

import java.util.List;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleMonsterUnit;
import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;

import com.milite.util.KoreanUtil;

public class SummonAbility implements SpecialAbility {
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

	}

	@Override
	public void onTurnStart(BattleUnit unit, BattleContext context) {

	}

	@Override
	public void onTurnEnd(BattleUnit unit, BattleContext context) {

	}

	@Override
	public String getName() {
		return "Summon";
	}

	public boolean shouldSummon(List<BattleUnit> allUnits) {
		int servantCount = countServants(allUnits);

		if (servantCount < BattleConstants.getSummonMaxServants()) {
			int roll = (int) (Math.random() * 100) + 1;
			return roll <= BattleConstants.getSummonChance();
		}
		return false;
	}

	public int countServants(List<BattleUnit> allUnits) {
		int count = 0;
		for (BattleUnit unit : allUnits) {
			if (unit instanceof BattleMonsterUnit) {
				BattleMonsterUnit monster = (BattleMonsterUnit) unit;
				if (monster.getID() != null && monster.getID() == BattleConstants.getSummonMasterId()
						&& unit.isAlive()) {
					count++;
				}
			}
		}
		return count;
	}

	public void performSummon(BattleUnit summoner, BattleContext context) {
		context.addLogEntry(summoner.getName(), "summon",
				summoner.getName() + KoreanUtil.getJosa(summoner.getName(), "이 ", "가 ") + "따라오는 혼들 중 하나에게 손짓을 하였다");
	}
}
