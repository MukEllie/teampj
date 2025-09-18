package com.milite.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.milite.dto.CharacterDto;

@Mapper
public interface StartMapper {

	/** 사용자 존재 여부 확인 */
	int existsUserId(@Param("userId") String userId);

	/** 플레이어 신규 생성 */
	int insertPlayerBaseStats(@Param("playerId") String playerId, @Param("name") String name, @Param("hp") int hp,
			@Param("atk") int atk, @Param("luck") int luck);

	/** Warrior, Mage, Thief 순서 조회 */
	List<CharacterDto> getFixedClasses();

	/** 직업 단건 조회 */
	CharacterDto getClassByName(@Param("name") String name);

	/** 세이브가 있으면 WhereStage-1(최소 0) 보정 후 캠프로 이동할 경로 반환 */
	int decrementStageClamp0(@Param("playerId") String playerId);
}