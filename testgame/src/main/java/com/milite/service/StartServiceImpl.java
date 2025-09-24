package com.milite.service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.milite.dto.CharacterDto;
import com.milite.dto.PlayerDto;
import com.milite.mapper.CharacterStatusMapper;
import com.milite.mapper.SkillMapper;
import com.milite.mapper.StartMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StartServiceImpl implements StartService {

	private final CharacterStatusMapper characterStatusMapper; // 기존 조회 매퍼 재사용
	private final StartMapper startMapper; // 시작 전용 매퍼
	private final SkillMapper skillMapper; // 기본 스킬 조회용

	/** 시작 상태 조회 */
	@Override
	public StartState getStartState(String userId) {
		StartState s = new StartState();
		s.userExists = startMapper.existsUserId(userId) > 0;
		if (!s.userExists) {
			s.hasSave = false;
			s.session = null;
			s.stage = null;
			s.player = null;
			return s;
		}
		PlayerDto p = characterStatusMapper.getPlayerInfo(userId); // Player_ID = userId
		boolean hasSave = (p != null && p.getUsing_Character() != null && !p.getUsing_Character().isEmpty());
		s.player = p;
		s.hasSave = hasSave;
		s.session = (p != null ? p.getWhereSession() : null);
		s.stage = (p != null ? p.getWhereStage() : null);
		return s;
	}

	@Override
	@Transactional
	public String continueRun(String userId) {
		// 1) User 존재 확인
		if (startMapper.existsUserId(userId) == 0)
			return null;

		// 2) Player 존재 확인
		PlayerDto p = characterStatusMapper.getPlayerInfo(userId);
		if (p == null)
			return null;

		// 3) WhereStage = max(0, WhereStage-1)
		startMapper.decrementStageClamp0(userId);

		// 4) 캠프로 이동 경로 반환
		return "forward:/camp?playerId=" + userId;
	}

	/** Warrior, Mage, Thief 순서 반환 */
	@Override
	public List<CharacterDto> getFixedClassOptions() {
		return startMapper.getFixedClasses(); // Stream 없이 매퍼 결과 사용
	}

	/** 직업 선택 적용 */
	@Override
	@Transactional
	public String chooseClass(String userId, String className, int skinId) {
		PlayerDto exists = characterStatusMapper.getPlayerInfo(userId);
		if (exists != null && exists.getUsing_Character() != null && !exists.getUsing_Character().isEmpty())
			return "이미 직업이 선택되어 있습니다.";
		if (startMapper.existsUserId(userId) == 0)
			return "존재하지 않는 사용자입니다.";
		CharacterDto c = startMapper.getClassByName(className);
		if (c == null)
			return "존재하지 않는 직업입니다.";

		// 기본 세이브 생성(스킨 포함)
		startMapper.insertPlayerBaseStats(userId, // Player_ID
				c.getName(), // Using_Character
				c.getHp(), c.getAtk(), c.getLuck(), skinId // Using_Skin
		);

		// ★ 기본 스킬 CSV 자동 지급: (skill_job='Common' OR 직업명) AND skill_type='Basic' AND
		// rarity='N'
		List<Integer> ids = skillMapper.findDefaultSkillIds(c.getName());
		if (ids != null && !ids.isEmpty()) {
			String csv = ids.stream().filter(Objects::nonNull).map(String::valueOf).distinct()
					.collect(Collectors.joining(","));
			startMapper.updateOwnSkillCsv(userId, csv); // PlayerDB.Own_Skill 에 일괄 세팅
		}

		return "직업 선택 완료";
	}

	/** 플레이어 조회 */
	@Override
	public PlayerDto getPlayer(String userId) {
		return characterStatusMapper.getPlayerInfo(userId);
	}
}