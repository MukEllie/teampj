# 🎯 README_Event_Start_Camp

> 이 문서는 **Start / Camp / Event** 모듈의 연동 방법을 기능별로 상세히 설명합니다. 불필요한 설명을 배제하고, 실제로 제공되는 엔드포인트와 연동 절차만 기술합니다.


## 목차

1. [시스템 플로우](#시스템-플로우)
2. [Start 연동](#start-연동)
3. [Camp 연동](#camp-연동)
4. [Event 연동](#event-연동)
5. [데이터 모델 요약](#데이터-모델-요약)


## 시스템 플로우

```
Start → Camp → (Battle | Event)
           └→ Event → (Normal/Roll/Trap/Select/Card/Artifact/Boss)
보상 적용 후 Camp로 복귀
```


## Start 연동

### Endpoints

| Method | Path |
|---|---|
| GET | `/api/start/state` |
| GET | `/api/start/options` |
| POST | `/api/start/choose` |

### 절차
1) **상태 조회** – `GET /api/start/state?userId={id}`  
   - 유저 존재/세이브 여부, 현재 세션/스테이지/PlayerDto 확인  
   - `hasSave=false` → 직업 선택 화면, `hasSave=true` → Camp로 이동  
2) **직업 후보 조회** – `GET /api/start/options`  
3) **직업 선택 저장** – `POST /api/start/choose` (form: `userId`, `className`)


### 요청/응답 예
```http
GET /api/start/state?userId=PLAYER123
→ 200 OK
{ "success": true, "data": { "hasSave": false, "session": "Water", "stage": 1 } }
```
```http
GET /api/start/options
→ 200 OK
{ "success": true, "data": [ { "name": "Warrior" }, { "name": "Mage" }, { "name": "Thief" } ] }
```
```http
POST /api/start/choose
Content-Type: application/x-www-form-urlencoded

userId=PLAYER123&className=Warrior
→ 200 OK
{ "success": true, "message": "직업이 설정되었습니다." }
```


## Camp 연동

### MVC Endpoints (서버사이드)

| Method | Path |
|---|---|
| POST | `/camp/nextstage` |
| POST | `/camp/nextlayer` |

### REST Endpoints (SPA)

| Method | Path |
|---|---|
| POST | `/api/camp/nextstage` |
| POST | `/api/camp/nextlayer` |
| GET | `/api/camp/skill-management` |
| POST | `/api/camp/skill-management/selectUsingSkill` |

### 진행 (다음 스테이지 / 다음 계층)
**A. 다음 스테이지**  
- `POST /api/camp/nextstage` *(또는 `/camp/nextstage`)*  
- 규칙: `WhereStage` + 1 → 5/10층은 전투 강제, 그 외 전투 70%/이벤트 30%  
- 응답: `{ "next": "battle" | "event", "stage": <int> }`  
- 분기:
  - `battle` → `POST /battle/start`  
  - `event` → `GET /api/event/trigger/non-boss/{playerId}`

**B. 다음 계층**  
- `POST /api/camp/nextlayer` *(또는 `/camp/nextlayer`)*  
- 규칙: 세션 순환(물→불→풀), `WhereStage=1` 리셋


### 스킬 관리
**조회** – `GET /api/camp/skill-management?PlayerID={id}`  
**장착 저장** – `POST /api/camp/skill-management/selectUsingSkill` (form: `PlayerID`, `skillIDs` CSV)


## Event 연동

### MVC Endpoints (서버사이드, 테스트용)

| Method | Path |
|---|---|
| GET | `/event/trigger/{playerId}` |
| GET | `/event/normal` |
| POST | `/event/normal/apply` |
| GET | `/event/roll` |
| POST | `/event/roll/apply` |
| GET | `/event/trap` |
| POST | `/event/trap/apply` |
| GET | `/event/select` |
| POST | `/event/select/apply` |
| GET | `/event/card` |
| POST | `/event/card/apply` |
| GET | `/event/artifact` |
| POST | `/event/artifact/apply` |
| GET | `/event/boss` |
| POST | `/event/boss/fight` |

### REST Endpoints (SPA)

| Method | Path |
|---|---|
| GET | `/api/event/trigger/{playerId}` |
| GET | `/api/event/normal` |
| POST | `/api/event/normal/apply` |
| GET | `/api/event/roll` |
| POST | `/api/event/roll/apply` |
| GET | `/api/event/trap` |
| POST | `/api/event/trap/apply` |
| GET | `/api/event/select` |
| GET | `/api/event/select/choices` |
| POST | `/api/event/select/apply` |
| GET | `/api/event/card` |
| GET | `/api/event/card/candidates` |
| POST | `/api/event/card/apply` |
| GET | `/api/event/artifact` |
| GET | `/api/event/artifact/candidates` |
| POST | `/api/event/artifact/apply` |
| GET | `/api/event/boss` |
| POST | `/api/event/boss/fight` |

### 랜덤 트리거

- **이벤트 트리거 랜덤**: `/api/event/trigger/{playerId}`


### Card (스킬 보상)
- 인트로: `/api/event/card`
- 적용: `/api/event/card/apply`
- 후보 조회: `GET /api/event/card/candidates?playerId={id}` → 직업/속성/미보유 필터 후 랜덤 3개


### Artifact (아티팩트 보상)
- 인트로: `/api/event/artifact`
- 적용: `/api/event/artifact/apply`
- 후보 조회: `GET /api/event/artifact/candidates?playerId={id}` → 세션/직업(Common 포함) 기준 랜덤 3개


### Select (선택지)
- 인트로: `/api/event/select`
- 적용: `/api/event/select/apply`
- 선택지: `GET /api/event/select/choices?se_id={id}`


### Normal
- 인트로: `/api/event/normal`
- 적용: `/api/event/normal/apply`


### Roll
- 인트로: `/api/event/roll`
- 적용: `/api/event/roll/apply`


### Trap
- 인트로: `/api/event/trap`
- 적용: `/api/event/trap/apply`


### Boss
- 인트로: `/api/event/boss`
- 전투 진입은 `/battle/start` 등으로 연결


## 데이터 모델 요약


- **PlayerDB**: `Player_ID`, `Using_Character`, `curr_hp`, `max_hp`, `atk`, `luck`, `WhereSession`, `WhereStage`, `Using_Skill`, `Own_Skill`, `Own_Artifact`, `EventAtk`, `EventCurrHp`, `EventMaxHp` …  
- **used_events**: `(player_id, layer, event_type, event_id)` → 중복 노출 방지  
- **ArtifactDB / skills / *event 테이블**: 각 DTO 매퍼에 매핑
