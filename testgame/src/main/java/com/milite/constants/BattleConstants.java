package com.milite.constants;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.milite.service.BattleConstantsService;

@Component
public class BattleConstants {

	private static BattleConstantsService service;

	@Autowired
	public void setService(BattleConstantsService service) {
		BattleConstants.service = service;
	}

	// ========== 상태이상 문자열 ==========
	public static final String STATUS_BURN = "Burn";
	public static final String STATUS_POISON = "Poison";
	public static final String STATUS_FREEZE = "Freeze";
	public static final String STATUS_STUN = "Stun";
	public static final String STATUS_BLIND = "Blind";

	// ========== 시스템 상수들 (DB 조회로 변경) ==========
	public static int getBurnDamage() {
		return service.getIntConstant("system_burn_damage");
	}

	public static int getBaseDodgeRoll() {
		return service.getIntConstant("system_base_dodge_roll");
	}

	public static int getDodgeMultiplier() {
		return service.getIntConstant("system_dodge_multiplier");
	}

	public static int getBlindDodgeBonus() {
		return service.getIntConstant("system_blind_dodge_bonus");
	}

	public static int getSummonMasterId() {
		return service.getIntConstant("system_summon_master_id");
	}

	public static int getServantMonsterId() {
		return service.getIntConstant("system_servant_monster_id");
	}

	public static int getBattleAtkDivisor() {
		return service.getIntConstant("system_battle_atk_divisor");
	}

	public static int getBattleHitRollMax() {
		return service.getIntConstant("system_battle_hit_roll_max");
	}

	// ========== 속성 상성표 (DB 조회로 변경) ==========
	public static double getElementMultiplier(String attackElement, String targetElement) {
		if (attackElement == null || targetElement == null) {
			return 1.0;
		}

		String constantName = "element_" + attackElement.toLowerCase() + "_vs_" + targetElement.toLowerCase();
		try {
			return service.getConstant(constantName);
		} catch (Exception e) {
			// 상수가 없는 경우 기본값 반환
			return 1.0;
		}
	}

	// ========== 특수능력 상수들 (DB 조회로 변경) ==========
	public static double getBloodSuckRatio() {
		return service.getConstant("ability_blood_suck_ratio");
	}

	public static int getRecoveryAmount() {
		return service.getIntConstant("ability_recovery_amount");
	}

	public static int getBraveBiteReflect() {
		return service.getIntConstant("ability_brave_bite_reflect");
	}

	public static int getFlameArmorReflect() {
		return service.getIntConstant("ability_flame_armor_reflect");
	}

	public static int getBlindChance() {
		return service.getIntConstant("ability_blind_chance");
	}

	public static int getBlindTurn() {
		return service.getIntConstant("ability_blind_turn");
	}

	public static int getSummonChance() {
		return service.getIntConstant("ability_summon_chance");
	}

	public static int getSummonMaxServants() {
		return service.getIntConstant("ability_summon_max_servants");
	}

	public static double getThreeChanceMultiplier() {
		return service.getConstant("ability_three_chance_multiplier");
	}

	public static double getThreeStackMultiplier() {
		return service.getConstant("ability_three_stack_multiplier");
	}

	// ========== FormChange 상수들 ==========
	public static double getFormChangeOffenseAtk() {
		return service.getConstant("ability_form_change_offense_atk");
	}

	public static double getFormChangeOffenseDef() {
		return service.getConstant("ability_form_change_offense_def");
	}

	public static double getFormChangeDefenseAtk() {
		return service.getConstant("ability_form_change_defense_atk");
	}

	public static double getFormChangeDefenseDef() {
		return service.getConstant("ability_form_change_defense_def");
	}

	// ========== ModeSwitch 상수들 ==========
	public static double getModeSwitchOffenseAtk() {
		return service.getConstant("ability_mode_switch_offense_atk");
	}

	public static double getModeSwitchOffenseDef() {
		return service.getConstant("ability_mode_switch_offense_def");
	}

	public static double getModeSwitchDefenseAtk() {
		return service.getConstant("ability_mode_switch_defense_atk");
	}

	public static double getModeSwitchDefenseDef() {
		return service.getConstant("ability_mode_switch_defense_def");
	}

	// ========== 아티팩트 상수들 ==========
	public static double getElementStoneBonus() {
		return service.getConstant("artifact_element_stone_bonus");
	}

	public static int getFighterGuildMedalBonus() {
		return service.getIntConstant("artifact_fighter_guild_damage");
	}

	public static int getBurningLavaStoneBonus() {
		return service.getIntConstant("artifact_lava_stone_damage");
	}

	public static int getBlueTridentBonus() {
		return service.getIntConstant("artifact_blue_trident_damage");
	}

	public static int getDruidBeltBonus() {
		return service.getIntConstant("artifact_druid_belt_damage");
	}

	public static int getDryWoodBurnBonus() {
		return service.getIntConstant("artifact_dry_wood_burn_bonus");
	}

	public static int getBlurryLensHitBonus() {
		return service.getIntConstant("artifact_blurry_lens_hit");
	}
	
	public static int getGrayCloakDodgeBonus() {
		return service.getIntConstant("artifact_gray_cloak_dodge");
	}
	
	public static int getDeapsPearlHealAmount() {
		return service.getIntConstant("artifact_deeps_pearl_heal_on_hit");
	}
	
	public static int getBlackCoralHealAmount() {
		return service.getIntConstant("artifact_black_coral_heal_on_attack");
	}
	
	public static int getSeaHeartHealAmount() {
		return service.getIntConstant("artifact_sea_heart_heal_per_turn");
	}
	
	public static double getPoisonNeedleRatio() {
		return service.getConstant("artifact_poison_needle_stack_ratio");
	}
	
	public static int getBrokenBladeReflectDamage() {
		return service.getIntConstant("artifact_broken_blade_reflect");
	}
	
	public static int getDarkHammerStunBonus(){
		return service.getIntConstant("artifact_dark_hammer_stun_bonus");
	}
	
	public static double getMagicianAmuletBonus(){
		return service.getConstant("artifact_magic_amulet_bonus");
	}
	public static double getForbiddenScrollBonus() {
		return service.getConstant("artifact_forbidden_scroll_advantage");
	}
	public static double getForbiddenScrollMinus() {
		return service.getConstant("artifact_forbidden_scroll_disadvantage");
	}
	public static int getShadowDeviceBonus() {
		return service.getIntConstant("artifact_shadow_device_extra_attack");
	}
	public static double getPhoenixFeatherHpRate() {
		return service.getConstant("artifact_phoenix_feather_revival_hp");
	}
	
	// ========== 몬스터 생성 상수들 ==========
	public static int getMonsterStageDice() {
		return service.getIntConstant("monster_stage_1_3_dice");
	}

	public static int getMonsterStageMaxCount() {
		return service.getIntConstant("monster_stage_4_7_max_count");
	}

	public static int getMonsterStageFixedCount() {
		return service.getIntConstant("monster_stage_8_9_count");
	}

	// ========== 기존 ELEMENT_EFFECTIVENESS 맵 대체 ==========
	public static final Map<String, Map<String, Double>> ELEMENT_EFFECTIVENESS = null; // 사용 금지

	// 기존 코드와의 호환성을 위한 deprecated 메서드
	@Deprecated
	public static Map<String, Map<String, Double>> getElementEffectiveness() {
		throw new UnsupportedOperationException("Use getElementMultiplier() instead");
	}
}