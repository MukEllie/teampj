/*package com.milite.test;

import java.util.ArrayList;
import java.util.List;

import com.milite.dto.SkillDto;

public class SkillChange {
	public List<SkillDto> skillchange(String PlayerID, int OldSkillID, int NewSkillID) {
		// 아직은 없는 메서드임. 대충 플레이어 아이디를 받아서
		List<SkillDto> list = new ArrayList<>();
		List<SkillDto> UsingSkillList = serivce.getUsingSkillList(PlayerID);
		List<SkillDto> OwnSkillList = service.getOwnSkillList(PlayerID);

		list.addAll(UsingSkillList);
		list.addAll(OwnSkillList);

		SkillDto NewSkill = service.getSkillInfo(NewSkillID);
		SkillDto OldSkill = service.getSkillInfo(OldSkillID);

		for (int i = 0; i < list.size(); i++) {
			if (list.get(i).getSkill_id() == OldSkillID) {
				list.set(i, NewSkill);
			}
		}

		for (int i = 0; i <= 3; i++) {
			UsingSkillList.set(i, list.get(i));
		}
		
		for (int i = 4; i <=13; i++) {
			OwnSkillList.set(i, list.get(i));
		}
		
		return list;
	}
}*/
