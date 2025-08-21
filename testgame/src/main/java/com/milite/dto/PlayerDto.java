package com.milite.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;
import com.milite.battle.artifacts.PlayerArtifact;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlayerDto implements BattleUnit {
	String PlayerID;
	String Using_Character;
	int curr_hp;
	int max_hp;
	int atk;
	int luck;
	String WhereSession;
	int WhereStage;

	// --- 이벤트 전용 필드 ---
	int EventAtk; // 몬스터 공격력 변화값
	int EventCurrHp; // 몬스터 현재 체력 변화값
	int EventMaxHp; // 몬스터 최대 체력 변화값

	// --- JSON 컬럼 매핑 ---
	String Using_Skill; // 사용중인 스킬
	String Own_Skill; // 보유중인 스킬
	String Own_Artifact; // 보유중인 아티팩트

	// --- 전투 상태 관리 ---
	Map<String, Integer> statusEffects = new HashMap<>();
	private List<PlayerArtifact> artifacts = new ArrayList<>();

	// --- BattleUnit 인터페이스 구현 ---
	@Override
	public String getName() {
		return this.Using_Character;
	}

	@Override
	public int getHp() {
		return this.curr_hp;
	}

	@Override
	public boolean isAlive() {
		return this.curr_hp > 0;
	}

	@Override
	public String getUnitType() {
		return "Player";
	}

	@Override
	public boolean hasPlayerPriority() {
		return true;
	}

	@Override
	public Map<String, Integer> getStatusEffects() {
		return this.statusEffects;
	}

	@Override
	public void setStatusEffects(Map<String, Integer> statusEffects) {
		this.statusEffects = statusEffects;
	}

	// --- 아티팩트 실행 로직 ---
	public void executeArtifactsOnAttack(BattleUnit target, BattleContext context) {
		for (PlayerArtifact artifact : artifacts) {
			if (artifact != null) {
				artifact.onPlayerAttack(this, target, context);
			}
		}
	}

	public void executeArtifactsOnHit(BattleUnit target, int damageDealt, BattleContext context) {
		for (PlayerArtifact artifact : artifacts) {
			if (artifact != null) {
				artifact.onPlayerHit(this, target, damageDealt, context);
			}
		}
	}

	public void executeArtifactsOnDefensePerHit(BattleUnit attacker, int damage, BattleContext context) {
		for (PlayerArtifact artifact : artifacts) {
			if (artifact != null) {
				artifact.onPlayerDefensePerHit(this, attacker, damage, context);
			}
		}
	}

	public void executeArtifactsOnDefensePerTurn(BattleUnit attacker, int damage, BattleContext context) {
		for (PlayerArtifact artifact : artifacts) {
			if (artifact != null) {
				artifact.onPlayerDefensePerTurn(this, attacker, damage, context);
			}
		}
	}

	public void executeArtifactsOnTurnStart(BattleContext context) {
		for (PlayerArtifact artifact : artifacts) {
			if (artifact != null) {
				artifact.onPlayerTurnStart(this, context);
			}
		}
	}

	public void executeArtifactsOnTurnEnd(BattleContext context) {
		for (PlayerArtifact artifact : artifacts) {
			if (artifact != null) {
				artifact.onPlayerTurnEnd(this, context);
			}
		}
	}

	// --- 아티팩트 관리 ---
	public void addArtifact(PlayerArtifact artifact) {
		if (artifact != null) {
			artifacts.add(artifact);
		}
	}

	public void removeArtifact(PlayerArtifact artifact) {
		artifacts.remove(artifact);
	}

	public List<PlayerArtifact> getArtifacts() {
		return new ArrayList<>(artifacts);
	}

	public boolean hasArtifact(String artifactName) {
		return artifacts.stream().anyMatch(artifact -> artifact.getArtifactName().equals(artifactName));
	}

	public int getArtifactCount() {
		return artifacts.size();
	}
}