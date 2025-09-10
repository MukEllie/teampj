package com.milite.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.stream.Collectors;

import com.milite.dto.PlayerDto;
import com.milite.dto.SkillDto;
import com.milite.mapper.CharacterStatusMapper;
import com.milite.mapper.SkillMapper;
import com.milite.util.CommonUtil;
import com.milite.util.StringUtil;

import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@Service
@Transactional
public class SkillServiceImpl implements SkillService {
	@Setter(onMethod_ = @Autowired)
	private SkillMapper skillMapper;

	@Setter(onMethod_ = @Autowired)
	private CharacterStatusMapper characterMapper;

	@Override
	public SkillDto getSkillInfo(Integer skillID) {
		return skillMapper.getSkillInfo(skillID);
	}

	@Override
	public SkillDto getSkillInfo(String skillID) {
		return skillMapper.getSkillInfoByString(skillID);
	}

	@Override
	public List<SkillDto> getSkillReward(String job, String rarity, String type, String element) {
		log.info("스킬 조회 - job: " + job + ", rarity: " + rarity + ", type: " + type + ", element: " + element);
		return skillMapper.getSkillReward(job, rarity, type, element);
	}

	// ====
	public List<SkillDto> getSkillReward(String job, String rarity) {
		return getSkillReward(job, rarity, "Battle", null);
	}

	// 이벤트 구현은 추후
	/*
	 * public List<SkillDto> getSkillEvent(String job, String element) { return
	 * getSkillReward(job, null, "Event", element); }
	 */

	// ====
	@Override
	public List<SkillDto> getPlayerSkillList(String playerID) {
		log.info("플레이어 스킬 리스트 조회");

		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null) {
				log.warn("플레이어 정보 없음");
				return new ArrayList<>();
			}

			List<SkillDto> skillList = new ArrayList<>();

			List<String> usingSkillIDs = player.getUsingSkillList();
			for (String skillID : usingSkillIDs) {
				SkillDto skill = getSkillInfo(skillID);
				if (skill != null) {
					skillList.add(skill);
				}
			}

			List<String> ownedSkillIDs = player.getOwnSkillList();
			for (String skillID : ownedSkillIDs) {
				SkillDto skill = getSkillInfo(skillID);
				if (skill != null) {
					skillList.add(skill);
				}
			}

			log.info("통합 스킬 리스트 완료");
			return skillList;
		} catch (Exception e) {
			log.error("스킬 리스트 조회 실패 : " + e.getMessage());
			return new ArrayList<>();
		}
	}

	@Override
	public String convertSkillListToString(List<SkillDto> skillList) {
		if (skillList == null || skillList.isEmpty()) {
			return "";
		}

		List<String> skillIDStrings = skillList.stream().map(skill -> skill.getSkill_id().toString())
				.collect(Collectors.toList());

		return StringUtil.joinWithComma(skillIDStrings);
	}

	@Override
	public String managePlayerSkill(String playerID, String newSkillID) {
		log.info("스킬 관리 제어");
		try {
			int currentCount = getOwnedSkillCount(playerID);

			if (currentCount >= 10) {
				log.info("스킬 교체 필요");
				return "SKILL_FULL";
			} else {
				log.info("보유 스킬 : " + currentCount + " 개, 스킬 추가");
				return addSkillToPlayer(playerID, newSkillID);
			}
		} catch (Exception e) {
			log.error("스킬 관리 실패 : " + e.getMessage());
			return "스킬 관리 중 오류 발생 : " + e.getMessage();
		}
	}

	@Override
	public String addSkillToPlayer(String playerID, String newSkillID) {
		log.info("스킬 추가 시작 - Player : " + playerID + ", 스킬 : " + newSkillID);
		try {
			if (getOwnedSkillCount(playerID) >= 10) {
				log.warn("이미 보유 스킬 10개이므로 추가 실패");
				return "스킬 보유량이 10개이기에 교체가 필요합니다.";
			}

			characterMapper.addSkillToPlayerByString(playerID, newSkillID);
			log.info("스킬 추가 완료");
			return "스킬 추가를 완료하였습니다.";
		} catch (Exception e) {
			log.error("스킬 추가 실패 : " + e.getMessage());
			throw e;
		}
	}

	@Override
	public String replacePlayerSkill(String playerID, String oldSkillID, String newSkillID) {
		log.info("스킬 교체 시작");

		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null) {
				return "플레이어 정보 없음";
			}

			List<String> ownedSkillIDs = player.getOwnSkillList();
			if (!ownedSkillIDs.contains(oldSkillID)) {
				return "교체 대상 스킬이 존재하지 않습니다";
			}

			List<String> usingSkillIDs = player.getUsingSkillList();

			// 사용스킬 4개 + 보유 스킬 10개로 이루어진 리스트 제작
			List<String> combinedList = new ArrayList<>();
			combinedList.addAll(usingSkillIDs);
			combinedList.addAll(ownedSkillIDs);

			boolean skillReplaced = false;

			for (int i = 0; i < combinedList.size(); i++) {
				if (combinedList.get(i).equals(oldSkillID)) {
					combinedList.set(i, newSkillID);
					skillReplaced = true;
				}
			}

			if (!skillReplaced) {
				return "교체할 스킬을 찾지 못했습니다";
			}

			int usingSkillSize = usingSkillIDs.size();

			List<String> newUsingSkills = new ArrayList<>();
			for (int i = 0; i < usingSkillSize && i < combinedList.size(); i++) {
				newUsingSkills.add(combinedList.get(i));
			}

			List<String> newOwnedSkills = new ArrayList<>();
			for (int i = usingSkillSize; i < combinedList.size(); i++) {
				newOwnedSkills.add(combinedList.get(i));
			}

			String newUsingSkillString = StringUtil.joinWithComma(newUsingSkills);
			String newOwnedSkillString = StringUtil.joinWithComma(newOwnedSkills);

			characterMapper.updatePlayerSkills(playerID, newUsingSkillString, newOwnedSkillString);

			log.info("스킬 교체 완료 - player : " + playerID);
			return "스킬 교체 성공";
		} catch (Exception e) {
			log.error("스킬 교체 실패 : " + e.getMessage());
			throw e; // throw 쓰는 이유는 트랜잭션이기 때문
		}
	}

	@Override
	public int getOwnedSkillCount(String playerID) {
		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null) {
				return 0;
			}

			return player.getOwnSkillList().size();
		} catch (Exception e) {
			log.error("보유 스킬 개수 확인 실패 : " + e);
			return 0;
		}
	}

	public SkillDto getRewardSkill(List<SkillDto> skillList) {
		if (skillList == null || skillList.isEmpty()) {
			log.warn("빈 스킬 리스트");
			return null;
		}

		int r = CommonUtil.Dice(skillList.size());
		SkillDto rewardSkill = skillList.get(r - 1);
		log.info("선택된 스킬 : " + rewardSkill.getSkill_name() + " (" + rewardSkill.getRarity() + ")");
		return rewardSkill;
	}

	@Override
	public List<SkillDto> getOwnSkillList(String playerID) {
		log.info("보유 스킬 조회");

		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null || player.getOwn_Skill() == null || player.getOwn_Skill().isEmpty()) {
				return new ArrayList<>();
			}

			List<String> ownedSkillIDs = player.getOwnSkillList();
			List<SkillDto> ownedSkill = new ArrayList<>();

			for (String skillID : ownedSkillIDs) {
				SkillDto skill = getSkillInfo(skillID);
				if (skill != null) {
					ownedSkill.add(skill);
				}
			}

			log.info("보유 스킬 조회 완료 : " + ownedSkill.size());
			return ownedSkill;
		} catch (Exception e) {
			log.error("보유 스킬 조회 실패: " + e.getMessage());
			return new ArrayList<>();
		}
	}

	@Override
	public List<SkillDto> getUsingSkillList(String playerID) {
		log.info("사용 스킬 조회");

		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null || player.getUsing_Skill() == null || player.getUsing_Skill().isEmpty()) {
				return new ArrayList<>();
			}

			List<String> usingSkillIDs = player.getUsingSkillList();
			List<SkillDto> usingSkill = new ArrayList<>();

			for (String skillID : usingSkillIDs) {
				SkillDto skill = getSkillInfo(skillID);
				if (skill != null) {
					usingSkill.add(skill);
				}
			}

			log.info("사용 스킬 조회 완료 : " + usingSkill.size());
			return usingSkill;
		} catch (Exception e) {
			log.error("사용 스킬 조회 실패: " + e.getMessage());
			return new ArrayList<>();
		}
	}

	@Override
	public Map<String, Object> setUsingSkill(String playerID, String skillIDs) {
		log.info("사용 스킬 설정");

		Map<String, Object> result = new HashMap<>();

		try {
			if (skillIDs == null || skillIDs.trim().isEmpty()) {
				skillIDs = "";
			}

			List<String> skillIDList;
			if (skillIDs.isEmpty()) {
				skillIDList = new ArrayList<>();
			} else {
				skillIDList = StringUtil.splitCommaString(skillIDs);
			}

			Map<String, Object> validation = validateUsingSkill(playerID, skillIDList);
			if (!(Boolean) validation.get("success")) {
				return validation;
			}

			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			player.setUsing_Skill(skillIDs);
			characterMapper.updateStatus(player);

			result.put("success", true);
			result.put("message", "사용 스킬 설정 완료");
			result.put("usingSkillCount", skillIDList.size());
			return result;
		} catch (Exception e) {
			log.error("사용 스킬 설정 실패: " + e.getMessage());
			result.put("success", false);
			result.put("message", "사용 스킬 설정 중 오류가 발생했습니다: " + e.getMessage());
			return result;
		}
	}

	@Override
	public boolean isOwnSkill(String playerID, String skillID) {
		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null || player.getOwn_Skill() == null) {
				return false;
			}

			List<String> ownedSkills = player.getOwnSkillList();
			return ownedSkills.contains(skillID);
		} catch (Exception e) {
			log.error("스킬 보유 여부 확인 실패: " + e.getMessage());
			return false;
		}
	}

	@Override
	public Map<String, Object> validateUsingSkill(String playerID, List<String> skillIDs) {
		Map<String, Object> result = new HashMap<>();

		try {
			if (skillIDs.size() > 4) {
				result.put("success", false);
				result.put("message", "사용 스킬은 최대 4개까지만 선택가능합니다");
				return result;
			}

			// 중복 적용은 프론트 측에서 방지

			for (String skillID : skillIDs) {
				if (!isOwnSkill(playerID, skillID)) {
					result.put("success", false);
					result.put("message", "보유하지 않은 스킬 : " + skillID);
					return result;
				}
			}

			result.put("success", true);
			result.put("message", "유효한 스킬 설정입니다.");
			return result;
		} catch (Exception e) {
			log.error("스킬 검증 실패: " + e.getMessage());
			result.put("success", false);
			result.put("message", "스킬 검증 중 오류가 발생했습니다: " + e.getMessage());
			return result;
		}
	}
}
