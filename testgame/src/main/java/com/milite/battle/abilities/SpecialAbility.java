package com.milite.battle.abilities;

import com.milite.battle.BattleUnit;
import com.milite.battle.BattleContext;

public interface SpecialAbility {
	void onAttack(BattleUnit attacker, BattleUnit target, BattleContext context);
	/* 공격 시도 시, 명중 여부와 관계 없이 발동하는 옵션
	 * 아마 ThreeChance에서 쓰게 될 듯 */
	
	void onHit(BattleUnit attacker, BattleUnit target, int damageDealt, BattleContext context);
	/* 명중 시, 발동하는 옵션
	 * 흡혈이라던가*/
	
	void onDefensePerHit(BattleUnit defender, BattleUnit attacker, int damage, BattleContext context);
	/* 피격 시, 매 피격마다 발동하는 옵션
	 * 현재는 BraveBite와 Immun에 쓸 것 같음 */
	
	void onDefensePerTurn(BattleUnit defender, BattleUnit attacker, int totalDamage, BattleContext context);
	/* 피격 시, 해당 턴에 한 번만 발동하는 옵션
	 * FlameArmor에서 쓸 듯 */
	
	void onTurnStart(BattleUnit unit, BattleContext context);
	/*턴 시작 시 발동하는 옵션
	 * Recovery 라던가*/
	void onTurnEnd(BattleUnit unit, BattleContext context);
	/* 턴 종료 시 발동하는 옵션
	 * Immun을 이쪽으로 옮겨도 될 것 같음*/
	
	String getName();
}
