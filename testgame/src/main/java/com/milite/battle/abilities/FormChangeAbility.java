package com.milite.battle.abilities;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleMonsterUnit;
import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;
import com.milite.util.KoreanUtil;

public class FormChangeAbility implements SpecialAbility {
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

		boolean isOffensiveStance = shouldUseOffensiveStance(formCount, currentTurn);

		String stanceName = isOffensiveStance ? "공격 태세" : "방어 태세";
		String description = isOffensiveStance ? "공격력이 증가하지만 받는 피해도 증가합니다." : "받는 피해가 감소하지만 공격력도 감소합니다.";
		
		context.addLogEntry(unit.getName(), "form_change", 
	            unit.getName() + KoreanUtil.getJosa(unit.getName(), "이 ", "가 ") + 
	            stanceName + "로 변환했습니다. " + description);
	}

	@Override
	public void onTurnEnd(BattleUnit unit, BattleContext context) {

	}

	@Override
	public String getName() {
		return "FormChange";
	}
	
	private static int getFormCount(BattleMonsterUnit monster) {
		// Todo 추후에 수정해야함
		// static으로 해야하는가? 혹은 special에 따라 BattleMonsterUnit에 변수가 추가되는 식으로 해야하는가?
		return monster.getFormCount();
	}
	
	public static boolean shouldUseOffensiveStance(int formCount, int currentTurn) {
		boolean isOddTurn = currentTurn %2 == 1;
		
		if(formCount == 0) {
			return isOddTurn;
		}else {
			return !isOddTurn;
		}
	}
	
	public static double getAttackMultiplier(BattleUnit unit, int currentTurn) {
		if(!(unit instanceof BattleMonsterUnit)) {
			return 1.0;
		}
		
		BattleMonsterUnit monster = (BattleMonsterUnit) unit;
		if(!"FormChange".equals(monster.getSpecial())) {
			return 1.0;
		}
		
		int formCount = getFormCount(monster);
		boolean isOffensive = shouldUseOffensiveStance(formCount, currentTurn);
		
		return isOffensive ? BattleConstants.getFormChangeOffenseAtk() : BattleConstants.getFormChangeDefenseAtk();
	}
	
	public static double getDefenseMultiplier(BattleUnit unit, int currentTurn) {
		if(!(unit instanceof BattleMonsterUnit)) {
			return 1.0;
		}
		
		BattleMonsterUnit monster = (BattleMonsterUnit) unit;
		if(!"FormChange".equals(monster.getSpecial())) {
			return 1.0;
		}
		
		int formCount = getFormCount(monster);
		boolean isOffensive = shouldUseOffensiveStance(formCount, currentTurn);
		
		return isOffensive ? BattleConstants.getFormChangeOffenseDef() : BattleConstants.getFormChangeDefenseDef();
	}
}
