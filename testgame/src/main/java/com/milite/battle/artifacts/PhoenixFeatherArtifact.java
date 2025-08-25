package com.milite.battle.artifacts;

import com.milite.battle.BattleContext;
import com.milite.battle.BattleUnit;
import com.milite.constants.BattleConstants;
import com.milite.dto.PlayerDto;
import com.milite.util.KoreanUtil;

public class PhoenixFeatherArtifact implements PlayerArtifact {
	private static final String ARTIFACT_NAME = "불사조의 하얀 깃털";
	private static final String ARTIFACT_DESCRIPTION = "죽음에 이르는 피해를 받았을 때, 1회에 한하여 체력 50%로 부활";

	private boolean isUsed = false;

	@Override
	public void onPlayerAttack(BattleUnit attacker, BattleUnit target, BattleContext context) {

	}

	@Override
	public void onPlayerHit(BattleUnit attacker, BattleUnit target, int damageDealt, BattleContext context) {

	}

	@Override
	public void onPlayerDefensePerHit(BattleUnit defender, BattleUnit attacker, int damage, BattleContext context) {

	}

	@Override
	public void onPlayerDefensePerTurn(BattleUnit defender, BattleUnit attacker, int totalDamage,
			BattleContext context) {

	}

	@Override
	public void onPlayerTurnStart(BattleUnit unit, BattleContext context) {

	}

	@Override
	public void onPlayerTurnEnd(BattleUnit unit, BattleContext context) {

	}

	@Override
	public String getArtifactName() {
		return ARTIFACT_NAME;
	}

	@Override
	public String getArtifactDescription() {
		return isUsed ? "불사조의 깃털이 강한 빛을 내고있다." : ARTIFACT_DESCRIPTION;
	}

	public boolean canRevive() {
		return !isUsed;
	}

	public double getReviveHpRate() {
		return BattleConstants.getPhoenixFeatherHpRate();
	}

	public boolean executeRevival(PlayerDto player, BattleContext context) {
		if (isUsed) {
			return false;
		}

		isUsed = true;

		int maxHp = player.getMax_hp();
		int revivalHp = (int) (maxHp * getReviveHpRate());
		player.setCurr_hp(revivalHp);

		context.addLogEntry(player.getName(), "phoenix_revival",
				player.getName() + KoreanUtil.getJosa(player.getName(), "의 ", "의 ") + ARTIFACT_NAME + "이 찬란하게 빛나며 "
						+ revivalHp + " HP로 부활시켰습니다!");

		// 상태 변화 로그
		context.addLogEntry(player.getName(), "artifact_state_change",
				ARTIFACT_NAME + "이 그 빛을 잃기 시작합니다... (전투 후 빛바랜 깃털로 변화 예정)");

		return true;
	}
	
	public boolean isUsed() {
		return isUsed;
	}
	
	public String getStatusDescription() {
		if (isUsed) {
			return "불사조의 하얀 깃털: 효과 사용됨 (전투 후 빛바랜 깃털로 변화 예정)";
		} else {
			return "불사조의 하얀 깃털: 부활 효과 준비됨 (50% HP 회복)";
		}
	}
}
