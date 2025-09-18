package com.milite.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

	private final EventMapper eventMapper;
	private final CharacterStatusMapper characterStatusMapper;
	private final UserMapper userMapper; // addGold 사용

	/* Trigger */
	/** 랜덤 이벤트 트리거 */
	@Override
	public String triggerRandomEvent(String playerId) {
		List<String> types = new ArrayList<>();
		Collections.addAll(types, "boss", "normal", "roll", "card", "artifact", "select", "trap"); // 보스 포함
		Collections.shuffle(types);
		for (String t : types) {
			switch (t) {
			case "boss":
				if (prepareBoss(playerId) != null)
					return "forward:/event/boss?playerId=" + playerId;
				break;
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
		return "redirect:/camp";
	}

	/* Normal */
	/** 일반 이벤트 준비 */
	@Override
	public NormalEventDto prepareNormal(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		return eventMapper.pickOneUnusedNormal(p.getWhereSession(), playerId, p.getWhereSession());
	}

	/** 일반 이벤트 적용 */
	@Override
	@Transactional
	public String applyNormal(String playerId, int ne_id) {
		NormalEventDto e = eventMapper.getNormalById(ne_id);
		if (e == null)
			return "일반 이벤트를 찾을 수 없습니다.";

		// 플레이어/몬스터 스탯 통합 반영
		characterStatusMapper.applyAllDeltas(playerId, /* dPMaxHp */ 0, // Normal: 플레이어 MaxHP 변화 없음
				/* dPHp */ safe(e.getNe_php()), /* dPAtk */ safe(e.getNe_patk()), /* dPLuck */ safe(e.getNe_luck()),
				/* dMMaxHp */ 0, /* dMHp */ safe(e.getNe_mhp()), /* dMAtk */ safe(e.getNe_matk()));
		// 골드 증가(감소 없음 가정)
		if (nz(e.getNe_gold()))
			userMapper.addGold(playerId, e.getNe_gold());

		// 세션을 layer에 소문자로 저장
		String layer = valLower(e.getNe_session());
		eventMapper.markEventUsed(playerId, layer, "normal", ne_id);
		return "일반 이벤트 적용 완료";
	}

	/* Roll */
	/** 주사위 이벤트 준비 */
	@Override
	public RollEventDto prepareRoll(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		return eventMapper.pickOneUnusedRoll(p.getWhereSession(), playerId, p.getWhereSession());
	}

	/** 주사위 이벤트 적용 */
	@Override
	@Transactional
	public String applyRoll(String playerId, int re_id) {
		RollEventDto e = eventMapper.getRollById(re_id);
		if (e == null)
			return "주사위 이벤트를 찾을 수 없습니다.";

		characterStatusMapper.applyAllDeltas(playerId, /* dPMaxHp */ safe(e.getRe_pmaxhp()),
				/* dPHp */ safe(e.getRe_php()), /* dPAtk */ safe(e.getRe_patk()), /* dPLuck */ safe(e.getRe_luck()),
				/* dMMaxHp */ safe(e.getRe_mmaxhp()), /* dMHp */ safe(e.getRe_mhp()), /* dMAtk */ safe(e.getRe_matk()));
		if (nz(e.getRe_gold()))
			userMapper.addGold(playerId, e.getRe_gold());

		String layer = valLower(e.getRe_session());
		eventMapper.markEventUsed(playerId, layer, "roll", re_id);
		return "주사위 이벤트 적용 완료";
	}

	/* Trap */
	/** 함정 이벤트 준비 */
	@Override
	public TrapEventDto prepareTrap(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		return eventMapper.pickOneUnusedTrap(p.getWhereSession(), playerId, p.getWhereSession());
	}

	/** 함정 이벤트 적용 */
	@Override
	@Transactional
	public String applyTrap(String playerId, int te_id) {
		TrapEventDto e = eventMapper.getTrapById(te_id);
		if (e == null)
			return "함정 이벤트를 찾을 수 없습니다.";

		characterStatusMapper.applyAllDeltas(playerId, /* dPMaxHp */ safe(e.getTe_maxhp()),
				/* dPHp */ safe(e.getTe_php()), /* dPAtk */ safe(e.getTe_patk()), /* dPLuck */ safe(e.getTe_luck()),
				/* dMMaxHp */ 0, /* dMHp */ 0, /* dMAtk */ 0);
		String layer = valLower(e.getTe_session());
		eventMapper.markEventUsed(playerId, layer, "trap", te_id);
		return "함정 이벤트 적용 완료";
	}

	/* Select */
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
	@Transactional
	public String applySelect(String playerId, int sec_id) {
		SelectChoiceDto c = eventMapper.getSelectChoiceById(sec_id);
		if (c == null)
			return "선택지를 찾을 수 없습니다.";

		// 스탯/골드 반영(선택지 기준)
		characterStatusMapper.applyAllDeltas(playerId, /* dPMaxHp */ safe(c.getSec_pmaxhp()),
				/* dPHp */ safe(c.getSec_php()), /* dPAtk */ safe(c.getSec_patk()), /* dPLuck */ safe(c.getSec_luck()),
				/* dMMaxHp */ safe(c.getSec_mmaxhp()), /* dMHp */ safe(c.getSec_mhp()),
				/* dMAtk */ safe(c.getSec_matk()));
		if (nz(c.getSec_gold()))
			userMapper.addGold(playerId, c.getSec_gold());

		// 부모 이벤트 세션으로 layer 저장
		SelectEventDto se = eventMapper.getSelectById(c.getSe_id());
		String layer = valLower(se != null ? se.getSe_session() : "none");
		eventMapper.markEventUsed(playerId, layer, "select", c.getSe_id());
		return "선택 이벤트 적용 완료";
	}

	/* Card */
	/** 카드 이벤트 준비 */
	@Override
	public CardEventDto prepareCard(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		return eventMapper.pickOneUnusedCard(p.getWhereSession(), playerId, p.getWhereSession());
	}

	/** 카드 후보 3장 조회 */
	@Override
	public List<SkillDto> getCardChoicesFromSkillDB(String playerId) {
		return eventMapper.getEventSkillsFromDB(playerId, 3); // Mapper에서 보유 중복 배제 조건 포함
	}

	/** 카드 이벤트 적용 */
	@Override
	@Transactional
	public String applyCardGain(String playerId, int ce_id, int skillId) {
		// 보유 스킬 추가
		characterStatusMapper.addSkillToPlayer(playerId, skillId);

		// 세션을 읽어 layer 저장(소문자)
		CardEventDto e = eventMapper.getCardById(ce_id);
		String layer = valLower(e != null ? e.getCe_session() : "none");
		eventMapper.markEventUsed(playerId, layer, "card", ce_id);
		return "카드 획득 완료";
	}

	/* Artifact */
	/** 아티팩트 이벤트 준비 */
	@Override
	public ArtifactEventDto prepareArtifact(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		return eventMapper.pickOneUnusedArtifactEvent(p.getWhereSession(), playerId, p.getWhereSession());
	}

	/** 아티팩트 후보 3개 조회 */
	@Override
	public List<ArtifactDto> getArtifactCandidates(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		// getArtifactsBySession(session, job, limit, playerId) 시그니처를 사용(보유 중복 배제)
		return eventMapper.getArtifactsBySession(p.getWhereSession(), p.getUsing_Character(), 3, playerId);
	}

	/** 아티팩트 이벤트 적용 */
	@Override
	@Transactional
	public String applyArtifactGain(String playerId, int ae_id, int artifactId) {
		ArtifactDto item = eventMapper.getArtifactById(artifactId);
		if (item == null)
			return "아티팩트를 찾을 수 없습니다.";

		// 보유 아티팩트 추가
		characterStatusMapper.addArtifactToPlayer(playerId, artifactId);

		// 세션을 DTO에서 읽어 layer 저장(소문자)
		String layer = valLower(item.getArtifactSession());
		eventMapper.markEventUsed(playerId, layer, "artifact", ae_id);
		return "아티팩트 획득 완료";
	}

	/* Boss */
	/** 보스 이벤트 준비 */
	@Override
	public BossEventDto prepareBoss(String playerId) {
		PlayerDto p = characterStatusMapper.getPlayerInfo(playerId);
		return eventMapper.pickOneUnusedBoss(p.getWhereSession(), playerId);
	}

	/** 보스 이벤트 적용 */
	@Override
	@Transactional
	public String applyBossEnter(String playerId, int be_id) {
		BossEventDto e = eventMapper.getBossById(be_id);
		if (e == null)
			return "보스 이벤트를 찾을 수 없습니다.";
		String layer = valLower(e.getBe_session());
		eventMapper.markEventUsed(playerId, layer, "boss", be_id);
		return "보스 이벤트: " + e.getBe_name() + " → (임시) 홈으로 이동";
	}

	/* Reset */
	/** 층별 이벤트 초기화 */
	@Override
	public int resetLayerUsed(String playerId, String layer) {
		return eventMapper.resetLayerUsed(playerId, layer);
	}

	/* ===== 내부 유틸 ===== */
	private static int safe(Integer v) {
		return v == null ? 0 : v;
	}

	private static boolean nz(Integer v) {
		return v != null && v != 0;
	}

	private static String valLower(String s) {
		return (s == null || s.isEmpty()) ? "none" : s.toLowerCase();
	}
}