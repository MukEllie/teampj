# 🛡️ Battle API Documentation

게임의 배틀 시스템 관련 API 엔드포인트 문서입니다.

---

## 📋 목차
- [1. 전투 시작](#1-전투-시작)
- [2. 전투 진행](#2-전투-진행)
- [3. 전투 종료 및 보상](#3-전투-종료-및-보상)
- [4. 공통 데이터 구조](#4-공통-데이터-구조)

---

## 🔄 전투 시스템 전체 플로우

```
📍 전투 시작
POST /battle/start (일반 전투) 또는 POST /battle/event (이벤트 전투)
    ↓
📍 전투 진행 (반복)
POST /battle/battle (플레이어 스킬 사용)
    ↓
📍 전투 종료
POST /battle/end (보상 목록 생성)
    ↓
📍 보상 획득 (순차적)
POST /battle/claim/skill → POST /battle/claim/artifact → POST /battle/claim/heal → POST /battle/claim/gold
    ↓
📍 다음 단계
POST /battle/claim/proceed (캠프 이동)
```

---

## 1. 전투 시작

### 1.1 일반 전투 시작

#### `POST /battle/start`

플레이어의 현재 스테이지에 맞는 몬스터를 생성하고 일반 전투를 시작합니다.

**📥 요청**:
```
PlayerID (String, required): 플레이어의 고유 식별자
```

**📤 성공 응답 (200 OK)**:
```json
{
  "stage": "battleReady",
  "message": "전투가 시작되었습니다. 스킬을 선택해주세요",
  "battleStatus": {
    "needsPlayerInput": true,
    "currentUnit": "Player",
    "playerHp": 45,
    "playerMaxHp": 50,
    "currentTurn": 1,
    "aliveMonsters": [
      {
        "id": 1,
        "name": "고블린",
        "hp": 25,
        "maxHp": 25,
        "attack": 8,
        "defense": 3,
        "initiative": 5,
        "element": "NORMAL",
        "statusEffects": {},
        "alive": true
      }
    ],
    "actionOrder": ["Player", "고블린"],
    "currentActionIndex": 0
  }
}
```

---

### 1.2 이벤트 전투 시작

#### `POST /battle/event`

혼령의 인도인과의 특별 전투를 시작합니다. 동적 소환 시스템과 특별 승리 조건이 적용됩니다.

**📥 요청**:
```
PlayerID (String, required): 플레이어의 고유 식별자
```

**📤 성공 응답 (200 OK)**:
```json
{
  "stage": "battleReady",
  "message": "혼령의 인도인과의 전투가 시작되었습니다. 스킬을 선택해주세요",
  "battleStatus": {
    "needsPlayerInput": true,
    "currentUnit": "Player",
    "playerHp": 45,
    "playerMaxHp": 50,
    "currentTurn": 1,
    "aliveMonsters": [
      {
        "id": 51,
        "name": "혼령의 인도인",
        "hp": 80,
        "maxHp": 80,
        "attack": 15,
        "defense": 8,
        "initiative": 12,
        "element": "DARK",
        "statusEffects": {},
        "alive": true,
        "specialAbilities": ["SummonAbility"]
      }
    ],
    "actionOrder": ["혼령의 인도인", "Player"],
    "currentActionIndex": 0
  }
}
```

**🎭 이벤트 전투 특징**:
- **소환 시스템**: 25% 확률로 사로잡힌 혼 소환 (최대 2마리)
- **특별 승리 조건**: 혼령의 인도인만 처치하면 즉시 승리
- **확정 보상**: 그림자 생성장치 아티팩트 100% 드롭

---

## 2. 전투 진행

### `POST /battle/battle`

플레이어의 스킬 사용을 통해 실제 전투를 진행합니다. 모든 전투 로직이 이 엔드포인트에서 처리됩니다.

**📥 요청**:
```
PlayerID (String, required): 플레이어의 고유 식별자
SkillID (String, required): 사용할 스킬의 ID
targetIndex (Integer, optional): 타겟 몬스터의 인덱스 (단일 타겟 스킬용, 랜덤 및 광역 공격은 자동으로 처리)
```

**📤 전투 진행 중 (200 OK)**:
```json
{
  "stage": "battleContinue",
  "message": "전투가 계속됩니다",
  "battleResult": {
    "message": "플레이어 공격 완료",
    "damage": 15,
    "newHp": 10,
    "hit": true,
    "defeated": false,
    "battleLog": [
      {
        "actor": "플레이어",
        "action": "attack",
        "message": "화염구를 시전하여 고블린에게 15의 피해를 입혔습니다",
        "turnNumber": 1
      },
      {
        "actor": "고블린",
        "action": "attack",
        "message": "고블린이 플레이어를 공격하여 8의 피해를 입혔습니다",
        "turnNumber": 1
      }
    ]
  },
  "battleStatus": {
    "needsPlayerInput": true,
    "currentUnit": "Player",
    "playerHp": 37,
    "currentTurn": 2,
    "aliveMonsters": [/* 업데이트된 몬스터 상태 */]
  }
}
```

**📤 전투 승리 (200 OK)**:
```json
{
  "stage": "battleWon",
  "message": "전투에서 승리했습니다!",
  "battleResult": {
    "message": "모든 적을 물리쳤습니다",
    "damage": 18,
    "newHp": 0,
    "hit": true,
    "defeated": true,
    "battleLog": [/* 승리 로그 */]
  },
  "battleStatus": {
    "needsPlayerInput": false,
    "currentUnit": "None",
    "aliveMonsters": []
  }
}
```

**📤 전투 패배 (200 OK)**:
```json
{
  "stage": "battleLost",
  "message": "전투에서 패배했습니다...",
  "battleResult": {
    "message": "플레이어가 쓰러졌습니다",
    "defeated": true,
    "battleLog": [/* 패배 로그 */]
  },
  "battleStatus": {
    "needsPlayerInput": false,
    "playerHp": 0
  }
}
```

**💡 타겟 인덱스 사용법**:
- **단일 타겟**: `targetIndex` 필수 (0부터 시작)
- **전체 타겟**: `targetIndex` 무시됨
- **자가 타겟**: `targetIndex` 무시됨

---

## 3. 전투 종료 및 보상

### 3.1 보상 생성

#### `POST /battle/end`

전투 종료 후 승리/패배를 판정하고, 승리 시 보상 목록을 생성합니다. **보상 화면 구성의 핵심 API**입니다.

**📥 요청**:
```
PlayerID (String, required): 플레이어의 고유 식별자
```

**📤 승리 시 응답 (200 OK)**:
```json
{
  "battleResult": "Victory",
  "message": "전투에서 승리했습니다!",
  "playerHp": 35,
  "rewards": {
    "type": "SKILL_ARTIFACT",
    "message": "보상을 획득하세요",
    "skillChoices": [
      {
        "skillID": 1005,
        "name": "화염구",
        "description": "적에게 화염 피해를 입힙니다",
        "damage": "8~12",
        "element": "FIRE",
        "rarity": "N"
      },
      {
        "skillID": 1012,
        "name": "얼음 창",
        "description": "적을 관통하는 얼음 창을 날립니다",
        "damage": "10~14",
        "element": "WATER",
        "rarity": "R"
      },
      {
        "skillID": 1008,
        "name": "치유의 빛",
        "description": "자신의 체력을 회복합니다",
        "damage": "0~0",
        "element": "NONE",
        "rarity": "N"
      }
    ],
    "skillChoicesCount": 3,
    "artifact": {
      "ArtifactID": 105,
      "name": "원소 돌",
      "description": "원소 공격의 위력을 증가시킵니다",
      "effect": "속성 상성 보너스 +20%"
    },
    "healAvailable": true,
    "healDescription": "최대 체력의 10% 회복",
    "gold": 100,
    "goldAvailable": true,
    "totalRewardType": 4,
    "rewardSummary": "스킬 선택 (3개 중 1개) + 아티팩트 획득 + 체력 회복 + 100 골드"
  }
}
```

**📤 패배 시 응답 (200 OK)**:
```json
{
  "battleResult": "Defeat",
  "message": "전투에서 패배했습니다...",
  "playerHp": 0,
  "rewards": {
    "message": "패배하였습니다.",
    "nextStep": "gameOver"
  }
}
```

---

### 3.2 보상 획득 (순차 처리)

#### `POST /battle/claim/skill`

스킬 선택지 중 하나를 선택하여 획득합니다.

**📥 요청**:
```
PlayerID (String, required)
selectedSkillID (int, required): 선택한 스킬 ID
```

**📤 성공 응답**:
```json
{
  "stage": "skillAdded",
  "success": true,
  "message": "스킬을 획득하였습니다",
  "skillReceived": {/* 획득한 스킬 정보 */}
}
```

**📤 슬롯 가득 참**:
```json
{
  "stage": "skillReplaceRequired",
  "success": false,
  "message": "보유 스킬이 10개입니다. 교체할 스킬을 선택해주세요",
  "selectedSkill": {/* 새 스킬 정보 */},
  "currentSkills": [/* 현재 10개 스킬 목록 */],
  "needsReplacement": true
}
```

#### `POST /battle/replace/skill`

스킬 슬롯이 가득 찬 경우 기존 스킬과 교체합니다.

**📥 요청**:
```
PlayerID (String, required)
newSkillID (int, required): 새 스킬 ID
oldSkillID (int, required): 교체할 기존 스킬 ID
```

#### `POST /battle/claim/artifact`

아티팩트 보상을 획득합니다. (30% 확률 드롭)

#### `POST /battle/claim/heal`

최대 체력의 10%를 회복합니다.

#### `POST /battle/claim/gold`

전투에서 획득한 골드를 수령합니다.

---

### 3.3 다음 단계 이동

#### `POST /battle/claim/proceed`

모든 보상 처리 후 캠프로 이동하며 전투 세션을 종료합니다.

**📤 응답**:
```json
{
  "stage": "battlePhaseCompleted",
  "action": "proceedToCamp",
  "success": true,
  "message": "캠프로 이동합니다",
  "camfInfo": {
    "nextStageEndpoint": "/api/camp/nextstage",
    "method": "POST"
  },
  "nextStep": "camp",
  "battlePhase": "ended"
}
```

---

## 4. 공통 데이터 구조

### 4.1 battleStatus 객체

모든 전투 API에서 공통으로 사용되는 전투 상태 정보입니다.

```json
{
  "needsPlayerInput": true,           // 플레이어 입력 대기 중인가?
  "currentUnit": "Player",            // 현재 행동할 유닛명
  "playerHp": 45,                     // 플레이어 현재 체력
  "playerMaxHp": 50,                  // 플레이어 최대 체력
  "currentTurn": 1,                   // 현재 턴 번호
  "aliveMonsters": [...],             // 생존 몬스터 배열
  "actionOrder": ["Player", "고블린"], // 행동 순서
  "currentActionIndex": 0             // 현재 행동 인덱스
}
```

### 4.2 몬스터 객체 구조

```json
{
  "id": 1,                    // 몬스터 ID
  "name": "고블린",           // 몬스터 이름
  "hp": 25,                   // 현재 체력
  "maxHp": 25,               // 최대 체력
  "attack": 8,               // 공격력
  "defense": 3,              // 방어력
  "initiative": 5,           // 이니셔티브 (행동 순서)
  "element": "NORMAL",       // 속성 (FIRE, WATER, GRASS, NORMAL 등)
  "statusEffects": {},       // 상태이상 맵 (상태명: 남은턴수)
  "alive": true              // 생존 여부
}
```

### 4.3 battleLog 항목 구조

```json
{
  "actor": "플레이어",               // 행동 주체
  "action": "attack",               // 행동 타입 (attack, skill, status 등)
  "message": "상세 메시지",          // 사용자에게 표시할 메시지
  "turnNumber": 1                   // 턴 번호
}
```

### 4.4 스킬 정보 구조

```json
{
  "skillID": 1005,                    // 스킬 고유 ID
  "name": "화염구",                   // 스킬 이름
  "description": "적에게 화염 피해를 입힙니다", // 스킬 설명
  "damage": "8~12",                   // 피해량 범위
  "element": "FIRE",                  // 속성 (FIRE, WATER, GRASS, NONE)
  "rarity": "N",                      // 등급 (N, R, SR)
  "type": "ATTACK",                   // 타입 (ATTACK, HEAL, BUFF 등)
  "target": "SINGLE"                  // 타겟 (SINGLE, ALL, SELF)
}
```

---

## 🚨 중요 사항

### **전투 순서**
1. **시작**: `/battle/start` 또는 `/battle/event`
2. **진행**: `/battle/battle` (반복)
3. **종료**: `/battle/end`
4. **보상**: `/battle/claim/*` (순차적)
5. **이동**: `/battle/claim/proceed`

### **에러 처리**
- 모든 API에서 400 Bad Request 시 `error` 필드에 상세 메시지 포함
- 전투 세션 없음, 잘못된 턴, 유효하지 않은 스킬 등

### **상태 확인**
- `needsPlayerInput`: 플레이어 입력 필요 여부
- `stage`: 현재 전투 단계 (`battleReady`, `battleContinue`, `battleWon`, `battleLost`)
- `currentUnit`: 현재 행동할 유닛

### **특수 시스템**
- **상태이상**: 화상, 중독, 빙결, 기절, 실명
- **특수능력**: 몬스터별 고유 능력 (반사, 회복, 소환 등)
- **아티팩트**: 플레이어 장비 효과 자동 적용
- **속성 상성**: 불 > 풀 > 물 > 불 (1.5배 데미지)

---

*최종 업데이트: 전투 플로우에 맞춘 구조 개편 완료*