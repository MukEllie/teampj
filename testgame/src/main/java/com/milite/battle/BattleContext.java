package com.milite.battle;

import java.util.*;

import com.milite.battle.abilities.FormChangeAbility;
import com.milite.battle.abilities.ModeSwitchAbility;
import com.milite.dto.PlayerDto;
import com.milite.util.KoreanUtil;

import lombok.Data;
import lombok.extern.log4j.Log4j;

@Log4j
@Data
public class BattleContext {
	private BattleSession session;
	private int currentTurn;
	private List<BattleLogEntry> logs = new ArrayList<>();
	private List<DelayedAction> delayedActions = new ArrayList<>();

	public BattleContext(BattleSession session, int currentTurn) {
		this.session = session;
		this.currentTurn = currentTurn;
		this.logs = new ArrayList<>();
		this.delayedActions = new ArrayList<>();
	}

	public void addExtraAttack(BattleUnit attacker, BattleUnit target) {
		delayedActions.add(new ExtraAttackAction(attacker, target));
		log.debug(attacker.getName() + "의 추가 공격이 예약되었습ㄴ니다.");
	}

	public void addReflectDamage(BattleUnit target, int damage) {
		delayedActions.add(new ReflectDamageAction(target, damage));
		log.debug(target.getName() + "에게 " + damage + "의 반사 피해가 예약되었습니다.");
	}

	public void addStatusEffect(BattleUnit target, String statusType, int turns) {
		delayedActions.add(new StatusEffectAction(target, statusType, turns));
		log.debug(target.getName() + "에게 " + statusType + " 상태이상(" + turns + " 턴)이 예약되었습니다.");
	}

	public void addMonsterSummon(String monsterID, int count) {
		delayedActions.add(new SummonAction(monsterID, count));
		log.debug("몬스터 소환이 예약되었습니다 : " + monsterID + " x" + count);
	}

	public int healUnit(BattleUnit unit, int amount) {
		if (unit.getUnitType().equals("Player")) {
			PlayerDto player = (PlayerDto) unit;
			int currentHp = player.getCurr_hp();
			int maxHp = player.getMax_hp();
			int newHp = Math.min(currentHp + amount, maxHp);
			int actualHealed = newHp - currentHp;

			player.setCurr_hp(newHp);

			if (actualHealed > 0) {
				addLogEntry(
						unit.getName() + KoreanUtil.getJosa(unit.getName(), "이 ", "가 ") + actualHealed + "만큼 회복하였습니다");
				log.info(unit.getName() + " 회복 : " + actualHealed + " ( HP : " + currentHp + " -> " + newHp + ")");
			}

			return actualHealed;
		} else if (unit.getUnitType().equals("Monster")) {
			BattleMonsterUnit monster = (BattleMonsterUnit) unit;
			int currentHp = monster.getHp();
			int maxHp = monster.getMax_hp();
			int newHp = Math.min(currentHp + amount, maxHp);
			int actualHealed = newHp - currentHp;

			monster.setHp(newHp);

			if (actualHealed > 0) {
				addLogEntry(
						unit.getName() + KoreanUtil.getJosa(unit.getName(), "이 ", "가 ") + actualHealed + "만큼 회복하였습니다");
				log.info(unit.getName() + " 회복 : " + actualHealed + " ( HP : " + currentHp + " -> " + newHp + ")");
			}
			return actualHealed;
		}
		return 0;
	}

	public void damageUnit(BattleUnit unit, int damage) {
		int finalDamage = damage;
		if(unit.getUnitType().equals("Monster")) {
			finalDamage = applyDefenseReduction(unit, damage);
		}
		
		if (unit.getUnitType().equals("Player")) {
			PlayerDto player = (PlayerDto) unit;
			int currentHp = player.getCurr_hp();
			int newHp = Math.max(currentHp - finalDamage, 0);
			player.setCurr_hp(newHp);

			addLogEntry(unit.getName() + KoreanUtil.getJosa(unit.getName(), "이 ", "가 ") + finalDamage + "의 피해를 받았습니다");
			log.info(unit.getName() + " 피해: " + finalDamage + " (HP: " + currentHp + " → " + newHp + ")");
		} else if (unit.getUnitType().equals("Monster")) {
			BattleMonsterUnit monster = (BattleMonsterUnit) unit;
			int currentHp = monster.getHp();
			int newHp = Math.max(currentHp - finalDamage, 0);
			monster.setHp(newHp);

			if (newHp <= 0) {
				monster.setAlive(false);
				addLogEntry(
						unit.getName() + KoreanUtil.getJosa(unit.getName(), "이 ", "가 ") + finalDamage + "의 피해를 입고 쓰러졌습니다.");
				log.info(unit.getName() + " 사망 : " + finalDamage + " 피해");
			} else {
				addLogEntry(unit.getName() + KoreanUtil.getJosa(unit.getName(), "이 ", "가 ") + finalDamage
						+ "의 피해를 받았습니다. (HP: " + currentHp + " → " + newHp + ")");
				log.info(unit.getName() + " 피해: " + finalDamage + " (HP: " + currentHp + " → " + newHp + ")");
			}
		}
	}

	private int applyDefenseReduction(BattleUnit unit, int damage) {
		if(!(unit instanceof BattleMonsterUnit)) {
			return damage;
		}
		
		BattleMonsterUnit monster = (BattleMonsterUnit) unit;
		double defenseMultiplier = 1.0;
		
		if("FormChange".equals(monster.getSpecial())) {
			defenseMultiplier = FormChangeAbility.getDefenseMultiplier(monster, getCurrentTurn());
		}else if("ModeSwitch".equals(monster.getSpecial())) {
			defenseMultiplier = ModeSwitchAbility.getDefenseMulitplier(monster, getCurrentTurn());
		}
		
		int finalDamage = (int) Math.round(damage / defenseMultiplier);
		return Math.max(finalDamage, 1);
	}
	
	public void addLogEntry(String message) {
		BattleLogEntry logEntry = new BattleLogEntry("System", "special", message, currentTurn);
		logs.add(logEntry);
	}

	public void addLogEntry(String actorName, String actionType, String message) {
		BattleLogEntry logEntry = new BattleLogEntry(actorName, actionType, message, currentTurn);
		logs.add(logEntry);
	}

	public void executeDelayedActions() {
		if (delayedActions.isEmpty()) {
			return;
		}

		log.info("지연된 액션 " + delayedActions.size() + " 개 실행");

		List<DelayedAction> actionsToExecute = new ArrayList<>(delayedActions);
		delayedActions.clear();

		for (DelayedAction action : actionsToExecute) {
			try {
				action.execute(this);
			} catch (Exception e) {
				log.error("지연된 액션 실행 중 오류 발생 : " + e.getMessage(), e);
				addLogEntry("특수능력 실행 중 오류 발생");
			}
		}

		if (!delayedActions.isEmpty()) {
			executeDelayedActions();
		}

		log.info("지연된 액션 실행 완료");
	}

	public List<BattleUnit> getAllUnits() {
		List<BattleUnit> allUnits = new ArrayList<>();
		allUnits.add(session.getPlayer());
		allUnits.addAll(session.getEnemy());
		return allUnits;
	}

	public List<BattleUnit> getAliveEnemies() {
		return session.getEnemy().stream().filter(BattleUnit::isAlive).collect(java.util.stream.Collectors.toList());
	}

	public boolean isPlayerAlive() {
		return session.getPlayer().isAlive();
	}

	public boolean areAllEnemiesDead() {
		return session.getEnemy().stream().noneMatch(BattleUnit::isAlive);
	}

	public void addDetailedLog(String actorName, String actionType, String message) {
		String detailedMessage = String.format("[턴 %d] %s", currentTurn, message);
		BattleLogEntry logEntry = new BattleLogEntry(actorName, actionType, detailedMessage, currentTurn);
		logs.add(logEntry);
		log.debug("상세 로그 추가 : " + detailedMessage);
	}

	public List<BattleLogEntry> getLogs() {
		return new ArrayList<>(logs);
	}

	public BattleSession getSession() {
		return session;
	}

	public int getCurrentTurn() {
		return currentTurn;
	}

	public boolean hasDelayedActions() {
		return !delayedActions.isEmpty();
	}

	public int getDelayedActionCount() {
		return delayedActions.size();
	}
}

interface DelayedAction {
	void execute(BattleContext context);
}

class ExtraAttackAction implements DelayedAction {
	private final BattleUnit attacker;
	private final BattleUnit target;

	public ExtraAttackAction(BattleUnit attacker, BattleUnit target) {
		this.attacker = attacker;
		this.target = target;
	}

	@Override
	public void execute(BattleContext context) {
		if (!attacker.isAlive() || !target.isAlive()) {
			context.addLogEntry(attacker.getName() + "의 추가 공격이 취소되었습니다.");
			return;
		}

		if (attacker instanceof BattleMonsterUnit) {
			BattleMonsterUnit monster = (BattleMonsterUnit) attacker;
			int damage = calcMonsterAttack(monster);

			int targetLuck = getTargetLuck(target);
			boolean isHit = isAttackHit(targetLuck);

			if (isHit) {
				context.damageUnit(target, damage);
				context.addLogEntry(attacker.getName(), "extra_attack",
						attacker.getName() + KoreanUtil.getJosa(attacker.getName(), "이 ", "가 ") + target.getName()
								+ "에게 추가 공격으로 " + damage + "의 피해를 입혔습니다.");
			} else {
				context.addLogEntry(attacker.getName(), "extra_attack", attacker.getName() + "의 추가 공격을 "
						+ target.getName() + KoreanUtil.getJosa(target.getName(), "이 ", "가 ") + "회피하였습니다.");
			}
		}
	}

	private int calcMonsterAttack(BattleMonsterUnit monster) {
		int min_atk = monster.getMin_atk();
		int max_atk = monster.getMax_atk();
		return (int) (Math.random() * (max_atk + min_atk + 1)) + min_atk;
	}

	private int getTargetLuck(BattleUnit target) {
		if (target.getUnitType().equals("Player")) {
			return ((PlayerDto) target).getLuck();
		} else if (target.getUnitType().equals("Monster")) {
			return ((BattleMonsterUnit) target).getLuck();
		}
		return 0;
	}

	private boolean isAttackHit(int luck) {
		int n = (int) (Math.random() * 15) + 1;
		int dodgeChance = n * 2 + luck;
		int roll = (int) (Math.random() * 100) + 1;
		return roll > dodgeChance;
	}
}

class ReflectDamageAction implements DelayedAction {
	private final BattleUnit target;
	private final int damage;

	public ReflectDamageAction(BattleUnit target, int damage) {
		this.target = target;
		this.damage = damage;
	}

	@Override
	public void execute(BattleContext context) {
		if (!target.isAlive()) {
			context.addLogEntry("반사 피해 대상이 사망하여 취소되었습니다.");
			return;
		}

		context.damageUnit(target, damage);
		context.addLogEntry("System", "reflect_damage",
				target.getName() + KoreanUtil.getJosa(target.getName(), "이 ", "가 ") + damage + "의 반사 피해를 받았습니다.");
	}
}

class StatusEffectAction implements DelayedAction {
	private final BattleUnit target;
	private final String statusType;
	private final int turns;

	public StatusEffectAction(BattleUnit target, String statusType, int turns) {
		this.target = target;
		this.statusType = statusType;
		this.turns = turns;
	}

	@Override
	public void execute(BattleContext context) {
		if (!target.isAlive()) {
			context.addLogEntry("상태이상 대상이 이미 사망하였기에 취소되었습니다.");
			return;
		}

		Map<String, Integer> statusEffects = target.getStatusEffects();
		if (statusEffects == null) {
			statusEffects = new HashMap<>();
			target.setStatusEffects(statusEffects);
		}

		int currentTurns = statusEffects.getOrDefault(statusType, 0);
		int newTurns = Math.max(currentTurns, turns);

		statusEffects.put(statusType, newTurns);

		if (currentTurns > 0) {
			context.addLogEntry("System", "status_refresh",
					target.getName() + "의 " + statusType + " 상태 지속시간이 " + newTurns + "턴으로 갱신되었습니다.");
		} else {
			context.addLogEntry("System", "ststus_effect", target.getName()
					+ KoreanUtil.getJosa(target.getName(), "이 ", "가 ") + statusType + " 상태에 걸렸습니다. (" + newTurns + "턴)");
		}
	}
}

class SummonAction implements DelayedAction {
	private final String monsterID;
	private final int count;

	public SummonAction(String monsterID, int count) {
		this.monsterID = monsterID;
		this.count = count;
	}

	@Override
	public void execute(BattleContext context) {
		// todo 로직 구현해야함
		context.addLogEntry("System", "summon", "몬스터 소환 시도 : " + monsterID + " x" + count + " (아직 미구현)");
	}
}