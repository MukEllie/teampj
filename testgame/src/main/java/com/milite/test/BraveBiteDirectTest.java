package com.milite.test;

import com.milite.battle.*;
import com.milite.battle.abilities.*;
import com.milite.dto.*;
import java.util.*;

public class BraveBiteDirectTest {
    
    public static void main(String[] args) {
        System.out.println("=== BraveBite 직접 테스트 시작 ===");
        
        try {
            // 1. 테스트용 플레이어 생성
            PlayerDto testPlayer = new PlayerDto();
            testPlayer.setPlayerID("TEST");
            testPlayer.setUsing_Character("테스트용");
            testPlayer.setCurr_hp(100);
            testPlayer.setMax_hp(100);
            testPlayer.setAtk(15);
            testPlayer.setLuck(5);
            
            System.out.println("✅ 테스트 플레이어 생성 완료");
            
            // 2. BraveBite 몬스터 생성 (미공수)
            MonsterDto monsterDto = new MonsterDto();
            monsterDto.setMonsterID(10);
            monsterDto.setName("미공수");
            monsterDto.setElement("Fire");
            monsterDto.setMin_hp(200);
            monsterDto.setMax_hp(200);
            monsterDto.setMin_atk(13);
            monsterDto.setMax_atk(13);
            monsterDto.setLuck(5);
            monsterDto.setSpecial("BraveBite");
            monsterDto.setDescription("테스트용 미공수");
            
            BattleMonsterUnit braveBiteMonster = new BattleMonsterUnit(monsterDto);
            System.out.println("✅ BraveBite 몬스터 생성 완료");
            System.out.println("   몬스터 이름: " + braveBiteMonster.getName());
            System.out.println("   특수능력: " + braveBiteMonster.getSpecial());
            
            // 3. 테스트 세션 생성
            ArrayList<BattleMonsterUnit> enemies = new ArrayList<>();
            enemies.add(braveBiteMonster);
            
            BattleSession testSession = new BattleSession();
            testSession.setSessionID(9999);
            testSession.setPlayer(testPlayer);
            testSession.setEnemy(enemies);
            testSession.setCurrentTurn(1);
            
            System.out.println("✅ 테스트 세션 생성 완료");
            
            // 4. BattleContext 생성
            BattleContext context = new BattleContext(testSession, 1);
            System.out.println("✅ BattleContext 생성 완료");
            
            // 5. 테스트 실행 전 상태 출력
            System.out.println("\n=== 테스트 실행 ===");
            System.out.println("테스트 전 플레이어 HP: " + testPlayer.getCurr_hp());
            System.out.println("테스트 전 몬스터 HP: " + braveBiteMonster.getHp());
            
            // 6. BraveBite 직접 테스트 (플레이어가 몬스터를 공격했다고 가정)
            System.out.println("\n플레이어가 미공수를 공격했습니다!");
            braveBiteMonster.executeOnDefensePerHit(testPlayer, 10, context);
            
            System.out.println("지연된 액션을 실행합니다...");
            context.executeDelayedActions();
            
            // 7. 테스트 결과 확인
            System.out.println("\n=== 테스트 결과 ===");
            System.out.println("테스트 후 플레이어 HP: " + testPlayer.getCurr_hp());
            System.out.println("예상 결과: 97 (100 - 3 반사피해)");
            
            // 8. 로그 확인
            System.out.println("\n=== 생성된 로그들 ===");
            List<BattleLogEntry> logs = context.getLogs();
            if (logs.isEmpty()) {
                System.out.println("❌ 로그가 생성되지 않았습니다!");
            } else {
                for (BattleLogEntry log : logs) {
                    System.out.println(log.getActionType() + ": " + log.getDetail());
                }
            }
            
            // 9. 테스트 결과 검증
            System.out.println("\n=== 최종 결과 ===");
            if (testPlayer.getCurr_hp() == 97) {
                System.out.println("🎉 BraveBite 테스트 성공!");
                System.out.println("   반사 피해가 정상적으로 작동합니다.");
            } else {
                System.out.println("❌ BraveBite 테스트 실패!");
                System.out.println("   예상 HP: 97, 실제 HP: " + testPlayer.getCurr_hp());
            }
            
        } catch (Exception e) {
            System.out.println("❌ 테스트 중 오류 발생!");
            System.out.println("오류 메시지: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("\n=== 테스트 종료 ===");
    }
}