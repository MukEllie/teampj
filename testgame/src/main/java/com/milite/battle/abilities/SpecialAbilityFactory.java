package com.milite.battle.abilities;

import java.util.*;

public class SpecialAbilityFactory {
	private static final Map<String, SpecialAbility> abilities = new HashMap<>();

	static {
		abilities.put("Swift", new SwiftAbility());
		abilities.put("DoubleAttack", new DoubleAttackAbility());
		abilities.put("Recovery", new RecoveryAbility());
		abilities.put("BraveBite", new BraveBiteAbility());
		abilities.put("FormChange", new FormChangeAbility());
		abilities.put("ThreeChance", new ThreeChanceAbility());
		abilities.put("FlameArmor", new FlameArmorAbility());
		abilities.put("ModeSwitch", new ModeSwitchAbility());
		abilities.put("ThreeStack", new ThreeStackAbility());
		abilities.put("Immun", new ImmunAbility());
		abilities.put("BloodSuck", new BloodSuckAbility());
		abilities.put("Summon", new SummonAbility());
		abilities.put("Blind", new BlindAbility());
	}

	public static SpecialAbility getAbility(String specialName) {
		return abilities.get(specialName);
	}
}
