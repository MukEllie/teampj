# 🎯 README_Event_Start_Camp

> `testgame`의 **Start / Camp / Event** 모듈을 설명합니다.

---

## 목차
- 시스템 개요
- Start
- Camp
- Event (타입별 연동 가이드)
  - Normal
  - Roll
  - Trap
  - Select
  - Card
  - Artifact
  - Boss
- 공통 규칙(중복 방지, 세션/스테이지, 오류 처리)
- 프론트엔드 연동 팁(React 예시)

---

## 시스템 개요

```
Start → Camp → (Battle | Event)
           └→ Event → (Normal / Roll / Trap / Select / Card / Artifact / Boss)
보상/효과 적용 후 Camp로 복귀
```

- **Start**: 유저 시작 상태 확인, 직업 선택(고정 3종).
- **Camp**: 진행(스테이지/계층), 전투/이벤트 분기, 스킬 관리.
- **Event**: 6종 일반 이벤트 + Boss. 각 타입은 **인트로(조회) → 적용(POST)** 2단계.
- **Battle**: Boss에서 **전투 시작 신호**를 받은 뒤 **/battle/event**로 제어 이관.

---

## Start

### 목적
- 신규/기존 유저의 상태를 확인하고, 직업을 선택해 초기 스탯을 저장.

### 엔드포인트
- `GET /api/start/state?userId=...`
- `GET /api/start/options`
- `POST /api/start/choose` (`userId`, `className`)

### 요청/응답 계약(요지)
- `state`: 유저 존재 여부, 현재 `WhereSession/WhereStage` 등 요약 상태.
- `options`: Warrior / Mage / Thief 3종 반환.
- `choose`: 선택 저장 성공 여부 메시지.

### 클라이언트 흐름(요약)
1) 앱 시작 시 `state`로 분기 → 2) `options` 표시 → 3) `choose` POST → 4) Camp 화면 진입.

---

## Camp

### 목적
- 스테이지/계층 진행과 전투/이벤트 분기, 스킬 관리.

### 엔드포인트
- 진행: `POST /api/camp/nextstage`, `POST /api/camp/nextlayer`
- 스킬: `GET /api/camp/skill-management?PlayerID=...`, `POST /api/camp/skill-management/selectUsingSkill`

### 규칙
- **5/10층은 전투 강제**. 그 외: **전투 70% / 이벤트 30%**.
- `WhereStage ≥ 10`: `nextstage` 금지, `nextlayer`만 가능.
- `nextlayer`: 세션 순환(물→불→풀), `WhereStage=1` 초기화.

### 클라이언트 흐름
1) `nextstage` 호출 → 전투/이벤트 결과에 따라 페이지 전환  
2) 이벤트면 Event 모듈 엔드포인트로 이동 → 적용 완료 후 Camp로 복귀

---

## Event — 타입별 연동 가이드

> 모든 타입은 공통적으로 **인트로 GET**으로 화면에 보여줄 내용을 받고, **적용 POST**로 실제 반영을 합니다.  
> 적용 시 **used_events**(중복 방지) 기록이 함께 처리됩니다.

### 1) Normal

**엔드포인트**
- 인트로: `GET /api/event/normal?playerId=...`
- 적용:   `POST /api/event/normal/apply` (폼: `playerId`, `ne_id`)

**계약**
- 인트로 응답: `ne_id`, `ne_name`, `ne_session`, 수치 필드(HP/ATK/LUCK/GOLD 등) 미리보기용 첨부
- 적용 결과: 성공 메시지

**백엔드 처리 요약**
1) 현재 세션에서 **미사용 normal 이벤트** 1건 조회  
2) 적용 시 플레이어 상태에 **수치 델타** 반영(예: `php`, `patk`, `gold`, `luck` …)  
3) `(player, layer, 'normal', ne_id)`로 사용 이력 기록

**클라이언트 흐름**
1) 인트로 GET → 2) 내용 표시(설명/수치) → 3) 적용 POST → 4) 상태 재조회 or Camp 복귀

**엣지/오류**
- 후보 없음 → 다른 타입 시도 또는 Camp 복귀 안내

---

### 2) Roll

**엔드포인트**
- 인트로: `GET /api/event/roll?playerId=...`
- 적용:   `POST /api/event/roll/apply` (폼: `playerId`, `re_id`)

**계약**
- 인트로 응답: `re_id`, 이름/세션, `re_dice`(면체), `re_dicelimit`(성공 기준)
- 적용 결과: 성공 메시지

**백엔드 처리 요약**
1) **미사용 roll** 1건 조회  
2) 주사위 굴림(`re_dice`) → 성공 기준(`re_dicelimit`) 비교 → 성공/실패 분기 수치 적용  
3) 사용 이력 `(player, layer, 'roll', re_id)` 기록

**클라이언트 흐름**
1) 인트로 GET → 2) 주사위 UI 표시 → 3) 결과 연출 후 apply POST → 4) 상태 갱신

**엣지/오류**
- 굴림 로직은 서버에서 최종 판정(클라이언트 값 불신 원칙)

---

### 3) Trap

**엔드포인트**
- 인트로: `GET /api/event/trap?playerId=...`
- 적용:   `POST /api/event/trap/apply` (폼: `playerId`, `te_id`)

**계약**
- 인트로 응답: `te_id`, 이름/세션, 주사위/성공 기준(`te_dice`, `te_dicelimit`) 및 페널티 미리보기
- 적용 결과: 성공 메시지

**백엔드 처리 요약**
1) **미사용 trap** 1건 조회  
2) 주사위/성공 기준 적용 → 페널티 수치 반영(`php`, `maxhp`, `patk`, `luck` 등)  
3) 사용 이력 `(player, layer, 'trap', te_id)` 기록

**클라이언트 흐름**
1) 인트로 GET → 2) 경고/설명 표시 → 3) apply POST → 4) 결과 토스트/상태 갱신

---

### 4) Select

**엔드포인트**
- 인트로:  `GET /api/event/select?playerId=...`  
- 선택지:  `GET /api/event/select/choices?se_id=...`  
- 적용:    `POST /api/event/select/apply` (폼: `playerId`, `sec_id`)

**계약**
- 인트로 응답: `se_id`, `se_name`, `se_session`  
- 선택지 응답: `sec_id`, `sec_opt`, 각 수치(`sec_php`, `sec_pmaxhp`, `sec_patk`, `sec_gold`, `sec_luck`, `sec_text` 등)  
- 적용 결과: 성공 메시지

**백엔드 처리 요약**
1) **미사용 select** 1건 조회  
2) `choices`로 해당 `se_id`의 선택지 로드  
3) 선택한 `sec_id`의 수치를 플레이어 상태에 반영  
4) 사용 이력 `(player, layer, 'select', se_id)` 기록

**클라이언트 흐름**
1) 인트로 GET → 2) 선택지 GET → 3) 카드형 UI로 2~3개 선택지 표시 → 4) apply POST → 5) 결과 토스트/상태 갱신

**엣지/오류**
- 잘못된 `sec_id` → 400/메시지 반환

---

### 5) Card

**엔드포인트**
- 인트로:   `GET /api/event/card?playerId=...`  
- 후보 조회: `GET /api/event/card/candidates?playerId=...`  
- 적용:     `POST /api/event/card/apply` (폼: `playerId`, `ce_id`, `skillId`)

**후보 선정 규칙(요지)**
- `skills`에서 **skill_type='event'** 이며, **플레이어 직업/세션에 부합**하고, **미보유**(Own_Skill 제외) 항목 중 **최대 3개**

**백엔드 처리 요약**
1) **미사용 card 인트로** 1건 조회(`ce_id`)  
2) 후보 3개 산출(위 규칙) → 표시  
3) 선택한 스킬을 보유 목록에 추가, 사용 이력 `(player, layer, 'card', ce_id)` 기록

**클라이언트 흐름**
1) 인트로 GET → 2) 후보 GET → 3) 카드 3개 렌더 → 4) apply POST → 5) 상태 갱신

---

### 6) Artifact

**엔드포인트**
- 인트로:   `GET /api/event/artifact?playerId=...`  
- 후보 조회: `GET /api/event/artifact/candidates?playerId=...`  
- 적용:     `POST /api/event/artifact/apply` (폼: `playerId`, `ae_id`, `artifactId`)

**후보 선정 규칙(요지)**
- `ArtifactDB`에서 **플레이어 직업 + Common**, **현재 세션 부합**, **미보유 제외** → **최대 3개**

**백엔드 처리 요약**
1) **미사용 artifact 인트로** 1건 조회(`ae_id`)  
2) 규칙에 따라 후보 3개 산출 → 표시  
3) 선택한 아티팩트를 보유 목록에 추가, 사용 이력 `(player, layer, 'artifact', ae_id)` 기록

**클라이언트 흐름**
1) 인트로 GET → 2) 후보 GET → 3) 카드 3개 렌더 → 4) apply POST → 5) 상태 갱신

**응답 예시(형식만)**
```json
// GET /api/event/artifact
{ "success": true, "data": { "ae_id": 41, "ae_name": "(DB 값)" } }

// GET /api/event/artifact/candidates
{ "success": true, "data": [ { "ArtifactID": 201, "ArtifactName": "(DB 값)" }, { "ArtifactID": 202, "ArtifactName": "(DB 값)" }, { "ArtifactID": 203, "ArtifactName": "(DB 값)" } ] }

// POST /api/event/artifact/apply
{ "success": true, "message": "아티팩트 추가" }
```

> 주의: 이름/텍스트는 **DB 값이 그대로 표시**됩니다(문서에서는 형식만 예시).

---

### 7) Boss

**엔드포인트**
- 인트로: `GET /api/event/boss?playerId=...` → `BossEventDto`(예: `be_id`, `be_name`, `be_session`, `MonsterID`)  
- **전투 진입**: `POST /api/event/boss/fight` → **전투 시작 신호**를 보내고, 이후 제어는 **`/battle/event`**로 이관됩니다.

**백엔드 처리 요약**
1) 현재 세션의 보스 인트로 1건 조회(`be_id`, `MonsterID`)  
2) `boss/fight` 수신 시 전투 시작을 기록하고 **BattleController(`/battle/event`)**로 라우팅  
3) 전투 결과(승패/보상)는 Battle 모듈에서 처리 후 Player 상태/진행도 반영  
4) 사용 이력 `(player, layer, 'boss', be_id)` 기록(동일 계층 재등장 방지)

**클라이언트 흐름**
1) 인트로 GET → 2) 보스 소개 UI → 3) 전투 시작 POST → 4) 전투 화면(`/battle/event`)로 이동

---

## 공통 규칙

- **중복 방지**: 각 이벤트 적용 시 `(player_id, layer, event_type, event_id)`를 사용 이력에 기록.  
- **세션/스테이지**: `WhereSession`(물/불/풀 순환), `WhereStage`(1~10). 5/10층은 전투 강제, 10층은 `nextlayer`만 허용.  
- **검증**: 서버가 항상 최종 검증(중복/보유/범위/유효 ID). 클라이언트 입력은 신뢰하지 않음.  
- **후보 개수**: Card/Artifact는 기본 **3개**. 조건 부족 시 1~2개일 수 있으며, 필요하면 폴백 정책으로 보완.

---

## 프론트엔드 연동 팁 (React 예시)

```ts
// 1) 카드 이벤트 예시
const intro = await fetch(`/api/event/card?playerId=${playerId}`).then(r=>r.json());
const cand  = await fetch(`/api/event/card/candidates?playerId=${playerId}`).then(r=>r.json());
await fetch(`/api/event/card/apply`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ playerId, ce_id: String(intro.data.ce_id), skillId: String(cand.data[0].skill_id) })
});

// 2) 보스 전투 진입 예시
const boss = await fetch(`/api/event/boss?playerId=${playerId}`).then(r=>r.json());
await fetch(`/api/event/boss/fight`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ playerId, be_id: String(boss.data.be_id) })
});
// 이후 라우팅: /battle/event (서버 응답/리다이렉트 정책에 맞춰 처리)
```
