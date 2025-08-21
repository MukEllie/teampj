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

	String triggerRandomEvent(String playerId);

	/* 🔸 추가: 보스 제외 랜덤 트리거 */
	String triggerRandomNonBoss(String playerId);

	/* Normal */
	NormalEventDto prepareNormal(String playerId);

	String applyNormal(String playerId, int ne_id);

	/* Roll */
	RollEventDto prepareRoll(String playerId);

	String applyRoll(String playerId, int re_id);

	/* Trap */
	TrapEventDto prepareTrap(String playerId);

	String applyTrap(String playerId, int te_id);

	/* Select */
	SelectEventDto prepareSelect(String playerId);

	List<SelectChoiceDto> getSelectChoices(int se_id);

	String applySelect(String playerId, int sec_id);

	/* Card */
	CardEventDto prepareCard(String playerId);

	List<SkillDto> getCardChoicesFromSkillDB(String playerId);

	List<SkillDto> getCardChoicesFromOwned(String playerId);

	String applyCardGain(String playerId, int ce_id, int skillId);

	/* Artifact */
	ArtifactEventDto prepareArtifact(String playerId);

	List<ArtifactDto> getArtifactCandidates(String playerId);

	String applyArtifactGain(String playerId, int ae_id, int artifactId);

	/* Boss */
	BossEventDto prepareBoss(String playerId);

	String applyBossEnter(String playerId, int be_id);

	/* Reset */
	int resetLayerUsed(String playerId, String layer);
}