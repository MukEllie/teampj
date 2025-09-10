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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

	private final EventMapper eventMapper;
	private final CharacterStatusMapper characterStatusMapper;

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
		return "redirect:/home";
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
		return "redirect:/home";
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
	public String applyNormal(String playerId, int ne_id) {
		NormalEventDto e = eventMapper.getNormalById(ne_id);
		if (e == null)
			return "일반 이벤트를 찾을 수 없습니다.";
		eventMapper.markEventUsed(playerId, "GLOBAL", "normal", ne_id);
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
	public String applyRoll(String playerId, int re_id) {
		RollEventDto e = eventMapper.getRollById(re_id);
		if (e == null)
			return "주사위 이벤트를 찾을 수 없습니다.";
		eventMapper.markEventUsed(playerId, "GLOBAL", "roll", re_id);
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
	public String applyTrap(String playerId, int te_id) {
		TrapEventDto e = eventMapper.getTrapById(te_id);
		if (e == null)
			return "함정 이벤트를 찾을 수 없습니다.";
		eventMapper.markEventUsed(playerId, "GLOBAL", "trap", te_id);
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
	public String applySelect(String playerId, int sec_id) {
		SelectChoiceDto c = eventMapper.getSelectChoiceById(sec_id); // 선택지 단건 조회
		if (c == null)
			return "선택지를 찾을 수 없습니다.";
		eventMapper.markEventUsed(playerId, "GLOBAL", "select", c.getSe_id()); // 선택 이벤트 사용 처리
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
		return eventMapper.getEventSkillsFromDB(playerId, 3); // Mapper 시그니처 사용
	}

	/** 카드 이벤트 적용 */
	@Override
	public String applyCardGain(String playerId, int ce_id, int skillId) {
		eventMapper.markEventUsed(playerId, "GLOBAL", "card", ce_id);
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
		return eventMapper.getArtifactsBySession(p.getWhereSession(), p.getUsing_Character(), 3);
	}

	/** 아티팩트 이벤트 적용 */
	@Override
	public String applyArtifactGain(String playerId, int ae_id, int artifactId) {
		ArtifactDto item = eventMapper.getArtifactById(artifactId);
		if (item == null)
			return "아티팩트를 찾을 수 없습니다.";
		eventMapper.markEventUsed(playerId, "GLOBAL", "artifact", ae_id);
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
	public String applyBossEnter(String playerId, int be_id) {
		BossEventDto e = eventMapper.getBossById(be_id);
		if (e == null)
			return "보스 이벤트를 찾을 수 없습니다.";
		eventMapper.markEventUsed(playerId, "GLOBAL", "boss", be_id);
		return "보스 이벤트: " + e.getBe_name() + " → (임시) 홈으로 이동";
	}

	/* Reset */
	/** 층별 이벤트 초기화 */
	@Override
	public int resetLayerUsed(String playerId, String layer) {
		return eventMapper.resetLayerUsed(playerId, layer);
	}
}