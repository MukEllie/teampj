package com.milite.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;

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

public interface EventMapper {

	/* ===== Normal ===== */
	NormalEventDto pickOneUnusedNormal(@Param("session") String session, @Param("playerId") String playerId,
			@Param("layer") String layer);

	NormalEventDto getNormalById(@Param("ne_id") int neId); // ← @Param 추가

	/* ===== Roll ===== */
	RollEventDto pickOneUnusedRoll(@Param("session") String session, @Param("playerId") String playerId,
			@Param("layer") String layer);

	RollEventDto getRollById(@Param("re_id") int reId); // ← @Param 추가

	/* ===== Trap ===== */
	TrapEventDto pickOneUnusedTrap(@Param("session") String session, @Param("playerId") String playerId,
			@Param("layer") String layer);

	TrapEventDto getTrapById(@Param("te_id") int teId); // ← @Param 추가

	/* ===== Select ===== */
	SelectEventDto pickOneUnusedSelect(@Param("session") String session, @Param("playerId") String playerId,
			@Param("layer") String layer);

	List<SelectChoiceDto> getSelectChoices(@Param("se_id") int seId); // 이미 OK(이름 일치)

	SelectChoiceDto getSelectChoiceById(@Param("sec_id") int secId); // ← @Param 추가

	/* ===== Card ===== */
	CardEventDto pickOneUnusedCard(@Param("session") String session, @Param("playerId") String playerId,
			@Param("layer") String layer);

	List<SkillDto> getEventSkillsFromDB(@Param("job") String job, @Param("session") String session,
			@Param("limit") int limit);

	List<SkillDto> getOwnedSkillsRandom(@Param("playerId") String playerId, @Param("limit") int limit);

	/* ===== Artifact ===== */
	ArtifactEventDto pickOneUnusedArtifactEvent(@Param("session") String session, @Param("playerId") String playerId,
			@Param("layer") String layer);

	List<ArtifactDto> getArtifactsBySession(@Param("session") String session, @Param("job") String job,
			@Param("limit") int limit);

	// ★ 추가: artifact 단건 조회
	ArtifactDto getArtifactById(@Param("id") int id);

	/* ===== Boss ===== */
	BossEventDto pickOneUnusedBoss(@Param("session") String session, @Param("playerId") String playerId);

	BossEventDto getBossById(@Param("be_id") int beId); // ← @Param 추가

	/* ===== used_events ===== */
	int markEventUsed(@Param("playerId") String playerId, @Param("layer") String layer, @Param("type") String type,
			@Param("eventId") int eventId);

	int resetLayerUsed(@Param("playerId") String playerId, @Param("layer") String layer);
}