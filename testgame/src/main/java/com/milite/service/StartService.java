package com.milite.service;

import java.util.List;

import com.milite.dto.CharacterDto;
import com.milite.dto.PlayerDto;

public interface StartService {

	/** 시작 상태 조회 */
	StartState getStartState(String userId);

	/** 직업 선택지 3개 조회 */
	List<CharacterDto> getFixedClassOptions();

	/** 직업 선택 적용 */
	String chooseClass(String userId, String className);

	/** 플레이어 조회 */
	PlayerDto getPlayer(String userId);

	/** 시작 상태 DTO */
	class StartState {
		public boolean userExists; // 사용자 존재 여부
		public boolean hasSave; // 세이브 존재 여부
		public String session; // 현재 계층(Water/Fire/Grass)
		public Integer stage; // 현재 스테이지(정수)
		public PlayerDto player; // 플레이어 정보(있으면)
	}
}