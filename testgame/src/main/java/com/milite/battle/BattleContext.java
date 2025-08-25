package com.milite.battle;

import java.util.*;

import com.milite.battle.abilities.FormChangeAbility;
import com.milite.battle.abilities.ModeSwitchAbility;
import com.milite.battle.artifacts.*;
import com.milite.constants.BattleConstants;
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

	public void addReflectDamage(BattleUnit target, int damage) {
		delayedActions.add(new ReflectDamageAction(target, damage));
		log.debug(target.getName() + "에게 " + damage + "의 반사 피해가 예약되었습니다.");
	}

	public void addStatusEffect(BattleUnit target, String statusType, int turns) {
		addStatusEffect(target, statusType, turns, null);
	}

	public void addStatusEffect(BattleUnit target, String statusType, int turns, BattleUnit caster) {
		delayedActions.add(new StatusEffectAction(target, statusType, turns, caster));
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

		if (unit.getUnitType().equals("Player") && damage > 0) {
			PlayerDto player = (PlayerDto) unit;
			for (PlayerArtifact artifact : player.getArtifacts()) {
				if (artifact instanceof SlipperyLeatherArtifact) {
					SlipperyLeatherArtifact leather = (SlipperyLeatherArtifact) artifact;
					if (leather.canUse()) {
						leather.useEffect();
						finalDamage = 0;

						addLogEntry(unit.getName() + "의 미끄러운 가죽 보호대가 " + damage + " 피해를 완전히 무효화했습니다!");
						break;
					}
				}
			}
		}

		if (unit.getUnitType().equals("Monster")) {
			finalDamage = applyDefenseReduction(unit, damage);
		}

		if (unit.getUnitType().equals("Player")) {
			PlayerDto player = (PlayerDto) unit;
			int currentHp = player.getCurr_hp();
			int newHp = Math.max(currentHp - finalDamage, 0);

			if (newHp <= 0 && currentHp > 0) {
				boolean revived = checkAndExecuteRevival(player);
				if (revived) {
					return;
				}
			}

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
				addLogEntry(unit.getName() + KoreanUtil.getJosa(unit.getName(), "이 ", "가 ") + finalDamage
						+ "의 피해를 입고 쓰러졌습니다.");
				log.info(unit.getName() + " 사망 : " + finalDamage + " 피해");
			} else {
				addLogEntry(unit.getName() + KoreanUtil.getJosa(unit.getName(), "이 ", "가 ") + finalDamage
						+ "의 피해를 받았습니다. (HP: " + currentHp + " → " + newHp + ")");
				log.info(unit.getName() + " 피해: " + finalDamage + " (HP: " + currentHp + " → " + newHp + ")");
			}
		}
	}

	private boolean checkAndExecuteRevival(PlayerDto player) {
		for (PlayerArtifact artifact : player.getArtifacts()) {
			if (artifact instanceof PhoenixFeatherArtifact) {
				PhoenixFeatherArtifact feather = (PhoenixFeatherArtifact) artifact;
				if (feather.canRevive()) {
					return feather.executeRevival(player, this);
				}
			}
		}
		return false;
	}

	private int applyDefenseReduction(BattleUnit unit, int damage) {
		if (!(unit instanceof BattleMonsterUnit)) {
			return damage;
		}

		BattleMonsterUnit monster = (BattleMonsterUnit) unit;
		double defenseMultiplier = 1.0;

		if ("FormChange".equals(monster.getSpecial())) {
			defenseMultiplier = FormChangeAbility.getDefenseMultiplier(monster, getCurrentTurn());
		} else if ("ModeSwitch".equals(monster.getSpecial())) {
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

	public void processAllStatusEffects(BattleUnit unit) {
		Map<String, Integer> statusMap = unit.getStatusEffects();
		if (statusMap == null || statusMap.isEmpty()) {
			return;
		}

		if (statusMap.containsKey(BattleConstants.STATUS_BURN) && statusMap.get(BattleConstants.STATUS_BURN) > 0) {
			int burnDamage = calculateBurnDamage(unit);
			applyStatusDamage(unit, BattleConstants.STATUS_BURN, burnDamage);
			decreaseStatusTurns(unit, BattleConstants.STATUS_BURN);
		}

		if (statusMap.containsKey(BattleConstants.STATUS_POISON) && statusMap.get(BattleConstants.STATUS_POISON) > 0) {
			int poisonDamage = statusMap.get(BattleConstants.STATUS_POISON);
			applyStatusDamage(unit, BattleConstants.STATUS_POISON, poisonDamage);
			decreaseStatusTurns(unit, BattleConstants.STATUS_POISON);
		}

		decreaseStatusTurns(unit, BattleConstants.STATUS_BLIND);
		decreaseStatusTurns(unit, BattleConstants.STATUS_FREEZE);
		decreaseStatusTurns(unit, BattleConstants.STATUS_STUN);
	}

	public void decreaseStatusTurns(BattleUnit unit, String statusType) {
		Map<String, Integer> statusMap = unit.getStatusEffects();
		if (statusMap == null) {
			return;
		}

		int currentTurns = statusMap.getOrDefault(statusType, 0);
		if (currentTurns > 0) {
			currentTurns--;
			if (currentTurns <= 0) {
				statusMap.remove(statusType);
				addLogEntry(unit.getName(), "status_clear", unit.getName()
						+ KoreanUtil.getJosa(unit.getName(), "의 ", "의 ") + getStatusName(statusType) + "이 해제되었습니다.");
			} else {
				statusMap.put(statusType, currentTurns);
			}
		}
	}

	public void applyStatusDamage(BattleUnit unit, String statusType, int damage) {
		if (damage > 0) {
			damageUnit(unit, damage);
			addLogEntry(unit.getName(), statusType + "_damage",
					unit.getName() + KoreanUtil.getJosa(unit.getName(), "이 ", "가 ") + getStatusName(statusType) + "으로 "
							+ damage + "의 피해를 받았습니다.");
		}
	}

	public int calculateBurnDamage(BattleUnit unit) {
		int baseBurnDamage = BattleConstants.getBurnDamage();

		if (unit.getUnitType().equals("Player")) {
			PlayerDto player = (PlayerDto) unit;

			for (PlayerArtifact artifact : player.getArtifacts()) {
				if (artifact instanceof DryWoodArtifact) {
					DryWoodArtifact dryWood = (DryWoodArtifact) artifact;
					baseBurnDamage += dryWood.getBurnDamageBonus();
				}
			}
		}

		return baseBurnDamage;
	}

	public String getStatusName(String statusType) {
		switch (statusType) {
		case BattleConstants.STATUS_BURN:
			return "화상";
		case BattleConstants.STATUS_POISON:
			return "중독";
		case BattleConstants.STATUS_FREEZE:
			return "빙결";
		case BattleConstants.STATUS_STUN:
			return "기절";
		case BattleConstants.STATUS_BLIND:
			return "실명";
		default:
			return statusType;
		}
	}

	void applyPoisonArtifactEffects(BattleUnit caster, BattleUnit target) {
		if (caster == null || !caster.getUnitType().equals("Player")) {
			return;
		}

		PlayerDto player = (PlayerDto) caster;
		Map<String, Integer> targetStatusEffects = target.getStatusEffects();

		if (targetStatusEffects == null) {
			return;
		}

		int existingPoisonTurns = targetStatusEffects.getOrDefault(BattleConstants.STATUS_POISON, 0);

		for (PlayerArtifact artifact : player.getArtifacts()) {
			if (artifact instanceof PoisonNeedleArtifact) {
				PoisonNeedleArtifact needleArtifact = (PoisonNeedleArtifact) artifact;

				if (existingPoisonTurns > 0) {
					int additionalDamage = needleArtifact.calculateStackDamage(existingPoisonTurns);

					if (additionalDamage > 0) {
						damageUnit(target, additionalDamage);
						addLogEntry(caster.getName(), "poison_needle_effect",
								caster.getName() + KoreanUtil.getJosa(caster.getName(), "의 ", "의 ") + "바늘 달린 독 장치가 "
										+ target.getName() + "에게 추가로 " + additionalDamage + "의 중독 피해를 가했습니다! (기존 "
										+ existingPoisonTurns + " 스택)");
					}
				}
				break; // 하나만 적용
			}
		}
	}
}

interface DelayedAction {
	void execute(BattleContext context);
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
	private final BattleUnit caster;

	public StatusEffectAction(BattleUnit target, String statusType, int turns) {
		this(target, statusType, turns, null);
	}

	public StatusEffectAction(BattleUnit target, String statusType, int turns, BattleUnit caster) {
		this.target = target;
		this.statusType = statusType;
		this.turns = turns;
		this.caster = caster;
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

		if (BattleConstants.STATUS_POISON.equals(statusType)) {
			context.applyPoisonArtifactEffects(caster, target);
		}

		int currentTurns = statusEffects.getOrDefault(statusType, 0);
		int newTurns = Math.max(currentTurns, turns);

		statusEffects.put(statusType, newTurns);

		if (currentTurns > 0) {
			context.addLogEntry("System", "status_refresh",
					target.getName() + "의 " + statusType + " 상태 지속시간이 " + newTurns + "턴으로 갱신되었습니다.");
		} else {
			context.addLogEntry("System", "status_effect",
					target.getName() + KoreanUtil.getJosa(target.getName(), "이 ", "가 ") + statusType + " 상태에 걸렸습니다. ("
							+ newTurns + "턴)");
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