package com.milite.service;

import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.milite.dto.PlayerDto;
import com.milite.dto.SkillDto;
import com.milite.mapper.CharacterStatusMapper;
import com.milite.mapper.SkillMapper;
import com.milite.util.CommonUtil;

import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class SkillServiceImpl implements SkillService {
	@Setter(onMethod_ = @Autowired)
	private SkillMapper mapper;

	@Setter(onMethod_ = @Autowired)
	private CharacterStatusMapper characterMapper;

	@Override
	public SkillDto getSkillInfo(Integer skillID) {
		return mapper.getSkillInfo(skillID);
	}

	@Override
	public List<SkillDto> getSkillReward(String job, String rarity, String type, String element) {
		log.info("스킬 조회 - job: " + job + ", rarity: " + rarity + ", type: " + type + ", element: " + element);
		return mapper.getSkillReward(job, rarity, type, element);
	}

	//====
	public List<SkillDto> getSkillReward(String job, String rarity) {
		return getSkillReward(job, rarity, "Battle", null);
	}

	public List<SkillDto> getSkillEvent(String job, String element) {
		return getSkillReward(job, null, "Event", element);
	}

	//====
	@Override
	public int getOwnedSkillCount(String playerID) {
		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null || player.getOwn_Skill() == null || player.getOwn_Skill().trim().isEmpty()) {
				return 0;
			}
			return player.getOwn_Skill().split(",").length;
		} catch (Exception e) {
			log.error("보유 스킬 개수 확인 실패 : " + e.getMessage());
			return 0;
		}
	}

	@Override
	public String addSkillToPlayer(String playerID, int skillID) {
		try {
			if (getOwnedSkillCount(playerID) >= 10) {
				log.warn("보유 스킬 10개");
				return "SKILL_FULL";
			}

			characterMapper.addSkillToPlayer(playerID, skillID);
			log.info("스킬 추가 완료");
			return "SKILL_ADD";
		} catch (Exception e) {
			log.error("스킬 추가 실패 : " + e.getMessage());
			return "스킬 추가 중 오류 발생" + e.getMessage();
		}
	}

	@Override
	public String replacePlayerSkill(String playerID, int oldSkillID, int newSkillID) {
		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null) {
				return "플레이어 정보 없음";
			}

			if (!hasSkill(playerID, oldSkillID)) { // 구조 상 쓸 필요 없는 코드이나 안전장치
				return "교체할 스킬을 보유하고 있지 않습니다";
			}

			SkillDto newSkill = mapper.getSkillInfo(newSkillID);
			if(newSkill == null	) {
				return "새로운 스킬 정보 없음";
			}
			
			String newOwnSkill = replaceSkillInString(player.getOwn_Skill(), oldSkillID, newSkillID);
			player.setOwn_Skill(newOwnSkill);

			if (player.getUsing_Skill() != null && !player.getUsing_Skill().trim().isEmpty()) {
				String newUsingSkill = replaceSkillInString(player.getUsing_Skill(), oldSkillID, newSkillID);
				player.setUsing_Skill(newUsingSkill);

				characterMapper.updateStatus(player);
			}

			log.info("스킬 교체 완료 - player : " + playerID);
			return "스킬 교체 성공";
		} catch (Exception e) {
			log.error("스킬 교체 실패 : " + e.getMessage());
			return "스킬 교체 중 오류 발생";
		}
	}

	//====
	private List<SkillDto> parseSkillStringToList(String skillString){
		List<SkillDto> skillList = new ArrayList<>);
		if(skillString == null || skillString.trim().isEmpty()) {
			return skillList;
		}
		
		String[] skillIDs = skillString.split(",");
	}
	
	private String convertSkillListToString(List<SkillDto> skillList) {
		if(skillList == null || skillList.isEmpty()) {
			return "";	
		}
		
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < skillList.size(); i++) {
			if(i>0) {
				sb.append(",");
			}
			sb.append(skillList.get(i).getSkill_id());
		}
		return sb.toString();
	}
	
	@Override
	public boolean hasSkill(String playerID, int skillID) {
		try {
			PlayerDto player = characterMapper.getPlayerInfo(playerID);
			if (player == null || player.getOwn_Skill() == null || player.getOwn_Skill().trim().isEmpty()) {
				return false;
			}

			String[] skillIDs = player.getOwn_Skill().split(",");
			for (String id : skillIDs) {
				if (Integer.parseInt(id.trim()) == skillID) {
					return true;
				}
			}
			return false;
		} catch (Exception e) {
			log.error("스킬 보유 확인 실패 : " + e.getMessage());
			return false;
		}
	}

	private String replaceSkillInString(String skillString, int oldSkillID, int newSkillID) {
		if (skillString == null || skillString.trim().isEmpty()) {
			return skillString;
		}

		String[] skillIDs = skillString.split(",");
		for (int i = 0; i < skillIDs.length; i++) {
			try {
				if (Integer.parseInt(skillIDs[i].trim()) == oldSkillID) {
					skillIDs[i] = String.valueOf(newSkillID);
					break;
				}
			} catch (Exception e) {
				log.warn("잘못된 스킬 ID 형식 : " + skillIDs[i]);
			}
		}
		return String.join(",", skillIDs);
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
}
