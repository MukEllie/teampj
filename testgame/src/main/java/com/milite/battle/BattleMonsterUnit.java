package com.milite.battle;

import com.milite.battle.abilities.SpecialAbility;
import com.milite.battle.abilities.SpecialAbilityFactory;
import com.milite.dto.MonsterDto;
import java.util.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleMonsterUnit implements BattleUnit {
	private Integer ID;
	private String name;
	private String element;
	private int hp;
	private int max_hp;
	private int min_atk;
	private int max_atk;
	private int luck;
	private boolean isAlive;
	private String special;
	private Map<String, Integer> statusEffects = new HashMap<>();

	private SpecialAbility specialAbility;
	private int formCount = 0;

	public BattleMonsterUnit(MonsterDto dto) {
		this.ID = dto.getMonsterID();
		this.name = dto.getName();
		this.element = dto.getElement();
		this.hp = calcHP(dto);
		this.max_hp = hp;
		this.min_atk = dto.getMin_atk();
		this.max_atk = dto.getMax_atk();
		this.luck = dto.getLuck();
		this.isAlive = true;
		this.special = dto.getSpecial();
		this.specialAbility = SpecialAbilityFactory.getAbility(this.special);
	}

	public void executeOnAttack(BattleUnit target, BattleContext context) {
		if (specialAbility != null) {
			specialAbility.onAttack(this, target, context);
		}
	}

	public void executeOnHit(BattleUnit target, int damageDealt, BattleContext context) {
		if (specialAbility != null) {
			specialAbility.onHit(this, target, damageDealt, context);
		}
	}

	public void executeOnDefensePerHit(BattleUnit attacker, int damage, BattleContext context) {
		if (specialAbility != null) {
			specialAbility.onDefensePerHit(this, attacker, damage, context);
		}
	}

	public void executeOnDefensePerTurn(BattleUnit attacker, int totalDamage, BattleContext context) {
		if (specialAbility != null) {
			specialAbility.onDefensePerTurn(this, attacker, totalDamage, context);
		}
	}

	public void executeOnTurnStart(BattleContext context) {
		if (specialAbility != null) {
			specialAbility.onTurnStart(this, context);
		}
	}

	public void executeOnTurnEnd(BattleContext context) {
		if (specialAbility != null) {
			specialAbility.onTurnEnd(this, context);
		}
	}

	private int calcHP(MonsterDto dto) {
		int hp = (int) (Math.random() * (dto.getMax_hp() - dto.getMin_hp())) + dto.getMin_hp();
		return hp;
	}

	public void forceFormChange() {
		this.formCount = (this.formCount + 1) % 2;
	}

	/*
	 * private int calcATK(MonsterDto dto) { int atk = (int) (Math.random() *
	 * (dto.getMax_atk() - dto.getMin_atk())) + dto.getMin_atk(); return atk; }
	 */ // 현재 사용 안하는 함수

	@Override
	public String getName() {
		return this.name;
	}

	@Override
	public int getHp() {
		return this.hp;
	}

	@Override
	public int getMax_hp() {
		return this.max_hp;
	}

	@Override
	public boolean isAlive() {
		return this.isAlive;
	}

	@Override
	public String getUnitType() {
		return "Monster";
	}

	@Override
	public boolean hasSwift() {
		return "Swift".equals(this.special);
	}

	@Override
	public String getSpecial() {
		return this.special;
	}

	@Override
	public Map<String, Integer> getStatusEffects() {
		return this.statusEffects;
	}

	@Override
	public void setStatusEffects(Map<String, Integer> statusEffects) {
		this.statusEffects = statusEffects;
	}
}
