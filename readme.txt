기존 testgame에서 수정된 파일:
CharacterStatusMapper.xml의 getPlayerInfo 파트 전체 수정
CharacterStatusMapper.java의 getPlayerInfo에서 Player를 @Param("PlayerID")로 수정

전체 구조 개요

컨트롤러

src/main/java/com/milite/controller/EventController.java

서비스

src/main/java/com/milite/service/EventService.java

src/main/java/com/milite/service/EventServiceImpl.java

퍼시스턴스 (MyBatis)

src/main/java/com/milite/mapper/EventMapper.java

src/main/resources/com/milite/mapper/EventMapper.xml

(연동) CharacterStatusMapper.java/xml, UserMapper.java/xml

DTO

NormalEventDto, RollEventDto, TrapEventDto, SelectEventDto, SelectChoiceDto,
CardEventDto, ArtifactEventDto, ArtifactDto, BossEventDto, SkillDto,
PlayerDto, UserDto

뷰 (JSP)

/WEB-INF/views/event/*.jsp (normal/roll/trap/select/card/artifact/boss 각 intro/result)

상태 추적 테이블

used_events (플레이어/계층/타입별 사용 이벤트 차단)

요청–응답 흐름 (라우팅)

EventController 에서 모든 이벤트 엔드포인트를 /event 하위에 매핑.

랜덤 트리거

GET /event/trigger/{playerId} → eventService.triggerRandomEvent(playerId)

1~6 주사위로 normal/roll/card/artifact/select/trap 중 하나로 포워딩

(대체) triggerRandomNonBoss() : 가능한 타입을 셔플하며 하나라도 준비 가능하면 그쪽으로 포워딩

Normal

GET /event/normal?playerId=... → prepareNormal 후 event/normal.jsp

POST /event/normal/apply → applyNormal 후 event/normal_result.jsp

Roll

GET /event/roll / POST /event/roll/apply

Trap

GET /event/trap / POST /event/trap/apply

Select

GET /event/select (선택지 목록 표시) / POST /event/select/apply

Card

GET /event/card (카드 후보 3장) / POST /event/card/apply (획득)

카드 후보는 SkillDB에서 skill_type='event' + 세션/직업 필터, 랜덤 3장

Artifact

GET /event/artifact (아티팩트 후보 3개) / POST /event/artifact/apply (획득)

후보는 ArtifactDB에서 세션/직업 필터, 랜덤 3개

Boss

GET /event/boss / POST /event/boss/fight

보스는 GLOBAL 레이어에서 1회 제한 마킹

✅ 주의 버그: home.jsp는 action="/event/trigger"에 쿼리 파라미터로 playerId를 보냄.
하지만 컨트롤러는 @GetMapping("/trigger/{playerId}") PathVariable을 요구함.
→ /event/trigger/test01 형식으로 바꾸거나, 컨트롤러를 @GetMapping("/trigger") + @RequestParam String playerId로 수정해야 404가 안 납니다.

서비스 로직 (EventServiceImpl)

모든 이벤트는 공통적으로:

CharacterStatusMapper.getPlayerInfo(playerId)로 현재 플레이어 상태(HP/ATK/Luck, WhereSession, Using_Character 등)를 읽음

EventMapper로 현재 세션(=PlayerDB.WhereSession)과 사용 이력(used_events) 을 기준으로 아직 안 쓴 이벤트 하나를 랜덤 픽

.../apply 단계에서 수치 적용 → CharacterStatusMapper.updateStatus(p)로 상태 저장 → used_events에 마킹

일부는 UserMapper.addGold 호출 (양수/음수 모두 더하기로 처리됨)

각 타입별 핵심:

1) Normal

준비: pickOneUnusedNormal(session, playerId, layer=session)

적용: applyNormal

플레이어: ne_php/ne_patk/ne_luck (HP/ATK/LUK 가감), MaxHP 변화 없음

몬스터 이벤트값: ne_mhp(적 HP 변화), ne_matk(적 ATK 변화) → PlayerDto.Event* 필드에 저장

userMapper.addGold 로 골드 ±

used_events 마킹: (playerId, layer=세션, type="normal", eventId)

2) Roll

준비: pickOneUnusedRoll(...)

적용: applyRoll

주사위 re_dice 굴려 re_dicelimit 비교 → 성공/실패 분기

성공 시: 플레이어 쪽에 양수 효과만 적용 (체력/최대체력/공격/행운/골드)

실패 시: 플레이어 쪽에 음수 효과만, 몬스터 쪽엔 양수 효과만 적용

수치 경계값 처리(HP≥1, ATK/LUK≥0, HP≤Max 등) 포함

used_events 마킹 type="roll"

3) Trap

준비: pickOneUnusedTrap(...)

적용: applyTrap

주사위 te_dice vs te_dicelimit

성공(≥limit): 함정 회피, 수치 변화 없음 (단, 코드상 used 마킹은 하므로 재등장 안 함)

실패(<limit): 플레이어에 음수 효과만 적용 (HP/MaxHP/ATK/LUK 감소), 몬스터 변화 없음

used_events 마킹 type="trap"

4) Select

준비: pickOneUnusedSelect(...) 로 부모 이벤트 1개, getSelectChoices(se_id) 로 선택지 N개

적용: applySelect(playerId, sec_id)

선택지의 수치를 그대로 적용 (HP/MaxHP/ATK/LUK ±, 적 이벤트값도 해당 선택지의 mhp/mmaxhp/matk로 설정)

used_events 마킹은 부모 se_id 기준 (중복 방지)

5) Card

준비:

pickOneUnusedCard(...) : cardevent에서 제목/세션 등 (표시용 이벤트)

카드 후보 3장: getEventSkillsFromDB(session, job, 3)

SkillDB에서 skill_type='event' AND (element = 'none' OR element = 세션)
AND (skill_job='common' OR skill_job=플레이어 직업)

적용: applyCardGain(playerId, ce_id, skillId)

CharacterStatusMapper.addSkillToPlayer(playerId, skillId)로 스킬 보유 JSON에 추가

used_events 마킹 type="card"

(메모) 이전에 원하셨던 “R/SR 이상만” 같은 희귀도 필터는 현재 쿼리엔 없음. 필요 시 WHERE rarity IN ('R','SR',...) 추가해야 함.

6) Artifact

준비:

pickOneUnusedArtifactEvent(...) : artifactevent에서 표시용 이벤트 1개

후보 3개: getArtifactsBySession(session, job, 3)

ArtifactDB에서 (artifact_session='none' OR =세션) AND (artifact_job='common' OR =직업)

적용: applyArtifactGain(playerId, ae_id, artifactId)

CharacterStatusMapper.addArtifactToPlayer(...) 로 보유 JSON에 ID 추가

used_events 마킹 type="artifact"

7) Boss

준비: pickOneUnusedBoss(session, playerId)

적용: applyBossEnter(playerId, be_id)

GLOBAL 레이어에서 type='boss' 로 사용 마킹 (계층과 무관한 1회 제한)

MyBatis 매퍼 (EventMapper.xml) 요약

모든 pickOneUnusedXxx 쿼리는 공통적으로:

세션 필터: (LOWER(session_col)='none' OR LOWER(session_col)=LOWER(#{session}))

미사용 필터: used_events에 (player_id, layer, event_type) 매칭되는 event_id가 없는 것

랜덤 1개 선택: ORDER BY RAND() LIMIT 1

특이점:

Card 후보: getEventSkillsFromDB(session, job, limit) (SkillDB에서 필터 후 랜덤)

Artifact 후보: getArtifactsBySession(session, job, limit) (ArtifactDB에서 필터 후 랜덤)

used_events 관리:

markEventUsed(playerId, layer, type, eventId) → ON DUPLICATE KEY UPDATE used_at=CURRENT_TIMESTAMP

resetLayerUsed(playerId, layer) → 해당 레이어에서 boss 제외 모두 삭제

연관 매퍼/DTO (상태·유저)
CharacterStatusMapper

getPlayerInfo(@Param("PlayerID") String playerId)
→ PlayerDB에서 Player_ID 등 읽어 PlayerDto로 매핑

updateStatus(PlayerDto p)
→ 현 HP/Max/ATK/LUK, 이벤트용 몬스터 값(EventCurrHp/EventMaxHp/EventAtk) 등 갱신

addSkillToPlayer(playerId, skillId) → Owned_Skills JSON에 append

addArtifactToPlayer(playerId, artifactId) → Own_Artifact JSON에 append

⚠️ 파라미터 명/대소문자 주의
XML 내부 몇 군데서 #{PlayerId}(소문자 d) 같은 레퍼런스가 보입니다.
PlayerDto 필드는 PlayerID(대문자 D)이고, Lombok 접근자도 getPlayerID()입니다.

getPlayerInfo는 @Param("PlayerID")와 XML #{PlayerID}가 일치

updateStatus는 빈 전체(즉 p의 프로퍼티) 를 쓰므로 문제 없을 가능성이 큼

다만 XML에 #{PlayerId}가 실제로 쓰인 곳(조건절 등)이 있으면 BindingException 위험이 있습니다.
→ XML에서 항상 실제 프로퍼티/파라미터명과 100% 동일한 식별자를 사용하세요.

PlayerDto

필드: PlayerID, Using_Character, curr_hp, max_hp, atk, luck, WhereSession, WhereStage

이벤트 전용: EventCurrHp, EventMaxHp, EventAtk (몬스터 쪽 수치 저장용)

아티팩트/스킬 관련 메서드도 포함(전투와 연동되나, 이벤트 적용 시는 상태 저장만 사용)

UserMapper / UserDto

getUserById(id), addGold(id, amount)

SQL: UPDATE UserDB SET gold = gold + #{amount} → 음수도 가능
(인터페이스 주석은 “증가만”이라고 되어 있지만, 실제 구현은 ± 둘 다 됩니다. 혼동 주석 수정 권장)

JSP 뷰

각 .../jsp에서 제목/버튼/선택지를 표시하고 apply로 POST

select.jsp는 choices 반복 렌더링

card.jsp/artifact.jsp는 후보 3개를 선택하게 함

결과 페이지는 message를 <pre> 등으로 표시

intro.jsp는 없음 (요청하지 않음)

상태 관리 (used_events)

중복 방지 핵심: (player_id, layer, event_type, event_id)로 유니크 관리

Normal/Roll/Trap/Card/Artifact/Select → 플레이어의 현재 WhereSession을 layer로 저장

Boss → 특수: layer = 'GLOBAL' 고정 (계층 무관 1회 제한)

리셋: resetLayerUsed(playerId, layer) 호출 시 boss 제외 해당 레이어 이벤트 사용 내역 초기화

발견된 문제/개선 포인트 (실동 이슈 가능성 높은 순)

/event/trigger 경로 매칭 오류

home.jsp는 /event/trigger?playerId=...로 보냄

컨트롤러는 /event/trigger/{playerId}로 받음
→ 404 원인. 둘 중 하나로 통일 필요.
빠른 해결: 컨트롤러에 @GetMapping("/trigger") public String trigger(@RequestParam String playerId) 오버로드 추가.

MyBatis 파라미터명 대소문자 혼용 가능성

XML에 #{PlayerId}(소문자 d) 흔적이 있습니다.

안전하게 전부 #{PlayerID}로 통일 or 파라미터 이름을 명시적으로 @Param("PlayerId") 맞추세요.

이전에 겪으셨던 Parameter 're_id' not found 류 오류 원인과 패턴이 동일합니다.

Gold 처리 주석 불일치

실제로는 + 연산이므로 음수도 감소 처리됨. 주석을 “증감”으로 바꾸는 게 혼동 방지.

보스 제외 리셋

resetLayerUsed가 boss 제외만 지움 → 의도대로라면 OK.
만약 보스도 특정 상황에서 리셋해야 한다면 쿼리 분기 필요.

카드/아티팩트 후보 기준

현재 후보 3개는 세션 + 직업 OR 공용 기준, 랜덤 3개입니다.

만약 “카드는 rarity R/SR 이상”, “세션·직업 완전 일치 우선” 등의 추가 비즈니스 룰이 필요하면
해당 SELECT에 조건/우선순위(ORDER BY) 로직을 보강해야 합니다.

데이터 흐름 요약 (한 눈에)

준비(prepareXxx)
PlayerDB에서 플레이어 상태 조회 → 세션 확인
→ EventMapper.pickOneUnusedXxx(세션, playerId, layer=세션)로 아직 안 쓴 이벤트 하나 선택
→ JSP로 제목/선택지/후보 3개 등 렌더링

적용(applyXxx)
선택/주사위 결과에 따라 플레이어 수치 및 몬스터 이벤트 수치 조정
→ CharacterStatusMapper.updateStatus(p)
→ 골드 증감 시 UserMapper.addGold()
→ EventMapper.markEventUsed(playerId, layer, type, eventId) 로 사용 기록

바로 적용 가능한 빠른 패치 제안

(필수) /event/trigger 라우팅 불일치 수정

옵션 A: home.jsp 액션을 /event/trigger/{playerId}로 변경

옵션 B: 컨트롤러에 @GetMapping("/trigger") + @RequestParam String playerId 추가

(권장) MyBatis 파라미터/프로퍼티 대소문자 100% 일치 점검

특히 CharacterStatusMapper.xml에서 #{PlayerId} vs #{PlayerID} 혼재 여부 검색 후 통일

(선택) 카드 희귀도/속성/직업 정합성 강화

getEventSkillsFromDB: AND rarity IN ('R','SR', ...) 등 조건 추가

필요 시 ORDER BY에 가중치 방식(세션/직업 완전 일치 우선)을 두고 상위 3개

파일별 핵심 위치 참고

컨트롤러:
src/main/java/com/milite/controller/EventController.java
(라우팅/뷰 네임)

서비스:
src/main/java/com/milite/service/EventServiceImpl.java

prepareNormal/applyNormal

prepareRoll/applyRoll

prepareTrap/applyTrap

prepareSelect/getSelectChoices/applySelect

prepareCard/getCardChoicesFromSkillDB/applyCardGain

prepareArtifact/getArtifactCandidates/applyArtifactGain

prepareBoss/applyBossEnter

triggerRandomEvent/triggerRandomNonBoss/resetLayerUsed

매퍼 SQL:
src/main/resources/com/milite/mapper/EventMapper.xml
(각 pickOneUnusedXxx, 후보 3개 SELECT, used_events 관리)

플레이어/유저:
src/main/resources/com/milite/mapper/CharacterStatusMapper.xml
src/main/resources/com/milite/mapper/UserMapper.xml
src/main/java/com/milite/dto/PlayerDto.java
src/main/java/com/milite/dto/UserDto.java

뷰:
src/main/webapp/WEB-INF/views/event/*.jsp