/*package com.milite.test;

import java.util.ArrayList;
import java.util.List;

import com.milite.dto.SkillDto;

public class SkillChange {
	public List<SkillDto> skillchange(String PlayerID, int OldSkillID, int NewSkillID) {
		// 아직은 없는 메서드임. 대충 플레이어 아이디를 받아서
		List<SkillDto> UsingSkillList = serivce.getUsingSkillList(PlayerID);
		List<SkillDto> OwnSkillList = service.getOwnSkillList(PlayerID);

        SkillDto NewSkill = service.getSkillInfo(NewSkillID);
        if (NewSkill == null) {
            log.error("새 스킬을 찾을 수 없음: " + NewSkillID);
            return;
        }
        
        List<SkillDto> combinedList = new ArrayList<>();
        combinedList.addAll(UsingSkillList);  // 0~3: 사용 스킬
        combinedList.addAll(OwnSkillList);  

       boolean skillReplaced = false;
        for (int i = 0; i < combinedList.size(); i++) {
            if (combinedList.get(i).getSkill_id().equals(OldSkillID)) {
                combinedList.set(i, NewSkill);
                skillReplaced = true;
                log.info("스킬 교체: " + i + "번째 위치에서 " + OldSkillID + " → " + NewSkillID);
            }
        }
        
            if (!skillReplaced) {
            log.warn("⚠️ 교체할 스킬을 찾지 못함: " + OldSkillID);
            return;
        }
  // 5. 다시 사용 스킬과 보유 스킬로 분리
        int usingSkillSize = UsingSkillList.size();
        
        // 사용 스킬 업데이트 (0~3)
        for (int i = 0; i < usingSkillSize && i < combinedList.size(); i++) {
            UsingSkillList.set(i, combinedList.get(i));
        }
        
        // 보유 스킬 업데이트 (4~13)
        for (int i = usingSkillSize; i < combinedList.size(); i++) {
            int ownSkillIndex = i - usingSkillSize;
            if (ownSkillIndex < OwnSkillList.size()) {  // 안전 체크
                OwnSkillList.set(ownSkillIndex, combinedList.get(i));
            }
        }
        
        // 6. 데이터베이스에 업데이트
        service.updateUsingSkills(PlayerID, UsingSkillList);
        service.updateOwnedSkills(PlayerID, OwnSkillList);
        
        log.info("✅ 스킬 변경 완료 - Player: " + PlayerID);
        
    } catch (Exception e) {
        log.error("❌ 스킬 변경 중 오류: " + e.getMessage(), e);
    }
	
}*/
