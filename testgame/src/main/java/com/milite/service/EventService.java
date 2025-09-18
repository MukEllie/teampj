package com.milite.service;

import java.util.List;

import com.milite.dto.ArtifactDto;
import com.milite.dto.ArtifactEventDto;
import com.milite.dto.BossEventDto;
import com.milite.dto.CardEventDto;
import com.milite.dto.NormalEventDto;
import com.milite.dto.RollEventDto;
import com.milite.dto.SelectChoiceDto;
import com.milite.dto.SelectEventDto;
import com.milite.dto.SkillDto;
import com.milite.dto.TrapEventDto;

public interface EventService {

	/** 랜덤 이벤트 트리거 */
	String triggerRandomEvent(String playerId);

	/* Normal */
	/** 일반 이벤트 준비 */
	NormalEventDto prepareNormal(String playerId);

	/** 일반 이벤트 적용 */
	String applyNormal(String playerId, int ne_id);

	/* Roll */
	/** 주사위 이벤트 준비 */
	RollEventDto prepareRoll(String playerId);

	/** 주사위 이벤트 적용 */
	String applyRoll(String playerId, int re_id);

	/* Trap */
	/** 함정 이벤트 준비 */
	TrapEventDto prepareTrap(String playerId);

	/** 함정 이벤트 적용 */
	String applyTrap(String playerId, int te_id);

	/* Select */
	/** 선택 이벤트 준비 */
	SelectEventDto prepareSelect(String playerId);

	/** 선택 이벤트 선택지 조회 */
	List<SelectChoiceDto> getSelectChoices(int se_id);

	/** 선택 이벤트 적용 */
	String applySelect(String playerId, int sec_id);

	/* Card */
	/** 카드 이벤트 준비 */
	CardEventDto prepareCard(String playerId);

	/** 카드 후보 3장 조회 */
	List<SkillDto> getCardChoicesFromSkillDB(String playerId);

	/** 카드 이벤트 적용 */
	String applyCardGain(String playerId, int ce_id, int skillId);

	/* Artifact */
	/** 아티팩트 이벤트 준비 */
	ArtifactEventDto prepareArtifact(String playerId);

	/** 아티팩트 후보 3개 조회 */
	List<ArtifactDto> getArtifactCandidates(String playerId);

	/** 아티팩트 이벤트 적용 */
	String applyArtifactGain(String playerId, int ae_id, int artifactId);

	/* Boss */
	/** 보스 이벤트 준비 */
	BossEventDto prepareBoss(String playerId);

	/** 보스 이벤트 적용 */
	String applyBossEnter(String playerId, int be_id);

	/* Reset */
	/** 층별 이벤트 초기화 */
	int resetLayerUsed(String playerId, String layer);
}