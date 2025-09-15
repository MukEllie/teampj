# Event / Start / Camp – Developer Guide

> 이 문서는 프로젝트의 **Start**, **Camp**, **Event** 모듈의 동작 방식과 실제 코드(컨트롤러·서비스·매퍼·SQL)를 기반으로 정리한 상세 레퍼런스입니다. 요약하면서 임의로 코드를 바꾸지 않았으며, **현재 레포지토리의 소스**를 그대로 분석해 기술합니다.

## 레이어 개요
- **Start**: 신규/기존 사용자 상태 확인, 직업 선택.
- **Camp**: 스테이지/계층 진행 관리(다음 스테이지, 다음 계층), 스킬 관리.
- **Event**: 랜덤 이벤트(일반/주사위/함정/선택/카드/아티팩트/보스) 조회 및 적용.


## 관련 소스 경로
```text
src/main/java/com/milite/controller/StartRestController.java
src/main/java/com/milite/service/StartService.java
src/main/java/com/milite/service/StartServiceImpl.java
src/main/java/com/milite/mapper/StartMapper.java
src/main/resources/com/milite/mapper/StartMapper.xml

src/main/java/com/milite/controller/CampController.java
src/main/java/com/milite/controller/CampRestController.java
src/main/java/com/milite/service/CampService.java
src/main/java/com/milite/service/CampServiceImpl.java
src/main/java/com/milite/mapper/CharacterStatusMapper.java
src/main/resources/com/milite/mapper/CharacterStatusMapper.xml

src/main/java/com/milite/controller/EventController.java
src/main/java/com/milite/controller/EventRestController.java
src/main/java/com/milite/service/EventService.java
src/main/java/com/milite/service/EventServiceImpl.java
src/main/java/com/milite/mapper/EventMapper.java
src/main/resources/com/milite/mapper/EventMapper.xml
```

## 1) Start 모듈

- **REST 베이스 경로**: `/api/start`

### Endpoints (REST)

| Method | Path | Handler |
|---|---|---|
| GET | `/api/start/state` | `ResponseEntity<ApiResponse<StateDto>> state(@RequestParam String userId)` |
| GET | `/api/start/options` | `ResponseEntity<ApiResponse<List<CharacterDto>>> options()` |
| POST | `/api/start/choose` | `ResponseEntity<ApiResponse<String>> choose(@RequestParam String userId, @RequestParam String className)` |


### 응답 래퍼
- 모든 REST 응답은 `ApiResponse<T> { success, message, data }` 형태로 감쌉니다. (컨트롤러 내부 정적 클래스)

### 상태 조회 `/state`
- `StartService#getStartState(userId)` → 사용자 존재 여부, 세이브 존재 여부, 현재 계층(session), 현재 스테이지(stage), PlayerDto 포함.
- 컨트롤러는 이를 `StateDto`로 변환하여 반환합니다.


### 직업 선택 흐름
1) `/options` 에서 `StartMapper#getFixedClasses()` 결과(예: Warrior/Mage/Thief 3종) 반환
2) `/choose` 에서 `StartService#chooseClass(userId, className)` 호출 → `StartMapper#getClassByName` → `insertPlayerBaseStats`


### 주요 코드 스니펫
```java
// StartService.java
public interface StartService {
    StartState getStartState(String userId);
    List<CharacterDto> getFixedClassOptions();
    String chooseClass(String userId, String className);
    PlayerDto getPlayer(String userId);
    class StartState { boolean userExists; boolean hasSave; String session; Integer stage; PlayerDto player; }
}
```

## 2) Camp 모듈

- **REST 베이스 경로**: `/api/camp`
- **MVC 베이스 경로**: `/camp` (서버사이드 JSP 사용)

### Endpoints (REST)

| Method | Path | Handler |
|---|---|---|
| POST | `/api/camp/nextstage` | `ResponseEntity<Map<String, Object>> nextStage(@RequestParam("PlayerID") String PlayerID)` |
| POST | `/api/camp/nextlayer` | `ResponseEntity<Map<String, Object>> nextLayer(@RequestParam("PlayerID") String PlayerID)` |
| GET | `/api/camp/skill-management` | `ResponseEntity<Map<String, Object>> getSkillManagementData(@RequestParam("PlayerID") String PlayerID)` |
| POST | `/api/camp/skill-management/selectUsingSkill` | `ResponseEntity<Map<String, Object>> selectUsingSkill(@RequestParam("PlayerID") String PlayerID, @RequestParam String skillIDs)` |

### Endpoints (MVC)

| Method | Path | Handler |
|---|---|---|
| POST | `/camp/nextstage` | `String nextStage(@RequestParam String playerId, Model model)` |
| POST | `/camp/nextlayer` | `String nextLayer(@RequestParam String playerId, Model model)` |


### 진행 규칙
- `CampService#decideBattleOrEvent(playerId)` 에서 **다음 스테이지 진입** 시 행동을 결정합니다.
  - `WhereStage >= 10` 이면 더 이상 `nextstage` 금지 → 컨트롤러에서 리다이렉트 처리.
  - `WhereStage` 를 1 증가시켜 저장.
  - **5층, 10층** 진입은 **전투 강제**.
  - 그 외 일반 규칙: **전투 70% / 이벤트 30%** (`ThreadLocalRandom`).
- `CampService#canAdvanceLayer(playerId)` 는 (보스 격파 직후를 전제로) 단순히 `WhereStage >= 10` 로 판정.
- `CampService#advanceLayer(playerId)` 는 **계층 순환(물→불→풀)** + `WhereStage=1` 리셋 후 저장. 필요 시 `used_events` 초기화 가능.


### 스킬 관리 (REST)
- `/skill-management` : 현재 장착/보유 스킬과 슬롯 정보를 반환.
- `/skill-management/selectUsingSkill` : 선택한 스킬 ID CSV를 장착 슬롯으로 저장.


## 3) Event 모듈

- **REST 베이스 경로**: `/api/event`
- **MVC 베이스 경로**: `/event` (서버사이드 JSP 사용)

### Endpoints (REST)

| Method | Path | Handler |
|---|---|---|
| GET | `/api/event/trigger/{playerId}` | `ResponseEntity<ApiResponse<String>> trigger(@PathVariable String playerId)` |
| GET | `/api/event/trigger/non-boss/{playerId}` | `ResponseEntity<ApiResponse<String>> triggerNonBoss(@PathVariable String playerId)` |
| GET | `/api/event/normal` | `ResponseEntity<ApiResponse<NormalEventDto>> normal(@RequestParam String playerId)` |
| POST | `/api/event/normal/apply` | `ResponseEntity<ApiResponse<String>> normalApply(@RequestParam String playerId, @RequestParam int ne_id)` |
| GET | `/api/event/roll` | `ResponseEntity<ApiResponse<RollEventDto>> roll(@RequestParam String playerId)` |
| POST | `/api/event/roll/apply` | `ResponseEntity<ApiResponse<String>> rollApply(@RequestParam String playerId, @RequestParam int re_id)` |
| GET | `/api/event/trap` | `ResponseEntity<ApiResponse<TrapEventDto>> trap(@RequestParam String playerId)` |
| POST | `/api/event/trap/apply` | `ResponseEntity<ApiResponse<String>> trapApply(@RequestParam String playerId, @RequestParam int te_id)` |
| GET | `/api/event/select` | `ResponseEntity<ApiResponse<SelectEventDto>> select(@RequestParam String playerId)` |
| GET | `/api/event/select/choices` | `ResponseEntity<ApiResponse<List<SelectChoiceDto>>> selectChoices(@RequestParam int se_id)` |
| POST | `/api/event/select/apply` | `ResponseEntity<ApiResponse<String>> selectApply(@RequestParam String playerId, @RequestParam int sec_id)` |
| GET | `/api/event/card` | `ResponseEntity<ApiResponse<CardEventDto>> card(@RequestParam String playerId)` |
| GET | `/api/event/card/candidates` | `ResponseEntity<ApiResponse<List<SkillDto>>> cardCandidates(@RequestParam String playerId)` |
| POST | `/api/event/card/apply` | `ResponseEntity<ApiResponse<String>> cardApply(@RequestParam String playerId, @RequestParam int ce_id, @RequestParam int skillId)` |
| GET | `/api/event/artifact` | `ResponseEntity<ApiResponse<ArtifactEventDto>> artifact(@RequestParam String playerId)` |
| GET | `/api/event/artifact/candidates` | `ResponseEntity<ApiResponse<List<ArtifactDto>>> artifactCandidates(@RequestParam String playerId)` |
| POST | `/api/event/artifact/apply` | `ResponseEntity<ApiResponse<String>> artifactApply(@RequestParam String playerId, @RequestParam int ae_id, @RequestParam int artifactId)` |
| GET | `/api/event/boss` | `ResponseEntity<ApiResponse<BossEventDto>> boss(@RequestParam String playerId)` |
| POST | `/api/event/boss/fight` | `ResponseEntity<ApiResponse<String>> bossFight(@RequestParam String playerId, @RequestParam int be_id)` |

### Endpoints (MVC)

| Method | Path | Handler |
|---|---|---|
| GET | `/event/trigger/{playerId}` | `String trigger(@PathVariable String playerId)` |
| GET | `/event/normal` | `String showNormal(@RequestParam String playerId, Model model)` |
| POST | `/event/normal/apply` | `String applyNormal(@RequestParam String playerId, @RequestParam int ne_id, Model model)` |
| GET | `/event/roll` | `String showRoll(@RequestParam String playerId, Model model)` |
| POST | `/event/roll/apply` | `String applyRoll(@RequestParam String playerId, @RequestParam int re_id, Model model)` |
| GET | `/event/trap` | `String showTrap(@RequestParam String playerId, Model model)` |
| POST | `/event/trap/apply` | `String applyTrap(@RequestParam String playerId, @RequestParam int te_id, Model model)` |
| GET | `/event/select` | `String showSelect(@RequestParam String playerId, Model model)` |
| POST | `/event/select/apply` | `String applySelect(@RequestParam String playerId, @RequestParam int sec_id, Model model)` |
| GET | `/event/card` | `String showCard(@RequestParam String playerId, Model model)` |
| POST | `/event/card/apply` | `String applyCard(@RequestParam String playerId, @RequestParam int ce_id, @RequestParam int skillId, Model model)` |
| GET | `/event/artifact` | `String showArtifact(@RequestParam String playerId, Model model)` |
| POST | `/event/artifact/apply` | `String applyArtifact(@RequestParam String playerId, @RequestParam int ae_id, @RequestParam int artifactId, Model model)` |
| GET | `/event/boss` | `String showBoss(@RequestParam String playerId, Model model)` |
| POST | `/event/boss/fight` | `String bossFight(@RequestParam String playerId, @RequestParam int be_id, Model model)` |


### 공통 설계: `used_events`
- 이벤트 중복 노출 방지를 위해 `used_events(player_id, layer, event_type, event_id)` 테이블을 사용합니다.
- 사용 함수:
  - `EventMapper#markEventUsed(playerId, layer, type, eventId)`
  - `EventMapper#resetLayerUsed(playerId, layer)` (보스 제외 초기화)


### 랜덤 트리거
- `EventService#triggerRandomEvent(playerId)` : 모든 타입 포함.
- `EventService#triggerRandomNonBoss(playerId)` : 보스 제외. 내부에서 타입 리스트를 셔플하고 `prepare*` 가 null이 아닌 첫 타입으로 포워딩합니다.


### 타입별 동작 요약
- **Normal**: `pickOneUnusedNormal(session)` → 적용 시 플레이어/몬스터 스탯/골드/럭 등이 변동.
- **Roll**: `pickOneUnusedRoll(session)` + `re_dicelimit` 를 고려한 주사위 규칙.
- **Trap**: `pickOneUnusedTrap(session)`.
- **Select**: `pickOneUnusedSelect(session)` + `selectChoices(se_id)` 로 버튼 문구/효과 조회.
- **Card**:
  - 인트로: `pickOneUnusedCard(session)`
  - 후보: `getEventSkillsFromDB(playerId, limit=3)` → `SkillDB`에서 **직업(Using_Character)**, **원소(WhereSession)** 기준, **이미 보유(Own_Skill)에 없는** 카드만 랜덤 3개.
  - 적용: `markEventUsed(..., 'card', ce_id)` + `CharacterStatusMapper.addSkillToPlayer(playerId, skillId)`
- **Artifact**:
  - 인트로: `pickOneUnusedArtifactEvent(layer=session)`
  - 후보: `getArtifactsBySession(session, job, limit=3)` → `ArtifactDB`에서 **직업(Using_Character)**, **세션(WhereSession)** 기준 랜덤 3개.
  - 적용: `markEventUsed(..., 'artifact', ae_id)` + `CharacterStatusMapper.addArtifactToPlayer(playerId, artifactId)`
- **Boss**:
  - 인트로: `pickOneUnusedBoss(session)`
  - 적용: `markEventUsed(..., 'boss', be_id)` 후 전투 진입(`/battle/event` 등으로 forward)


### DTO 스키마 (일부)
```java
// NormalEventDto
int ne_id; String ne_name; String ne_session; int ne_dice; int ne_php; int ne_mhp; int ne_patk; int ne_matk; int ne_gold; int ne_luck;
// RollEventDto
int re_id; String re_name; String re_session; int re_dice; int re_dicelimit; int re_php; int re_pmaxhp; int re_mhp; int re_mmaxhp; int re_patk; int re_matk; int re_gold; int re_luck;
// TrapEventDto
int te_id; String te_name; String te_session; int te_dice; int te_dicelimit; int te_php; int te_maxhp; int te_patk; int te_luck;
// SelectEventDto, SelectChoiceDto(sec_text, sec_php/…)
// CardEventDto(ce_id, ce_name, ce_session, ce_dmg)
// ArtifactEventDto(ae_id, ae_name, ae_session)
// ArtifactDto(artifactId, artifactName, artifactJob, artifactSession, artifactEffect, artifactText)
// BossEventDto(be_id, be_name, be_session, MonsterID)
```

### 예시: 카드 후보 조회 (REST)
```http
GET 
/api/event/card/candidates?playerId=PLAYER123

Response: {
  "success": true,
  "message": "카드 후보 조회 완료",
  "data": [
    { "skill_id": 101, "skill_name": "Fire Slash", "skill_job": "Warrior", "element": "Fire", "rarity": "R", "min_damage": 10, "max_damage": 20, "skill_text": "..." },
    { "skill_id": 205, "skill_name": "Water Bolt", "skill_job": "Mage",    "element": "Water", "rarity": "SR", "min_damage": 18, "max_damage": 28, "skill_text": "..." },
    { "skill_id": 309, "skill_name": "Grass Sting", "skill_job": "Thief",   "element": "Grass", "rarity": "R", "min_damage": 7,  "max_damage": 16, "skill_text": "..." }
  ]
}
```

### 예시: 아티팩트 후보 조회 (REST)
```http
GET 
/api/event/artifact/candidates?playerId=PLAYER123

Response: {
  "success": true,
  "message": "후보 조회 완료",
  "data": [
    { "artifactId": 11, "artifactName": "Phoenix Feather", "artifactJob": "Common", "artifactSession": "None", "artifactEffect": "+1 Revive", "artifactText": "..." },
    { "artifactId": 42, "artifactName": "Blazing Gauntlet", "artifactJob": "Warrior", "artifactSession": "Fire", "artifactEffect": "+ATK on Fire", "artifactText": "..." },
    { "artifactId": 77, "artifactName": "Aqua Charm", "artifactJob": "Mage", "artifactSession": "Water", "artifactEffect": "+HP on Water", "artifactText": "..." }
  ]
}
```

### SQL 하이라이트
```sql
-- 카드 후보 3장 (SkillDB)
<select id="getEventSkillsFromDB">
  SELECT s.skill_id, s.skill_name, s.skill_job, s.element, s.rarity, s.skill_type, ...
  FROM skills s
  JOIN PlayerDB p ON p.Player_ID = #{playerId}
  WHERE (p.Own_Skill IS NULL OR p.Own_Skill = '' OR FIND_IN_SET(s.skill_id, p.Own_Skill) = 0)
    AND LOWER(s.skill_type) = 'event'
    AND (LOWER(s.skill_job) = 'common' OR LOWER(s.skill_job) = LOWER(p.Using_Character))
    AND (LOWER(s.element)   = 'none'   OR LOWER(s.element)   = LOWER(p.WhereSession))
  ORDER BY RAND()
  LIMIT #{limit}
</select>

-- 아티팩트 후보 3개 (ArtifactDB)
<select id="getArtifactsBySession">
  SELECT a.ID AS artifactId, a.Name AS artifactName, a.Job AS artifactJob, a.Session AS artifactSession,
         a.Effect AS artifactEffect, a.Description AS artifactText
  FROM ArtifactDB a
  WHERE (LOWER(a.Session)='none' OR LOWER(a.Session)=LOWER(#{session}))
    AND (LOWER(a.Job)='common' OR LOWER(a.Job)=LOWER(#{job}))
  ORDER BY RAND()
  LIMIT #{limit}
</select>
```

## 4) 데이터 모델 (요약)
- **PlayerDB**: `Player_ID`, `Using_Character`, `curr_hp`, `max_hp`, `atk`, `luck`, `WhereSession`, `WhereStage`, `Using_Skill`, `Own_Skill`, `Own_Artifact` …
- **used_events**: `player_id`, `layer`, `event_type`(`normal|roll|trap|select|card|artifact|boss`), `event_id`, `used_at` …
- **ArtifactDB / skills / *event 테이블**: 각 DTO에 매핑되는 컬럼을 보유.


## 5) 흐름 예시
### 캠프에서 '다음 스테이지 진행'
1. `POST 
/camp/nextstage` 또는 `POST /api/camp/nextstage`

2. `CampService#decideBattleOrEvent` → (5/10층 전투 강제) 또는 (70/30 규칙으로 전투/이벤트)
3. 전투면 `forward:/battle/start` 등으로 연결, 이벤트면 `EventService#triggerRandomNonBoss` → 해당 JSP 또는 REST로 라우팅


### 카드 이벤트
1. `GET 
/api/event/card` (인트로) → `pickOneUnusedCard`

2. `GET 
/api/event/card/candidates` → `getEventSkillsFromDB(playerId, 3)`

3. `POST 
/api/event/card/apply` → `markEventUsed(...,'card')` + `addSkillToPlayer`


---
**주의**
- REST와 MVC가 **동시에 제공**되므로, 프론트엔드는 `/api/...` 를, 서버사이드 JSP는 `/{event|camp}...` 를 사용합니다.
