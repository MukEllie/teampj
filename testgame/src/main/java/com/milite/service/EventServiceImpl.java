package com.milite.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.milite.dto.ArtifactDto;
import com.milite.dto.ArtifactEventDto;
import com.milite.dto.BossEventDto;
import com.milite.dto.CardEventDto;
import com.milite.dto.NormalEventDto;
import com.milite.dto.PlayerDto;
import com.milite.dto.RollEventDto;
import com.milite.dto.SelectChoiceDto;
import com.milite.dto.SelectEventDto;
import com.milite.dto.SkillDto;
import com.milite.dto.TrapEventDto;
import com.milite.mapper.CharacterStatusMapper;
import com.milite.mapper.EventMapper;
import com.milite.mapper.UserMapper;
import com.milite.util.CommonUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

	private final EventMapper eventMapper;
	private final CharacterStatusMapper characterStatusMapper;
	private final UserMapper userMapper;

	/* ===================== 트리거 ===================== */

	/** 랜덤 이벤트 트리거 */
	@Override
	public String triggerRandomEvent(String playerId) {
		// 1~6 : normal/roll/card/artifact/select/trap
		int r = CommonUtil.Dice(6);
		switch (r) {
		case 1:
			return "forward:/event/normal?playerId=" + playerId;
		case 2:
			return "forward:/event/roll?playerId=" + playerId;
		case 3:
			return "forward:/event/card?playerId=" + playerId;
		case 4:
			return "forward:/event/artifact?playerId=" + playerId;
		case 5:
			return "forward:/event/select?playerId=" + playerId;
		case 6:
			return "forward:/event/trap?playerId=" + playerId;
		default:
			return "redirect:/home";
		}
	}

	/** 보스 제외 랜덤 트리거 */
	@Override
	public String triggerRandomNonBoss(String playerId) {
		List<String> types = new ArrayList<>();
		Collections.addAll(types, "normal", "roll", "card", "artifact", "select", "trap");
		Collections.shuffle(types);

		for (String t : types) {
			switch (t) {
			case "normal":
				if (prepareNormal(playerId) != null)
					return "forward:/event/normal?playerId=" + playerId;
				break;
			case "roll":
				if (prepareRoll(playerId) != null)
					return "forward:/event/roll?playerId=" + playerId;
				break;
			case "card":
				if (prepareCard(playerId) != null)
					return "forward:/event/card?playerId=" + playerId;
				break;
			case "artifact":
				if (prepareArtifact(playerId) != null)
					return "forward:/event/artifact?playerId=" + playerId;
				break;
			case "select":
				if (prepareSelect(playerId) != null)
					return "forward:/event/select?playerId=" + playerId;
				break;
			case "trap":
				if (prepareTrap(playerId) != null)
					return "forward:/event/trap?playerId=" + playerId;
				break;
			}
		}
		return "forward:/event/result?message=소모되지 않은 이벤트가 없습니다.";
	}

	/* ===================== Normal ===================== */

	/** 일반 이벤트 준비 */
	@Override
	public NormalEventDto prepareNormal(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		return eventMapper.pickOneUnusedNormal(p.getWhereSession(), playerId, p.getWhereSession());
	}

	/** 일반 이벤트 적용 */
	@Override
	public String applyNormal(String playerId, int ne_id) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		NormalEventDto e = eventMapper.getNormalById(ne_id);
		if (e == null)
			return "이벤트를 찾을 수 없습니다.";

		int beforeHp = p.getCurr_hp();
		int beforeAtk = p.getAtk();
		int beforeLuck = p.getLuck();

		// 플레이어 변화
		int currHp = Math.max(0, Math.min(p.getMax_hp(), p.getCurr_hp() + e.getNe_php()));
		int atk = Math.max(0, p.getAtk() + e.getNe_patk());
		int luck = Math.max(0, p.getLuck() + e.getNe_luck());

		p.setCurr_hp(currHp);
		p.setAtk(atk);
		p.setLuck(luck);

		// 몬스터 이벤트값(마지막 값만 유지)
		p.setEventCurrHp(e.getNe_mhp()); // mhp
		p.setEventMaxHp(0); // Normal에는 mmax 없음
		p.setEventAtk(e.getNe_matk()); // matk

		// DB 반영
		characterStatusMapper.updateStatus(p);

		// gold(±)
		if (e.getNe_gold() != 0) {
			userMapper.addGold(playerId, e.getNe_gold());
		}

		// used_events 마킹
		eventMapper.markEventUsed(playerId, p.getWhereSession(), "normal", ne_id);

		// 메시지 구성
		StringBuilder sb = new StringBuilder("이벤트 적용: ").append(e.getNe_name()).append("\n");
		appendDelta(sb, "HP", p.getCurr_hp() - beforeHp, "");
		appendDelta(sb, "ATK", p.getAtk() - beforeAtk, "");
		appendDelta(sb, "LUK", p.getLuck() - beforeLuck, "");
		String msg = trimComma(sb.toString());

		StringBuilder mob = new StringBuilder("몬스터 효과(최종): ");
		appendDelta(mob, "mHP", p.getEventCurrHp(), "");
		appendDelta(mob, "mATK", p.getEventAtk(), "");
		String mobLine = trimComma(mob.toString());

		if (!mobLine.endsWith(":"))
			msg = msg + "\n" + mobLine;
		if (e.getNe_gold() != 0)
			msg = msg + "\nGOLD " + (e.getNe_gold() > 0 ? "+" : "") + e.getNe_gold();

		return msg;
	}

	/* ===================== Roll ===================== */

	/** 주사위 이벤트 준비 */
	@Override
	public RollEventDto prepareRoll(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		return eventMapper.pickOneUnusedRoll(p.getWhereSession(), playerId, p.getWhereSession());
	}

	/** 주사위 이벤트 적용 */
	@Override
	public String applyRoll(String playerId, int re_id) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		RollEventDto e = eventMapper.getRollById(re_id);
		if (e == null)
			return "이벤트를 찾을 수 없습니다.";

		int roll = CommonUtil.Dice(e.getRe_dice());
		// Luck 보정 추가
		int finalRoll = roll + p.getLuck();
		boolean success = finalRoll >= e.getRe_dicelimit();

		int beforeHp = p.getCurr_hp();
		int beforeMax = p.getMax_hp();
		int beforeAtk = p.getAtk();
		int beforeLuck = p.getLuck();

		int beforeEvHp = p.getEventCurrHp();
		int beforeEvMax = p.getEventMaxHp();
		int beforeEvAtk = p.getEventAtk();

		int currHp = p.getCurr_hp();
		int maxHp = p.getMax_hp();
		int atk = p.getAtk();
		int luck = p.getLuck();

		int evMhp = 0, evMmax = 0, evMatk = 0;
		int goldDelta = 0;

		// 성공/실패 시 적용값
		if (success) {
			if (e.getRe_php() > 0)
				currHp = Math.min(maxHp, currHp + e.getRe_php());
			if (e.getRe_pmaxhp() > 0) {
				maxHp = Math.max(1, maxHp + e.getRe_pmaxhp());
				if (currHp > maxHp)
					currHp = maxHp;
			}
			if (e.getRe_patk() > 0)
				atk = Math.max(0, atk + e.getRe_patk());
			if (e.getRe_luck() > 0)
				luck = Math.max(0, luck + e.getRe_luck());
			if (e.getRe_gold() > 0)
				goldDelta = e.getRe_gold();

			// 몬스터: 성공 시 적에게 불리(음수)만 적용
			evMhp = (e.getRe_mhp() < 0 ? e.getRe_mhp() : 0);
			evMmax = (e.getRe_mmaxhp() < 0 ? e.getRe_mmaxhp() : 0);
			evMatk = (e.getRe_matk() < 0 ? e.getRe_matk() : 0);
		} else {
			if (e.getRe_php() < 0)
				currHp = Math.max(0, currHp + e.getRe_php());
			if (e.getRe_pmaxhp() < 0) {
				maxHp = Math.max(1, maxHp + e.getRe_pmaxhp());
				if (currHp > maxHp)
					currHp = maxHp;
			}
			if (e.getRe_patk() < 0)
				atk = Math.max(0, atk + e.getRe_patk());
			if (e.getRe_luck() < 0)
				luck = Math.max(0, luck + e.getRe_luck());
			if (e.getRe_gold() < 0)
				goldDelta = e.getRe_gold();

			// 몬스터: 실패 시 적에게 유리(양수)만 적용
			evMhp = (e.getRe_mhp() > 0 ? e.getRe_mhp() : 0);
			evMmax = (e.getRe_mmaxhp() > 0 ? e.getRe_mmaxhp() : 0);
			evMatk = (e.getRe_matk() > 0 ? e.getRe_matk() : 0);
		}

		p.setCurr_hp(currHp);
		p.setMax_hp(maxHp);
		p.setAtk(atk);
		p.setLuck(luck);

		// 마지막 롤의 몬스터 변화만 유지(누적 아님)
		p.setEventCurrHp(evMhp);
		p.setEventMaxHp(evMmax);
		p.setEventAtk(evMatk);

		characterStatusMapper.updateStatus(p);
		if (goldDelta != 0)
			userMapper.addGold(playerId, goldDelta);

		eventMapper.markEventUsed(playerId, p.getWhereSession(), "roll", re_id);

		// 메시지 표시
		StringBuilder sb = new StringBuilder();
		sb.append("주사위 ").append(roll).append(" + LUK(").append(beforeLuck).append(")").append(" = ").append(finalRoll)
				.append(" / 목표 ").append(e.getRe_dicelimit()).append(" → ").append(success ? "성공" : "실패").append("\n");
		appendDelta(sb, "HP", p.getCurr_hp() - beforeHp, "");
		appendDelta(sb, "MaxHP", p.getMax_hp() - beforeMax, "");
		appendDelta(sb, "ATK", p.getAtk() - beforeAtk, "");
		appendDelta(sb, "LUK", p.getLuck() - beforeLuck, "");
		String playerLine = trimComma(sb.toString());

		StringBuilder mob = new StringBuilder("몬스터 효과(최종): ");
		appendDelta(mob, "mHP", p.getEventCurrHp() - beforeEvHp, "");
		appendDelta(mob, "mMax", p.getEventMaxHp() - beforeEvMax, "");
		appendDelta(mob, "mATK", p.getEventAtk() - beforeEvAtk, "");
		String mobLine = trimComma(mob.toString());

		String msg = trimComma(playerLine);
		if (!mobLine.endsWith(":"))
			msg = msg + "\n" + mobLine;
		if (goldDelta != 0)
			msg = msg + "\nGOLD " + (goldDelta > 0 ? "+" : "") + goldDelta;
		return msg;
	}

	/* ===================== Trap ===================== */

	/** 함정 이벤트 준비 */
	@Override
	public TrapEventDto prepareTrap(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		return eventMapper.pickOneUnusedTrap(p.getWhereSession(), playerId, p.getWhereSession());
	}

	/** 함정 이벤트 적용 */
	@Override
	public String applyTrap(String playerId, int te_id) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		System.out.println("[DBG] PlayerID in DTO = " + p.getPlayerID());
		TrapEventDto e = eventMapper.getTrapById(te_id);
		if (e == null)
			return "이벤트를 찾을 수 없습니다.";

		int roll = CommonUtil.Dice(e.getTe_dice());
		// Luck 보정 추가
		int finalRoll = roll + p.getLuck();
		boolean success = finalRoll >= e.getTe_dicelimit();

		// 실패 시 적용값
		if (!success) {
			int beforeHp = p.getCurr_hp();
			int beforeMax = p.getMax_hp();
			int beforeAtk = p.getAtk();
			int beforeLuck = p.getLuck();

			int currHp = Math.max(0, p.getCurr_hp() + e.getTe_php());
			int maxHp = Math.max(1, p.getMax_hp() + e.getTe_maxhp());
			if (currHp > maxHp)
				currHp = maxHp;

			int atk = Math.max(0, p.getAtk() + e.getTe_patk());
			int luck = Math.max(0, p.getLuck() + e.getTe_luck());

			p.setCurr_hp(currHp);
			p.setMax_hp(maxHp);
			p.setAtk(atk);
			p.setLuck(luck);

			// 함정: 몬스터 이벤트값 없음
			p.setEventCurrHp(0);
			p.setEventMaxHp(0);
			p.setEventAtk(0);

			characterStatusMapper.updateStatus(p);
			eventMapper.markEventUsed(playerId, p.getWhereSession(), "trap", te_id);

			// 실패 메시지 표시
			StringBuilder sb = new StringBuilder();
			sb.append("함정 실패(발동): ").append(e.getTe_name()).append(" / 주사위 ").append(roll).append(" + LUK(")
					.append(beforeLuck).append(")").append(" = ").append(finalRoll).append(" (목표 ")
					.append(e.getTe_dicelimit()).append(")").append("\n");
			appendDelta(sb, "HP", p.getCurr_hp() - beforeHp, "");
			appendDelta(sb, "MaxHP", p.getMax_hp() - beforeMax, "");
			appendDelta(sb, "ATK", p.getAtk() - beforeAtk, "");
			appendDelta(sb, "LUK", p.getLuck() - beforeLuck, "");
			return trimComma(sb.toString());
		}

		eventMapper.markEventUsed(playerId, p.getWhereSession(), "trap", te_id);
		// 성공 메시지 표시
		return "함정 회피 성공: " + e.getTe_name() + " / 주사위 " + roll + " + LUK(" + p.getLuck() + ")" + " = " + finalRoll
				+ " (목표 " + e.getTe_dicelimit() + ")";
	}

	/* ===================== Select ===================== */

	/** 선택 이벤트 준비 */
	@Override
	public SelectEventDto prepareSelect(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		return eventMapper.pickOneUnusedSelect(p.getWhereSession(), playerId, p.getWhereSession());
	}

	/** 선택 이벤트 선택지 조회 */
	@Override
	public List<SelectChoiceDto> getSelectChoices(int se_id) {
		return eventMapper.getSelectChoices(se_id);
	}

	/** 선택 이벤트 적용 */
	@Override
	public String applySelect(String playerId, int sec_id) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		SelectChoiceDto c = eventMapper.getSelectChoiceById(sec_id);
		if (c == null)
			return "선택지를 찾을 수 없습니다.";

		int beforeHp = p.getCurr_hp();
		int beforeMax = p.getMax_hp();
		int beforeAtk = p.getAtk();
		int beforeLuck = p.getLuck();

		// 플레이어 변화
		int currHp = Math.max(0, Math.min(p.getMax_hp(), p.getCurr_hp() + c.getSec_php()));
		int maxHp = Math.max(1, p.getMax_hp() + c.getSec_pmaxhp());
		if (currHp > maxHp)
			currHp = maxHp;

		int atk = Math.max(0, p.getAtk() + c.getSec_patk());
		int luck = Math.max(0, p.getLuck() + c.getSec_luck());

		p.setCurr_hp(currHp);
		p.setMax_hp(maxHp);
		p.setAtk(atk);
		p.setLuck(luck);

		// 몬스터 이벤트값: 마지막 선택만 유지
		p.setEventCurrHp(c.getSec_mhp());
		p.setEventMaxHp(c.getSec_mmaxhp());
		p.setEventAtk(c.getSec_matk());

		characterStatusMapper.updateStatus(p);

		// gold(±)
		if (c.getSec_gold() != 0)
			userMapper.addGold(playerId, c.getSec_gold());

		// 중복 방지는 부모 se_id 기준
		eventMapper.markEventUsed(playerId, p.getWhereSession(), "select", c.getSe_id());

		StringBuilder sb = new StringBuilder("선택: ").append(c.getSec_text()).append("\n");
		appendDelta(sb, "HP", p.getCurr_hp() - beforeHp, "");
		appendDelta(sb, "MaxHP", p.getMax_hp() - beforeMax, "");
		appendDelta(sb, "ATK", p.getAtk() - beforeAtk, "");
		appendDelta(sb, "LUK", p.getLuck() - beforeLuck, "");
		String msg = trimComma(sb.toString());

		StringBuilder mob = new StringBuilder("몬스터 효과(최종): ");
		appendDelta(mob, "mHP", p.getEventCurrHp(), "");
		appendDelta(mob, "mMax", p.getEventMaxHp(), "");
		appendDelta(mob, "mATK", p.getEventAtk(), "");
		String mobLine = trimComma(mob.toString());

		if (!mobLine.endsWith(":"))
			msg = msg + "\n" + mobLine;
		if (c.getSec_gold() != 0)
			msg = msg + "\nGOLD " + (c.getSec_gold() > 0 ? "+" : "") + c.getSec_gold();

		return msg;
	}

	/* ===================== Card ===================== */

	/** 카드 이벤트 준비 */
	@Override
	public CardEventDto prepareCard(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		return eventMapper.pickOneUnusedCard(p.getWhereSession(), playerId, p.getWhereSession());
	}

	/** 카드 후보 3장 조회 */
	@Override
	public List<SkillDto> getCardChoicesFromSkillDB(String playerId) {
		// 보유(Own_Skill) 제외 + 직업/세션 반영 + 랜덤 3장
		return eventMapper.getEventSkillsFromDB(playerId, 3);
	}

	/** 카드 이벤트 적용 */
	@Override
	public String applyCardGain(String playerId, int ce_id, int skillId) {
		// 선택한 카드ID를 Own_Skill(CSV)에 저장
		characterStatusMapper.addSkillToPlayer(playerId, skillId);

		// 사용 이력 기록
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		eventMapper.markEventUsed(playerId, p.getWhereSession(), "card", ce_id);

		return "카드 획득 완료: skillId=" + skillId;
	}

	/* ===================== Artifact ===================== */

	/** 아티팩트 이벤트 준비 */
	@Override
	public ArtifactEventDto prepareArtifact(String playerId) {
		// 플레이어의 현재 세션(계층) 정보가 필요하므로 먼저 로드
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);

		// 기존 Mapper 시그니처 유지
		return eventMapper.pickOneUnusedArtifactEvent(p.getWhereSession(), playerId, p.getWhereSession());
	}

	/** 아티팩트 후보 3개 조회 */
	@Override
	public List<ArtifactDto> getArtifactCandidates(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		String job = p.getUsing_Character();
		return eventMapper.getArtifactsBySession(p.getWhereSession(), job, 3);
	}

	/** 아티팩트 이벤트 적용 */
	@Override
	public String applyArtifactGain(String playerId, int ae_id, int artifactId) {
		// 1) 보유 추가 (CSV append)
		characterStatusMapper.addArtifactToPlayer(playerId, artifactId);

		// 2) 사용 기록
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		eventMapper.markEventUsed(playerId, p.getWhereSession(), "artifact", ae_id);

		// 3) 메시지 기본(이름/효과)
		ArtifactDto artifact = eventMapper.getArtifactById(artifactId);
		String baseMsg = "아티팩트 획득 완료: " + artifact.getArtifactName() + " (" + artifact.getArtifactEffect() + ")";

		// 4) 200번대(즉시 효과형)면 스탯 즉시 반영
		String instantMsg = applyInstantArtifactEffectsIfAny(playerId, artifactId);

		return instantMsg.isEmpty() ? baseMsg : (baseMsg + "\n" + instantMsg);
	}

	/** 200~299 아티팩트 즉시효과 반영 (없으면 빈 문자열 반환) */
	private String applyInstantArtifactEffectsIfAny(String playerId, int artifactId) {
		if (artifactId < 200 || artifactId > 300) {
			return "";
		}

		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);

		int beforeHp = p.getCurr_hp();
		int beforeMax = p.getMax_hp();
		int beforeAtk = p.getAtk();
		int beforeLuck = p.getLuck();

		int currHp = p.getCurr_hp();
		int maxHp = p.getMax_hp();
		int atk = p.getAtk();
		int luck = p.getLuck();

		// ── ID 매핑: ArtifactDB 201~206 (요청 테이블 기준)
		switch (artifactId) {
		case 201: // 날카로운 연마석: 공격력 10 증가
			atk += 10;
			break;
		case 202: // 녹슨 덤벨: 최대체력 15 증가
			maxHp += 15;
			if (currHp > maxHp)
				currHp = maxHp;
			break;
		case 203: // 무지개색 네잎클로버: 행운 3 증가
			luck += 3;
			break;
		case 204: // 전투의 정석: 공격력 5, 최대체력 10
			atk += 5;
			maxHp += 10;
			if (currHp > maxHp)
				currHp = maxHp;
			break;
		case 205: // 성기사의 판금갑옷: 최대체력 10, 행운 1
			maxHp += 10;
			if (currHp > maxHp)
				currHp = maxHp;
			luck += 1;
			break;
		case 206: // 치명타 장갑: 공격력 5, 행운 1
			atk += 5;
			luck += 1;
			break;
		default:
			// 200~299 중 아직 규칙 미정인 ID는 아무 것도 안 함
			return "";
		}

		// 하한선 보정
		if (maxHp < 1)
			maxHp = 1;
		if (atk < 0)
			atk = 0;
		if (luck < 0)
			luck = 0;
		if (currHp > maxHp)
			currHp = maxHp;
		if (currHp < 0)
			currHp = 0;

		// 반영
		p.setCurr_hp(currHp);
		p.setMax_hp(maxHp);
		p.setAtk(atk);
		p.setLuck(luck);
		characterStatusMapper.updateStatus(p);

		// 메시지(증감 요약)
		StringBuilder sb = new StringBuilder("즉시 효과 적용: ");
		appendDelta(sb, "HP", currHp - beforeHp, "");
		appendDelta(sb, "MaxHP", maxHp - beforeMax, "");
		appendDelta(sb, "ATK", atk - beforeAtk, "");
		appendDelta(sb, "LUK", luck - beforeLuck, "");
		String msg = trimComma(sb.toString());
		return msg.endsWith(":") ? "" : msg; // 전부 0이면 빈 문자열
	}

	/* ===================== Boss ===================== */

	/** 보스 이벤트 준비 */
	@Override
	public BossEventDto prepareBoss(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		return eventMapper.pickOneUnusedBoss(p.getWhereSession(), playerId);
	}

	/** 보스 이벤트 적용 */
	@Override
	public String applyBossEnter(String playerId, int be_id) {
		BossEventDto e = eventMapper.getBossById(be_id);
		if (e == null)
			return "보스 이벤트를 찾을 수 없습니다.";
		eventMapper.markEventUsed(playerId, "GLOBAL", "boss", be_id);
		return "보스 이벤트: " + e.getBe_name() + " → (임시) 홈으로 이동";
	}

	/* ===================== Reset ===================== */

	/** 층별 이벤트 초기화 */
	@Override
	public int resetLayerUsed(String playerId, String layer) {
		return eventMapper.resetLayerUsed(playerId, layer);
	}

	/* ===================== 메시지 유틸 ===================== */
	// appendDelta, trimComma → 내부 메시지 조립용

	private void appendDelta(StringBuilder sb, String label, int delta, String unit) {
		if (delta == 0)
			return;
		sb.append(label).append(delta > 0 ? " +" : " ").append(delta);
		if (unit != null && !unit.isEmpty())
			sb.append(unit);
		sb.append(", ");
	}

	private String trimComma(String s) {
		if (s == null)
			return "";
		if (s.endsWith(", "))
			return s.substring(0, s.length() - 2);
		return s;
	}
}