// src/api/client.js  (axios 없이 fetch 버전)
// package.json 의 "proxy": "http://localhost:8080/testgame" 가정

const withParams = (url, params) => {
  const q = new URLSearchParams(params || {});
  return q.toString() ? `${url}?${q}` : url;
};

const getJSON = async (url, opts = {}) => {
  const res = await fetch(url, { credentials: "include", ...opts });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${text}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
};

// 서버가 { data: ... }로 줄 수도 있으니, 항상 payload만 반환
const unwrap = (json) =>
  json && typeof json === "object" && "data" in json ? json.data : json;

// x-www-form-urlencoded POST 헬퍼
const postForm = (url, formObj) =>
  getJSON(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formObj),
  });

/** =========================
 *  Start (시작/이어하기)
 *  ========================= */
export const getStartState = async (userId) =>
  unwrap(await getJSON(withParams("/start/state", { userId })));

export const continueRun = async (userId) =>
  // 컨트롤러는 next 경로 문자열을 바로 주기도 함 → unwrap이 문자열도 그대로 반환
  unwrap(await postForm("/start/continue", { userId }));

export const getStartOptions = async () =>
  unwrap(await getJSON("/start/options"));

export const chooseClass = async (userId, className) =>
  unwrap(await postForm("/start/choose", { userId, className }));

/** =========================
 *  Camp (캠프)
 *  ========================= */
// NOTE: CampController는 PlayerID(대문자) 파라미터를 사용합니다.
export const getCamp = async (PlayerID) =>
  unwrap(await getJSON(withParams("/camp", { PlayerID })));

export const nextStage = async (PlayerID) =>
  unwrap(await getJSON(withParams("/camp/nextstage", { PlayerID }), { method: "POST" }));

export const nextLayer = async (PlayerID) =>
  unwrap(await getJSON(withParams("/camp/nextlayer", { PlayerID }), { method: "POST" }));

/** =========================
 *  Battle (전투)
 *  ========================= */
export const startBattle = async (PlayerID) =>
  unwrap(await getJSON(withParams("/battle/start", { PlayerID }), { method: "POST" }));

// 보스 이벤트 응답에서 "/battle/event" 라우트를 안내 → 실제 진입
export const startEventBattle = async (PlayerID) =>
  unwrap(await getJSON(withParams("/battle/event", { PlayerID }), { method: "POST" }));

/** =========================
 *  Event (이벤트 전 종류 전부)
 *  class-level base: /event
 *  ========================= */

/* 공통: 랜덤 이벤트 트리거 (선택적) */
export const triggerRandomEvent = async (playerId) =>
  unwrap(await getJSON(`/event/trigger/${encodeURIComponent(playerId)}`));

/* Normal (일반) */
export const getNormalEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/normal", { playerId })));

export const applyNormalEvent = async (playerId, ne_id) =>
  unwrap(await postForm("/event/normal/apply", { playerId, ne_id: String(ne_id) }));

/* Roll (주사위) */
export const getRollEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/roll", { playerId })));

export const applyRollEvent = async (playerId, re_id) =>
  unwrap(await postForm("/event/roll/apply", { playerId, re_id: String(re_id) }));

/* Trap (함정) */
export const getTrapEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/trap", { playerId })));

export const applyTrapEvent = async (playerId, te_id) =>
  unwrap(await postForm("/event/trap/apply", { playerId, te_id: String(te_id) }));

/* Select (선택) */
export const getSelectEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/select", { playerId })));

// 선택지 목록 조회(se_id 필요)
export const getSelectChoices = async (se_id) =>
  unwrap(await getJSON(withParams("/event/select/choices", { se_id: String(se_id) })));

export const applySelectEvent = async (playerId, sec_id) =>
  unwrap(await postForm("/event/select/apply", { playerId, sec_id: String(sec_id) }));

/* Card (카드) */
export const getCardEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/card", { playerId })));

// 카드 후보 3장
export const getCardCandidates = async (playerId) =>
  unwrap(await getJSON(withParams("/event/card/candidates", { playerId })));

// 선택 카드 적용(ce_id: 카드이벤트 ID, skillId: 선택 스킬 ID)
export const applyCardEvent = async (playerId, ce_id, skillId) =>
  unwrap(await postForm("/event/card/apply", {
    playerId,
    ce_id: String(ce_id),
    skillId: String(skillId),
  }));

/* Artifact (아티팩트) */
export const getArtifactEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/artifact", { playerId })));

// 아티팩트 후보 3개
export const getArtifactCandidates = async (playerId) =>
  unwrap(await getJSON(withParams("/event/artifact/candidates", { playerId })));

// 선택 아티팩트 적용(ae_id: 아티팩트이벤트 ID, artifactId: 선택 아티팩트 ID)
export const applyArtifactEvent = async (playerId, ae_id, artifactId) =>
  unwrap(await postForm("/event/artifact/apply", {
    playerId,
    ae_id: String(ae_id),
    artifactId: String(artifactId),
  }));

/* Boss (보스) */
export const getBossEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/boss", { playerId })));

// 전투 진입(be_id: 보스이벤트 ID)
// 응답 data로 "/battle/event" 문자열을 주므로, 이어서 startEventBattle(PlayerID) 호출 권장
export const fightBossEvent = async (playerId, be_id) =>
  unwrap(await postForm("/event/boss/fight", { playerId, be_id: String(be_id) }));

export default {};