package com.milite.battle.abilities;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleMonsterUnit;
import com.milite.battle.BattleUnit;
import com.milite.util.KoreanUtil;

public class ModeSwitchAbility implements SpecialAbility {
	private static final double OFFENSE_ATK_MULTIPLIER = 1.2;
	private static final double OFFENSE_DEF_MULTIPLIER = 0.8;
	private static final double DEFENSE_ATK_MULTIPLIER = 1.2;
	private static final double DEFENSE_DEF_MULTIPLIER = 0.8;

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
		if (!(unit instanceof BattleMonsterUnit)) {
			return;
		}

		BattleMonsterUnit monster = (BattleMonsterUnit) unit;
		int currentTurn = context.getCurrentTurn();
		int formCount = getFormCount(monster);

		boolean isHungryMode = shouldUseOffensiveStance(formCount, currentTurn);

		String modeName = isHungryMode ? "포식 모드" : "휴식 모드";
		String description = isHungryMode ? "공격적으로 변합니다" : "방어적으로 변합니다";

		context.addLogEntry(unit.getName(), "mode_switch", unit.getName()
				+ KoreanUtil.getJosa(unit.getName(), "이 ", "가 ") + modeName + "로 전환했습니다. " + description);
	}

	@Override
	public void onTurnEnd(BattleUnit unit, BattleContext context) {

	}

	@Override
	public String getName() {
		return "ModeSwitch";
	}

	private static int getFormCount(BattleMonsterUnit monster) {
		return monster.getFormCount();
	}

	public static boolean shouldUseOffensiveStance(int formCount, int currentTurn) {
		boolean isOddTurn = currentTurn % 2 == 1;

		if (formCount == 0) {
			return isOddTurn;
		} else {
			return !isOddTurn;
		}
	}

	public static double getAttackMultiplier(BattleUnit unit, int currentTurn) {
		if (!(unit instanceof BattleMonsterUnit)) {
			return 1.0;
		}

		BattleMonsterUnit monster = (BattleMonsterUnit) unit;
		if (!"ModeSwitch".equals(monster.getSpecial())) {
			return 1.0;
		}

		int formCount = getFormCount(monster);
		boolean isOffensive = shouldUseOffensiveStance(formCount, currentTurn);

		return isOffensive ? OFFENSE_ATK_MULTIPLIER : DEFENSE_ATK_MULTIPLIER;
	}
	
	public static double getDefenseMulitplier(BattleUnit unit, int currentTurn) {
		if(!(unit instanceof BattleMonsterUnit)) {
			return 1.0;
		}
		
		BattleMonsterUnit monster = (BattleMonsterUnit) unit;
		if(!"ModeSwitch".equals(monster.getSpecial())) {
			return 1.0;
		}
		
		int formCount = getFormCount(monster);
		boolean isOffensive = shouldUseOffensiveStance(formCount, currentTurn);
		
		return isOffensive ? OFFENSE_DEF_MULTIPLIER : DEFENSE_DEF_MULTIPLIER;
	}
}
