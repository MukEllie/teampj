// src/api/client.js  (axios 없이 fetch 버전)

/* API 베이스 URL 결정 — window.__API_BASE__ > REACT_APP_API_BASE > 기본값(http://localhost:8090) */
const API_BASE =
  (typeof window !== "undefined" && window.__API_BASE__) ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8090";

/* API 절대경로 빌더 — 베이스URL + path 결합 */
const apiPath = (path) =>
  API_BASE.replace(/\/$/, "") + path; // path는 항상 / 로 시작

/* 쿼리스트링 부착 유틸 — path + params → 절대 URL 반환 */
const withParams = (path, params) => {
  const q = new URLSearchParams(params || {});
  const p = q.toString() ? `${path}?${q}` : path;
  return apiPath(p);
};

/* JSON/텍스트 자동 파서 — fetch 후 JSON → 실패 시 JSON5 스타일 보정 → 그래도 실패하면 원문 문자열 반환 */
const getJSON = async (url, opts = {}) => {
  const full = url.startsWith("http") ? url : apiPath(url);
  const res = await fetch(full, { credentials: "include", mode: "cors", ...opts });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${text}`);
  }
  const text = await res.text();
  try { return JSON.parse(text); } catch {}
  try {
    const quotedKeys = text.replace(/([,{]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":');
    const fixedQuotes = quotedKeys.replace(/'/g, '"');
    return JSON.parse(fixedQuotes);
  } catch {}
  return text;
};

/* ApiResponse 언래핑 — { data }면 data만, data가 문자열 JSON이면 파싱 */
const unwrap = (json) => {
  if (json && typeof json === "object" && "data" in json) {
    const d = json.data;
    if (typeof d === "string") {
      try {
        const quotedKeys = d.replace(/([,{]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":');
        const fixedQuotes = quotedKeys.replace(/'/g, '"');
        return JSON.parse(fixedQuotes);
      } catch { return d; }
    }
    return d;
  }
  return json;
};

/* x-www-form-urlencoded POST 헬퍼 — form 객체를 본문으로 전송 */
const postForm = (url, formObj) =>
  getJSON(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formObj),
  });

/** =========================
 *  Start (시작/이어하기)
 *  ========================= */
/* Start 상태 조회 — GET /start/state?userId=... */
export const getStartState = async (userId) =>
  unwrap(await getJSON(withParams("/start/state", { userId })));

/* 이어하기(next 경로 반환 가능) — POST /start/continue (form: userId) */
export const continueRun = async (userId) =>
  // 컨트롤러는 next 경로 문자열을 바로 주기도 함 → unwrap이 문자열도 그대로 반환
  unwrap(await postForm("/start/continue", { userId }));

/* Start 옵션(직업/스탯) 조회 — GET /start/options */
export const getStartOptions = async () =>
  unwrap(await getJSON("/start/options"));

/* 직업 선택(세이브 생성) — POST /start/choose (form: userId, className) */
export const chooseClass = async (userId, className) =>
  unwrap(await postForm("/start/choose", { userId, className }));

/** =========================
 *  Skin (스킨)
 *  ========================= */
/* 보유 스킨 조회 — GET /SkinGacha/ViewUserSkin?userId=... */
export const getUserSkins = async (userId) =>
  unwrap(await getJSON(withParams("/SkinGacha/ViewUserSkin", { userId })));

/** =========================
 *  Camp (캠프)
 *  ========================= */
// NOTE: CampController는 PlayerID(대문자) 파라미터를 사용합니다.
/* 캠프 진입 상태 조회 — GET /camp?PlayerID=... */
export const getCamp = async (PlayerID) =>
  unwrap(await getJSON(withParams("/camp", { PlayerID })));

/* 다음 스테이지로 이동 — POST /camp/nextstage (form: PlayerID) */
export const nextStage = async (PlayerID) =>
  unwrap(await getJSON(withParams("/camp/nextstage", { PlayerID }), { method: "POST" }));

/* 다음 레이어로 이동 — POST /camp/nextlayer (form: PlayerID) */
export const nextLayer = async (PlayerID) =>
  unwrap(await getJSON(withParams("/camp/nextlayer", { PlayerID }), { method: "POST" }));

/** =========================
 *  Battle (전투)
 *  ========================= */
/* 전투 시작 — POST /battle/start (form: PlayerID) */
export const startBattle = async (PlayerID) =>
  unwrap(await getJSON(withParams("/battle/start", { PlayerID }), { method: "POST" }));

// 보스 이벤트 응답에서 "/battle/event" 라우트를 안내 → 실제 진입
/* 이벤트 전투 시작 — POST /battle/event (form: PlayerID) */
export const startEventBattle = async (PlayerID) =>
  unwrap(await getJSON(withParams("/battle/event", { PlayerID }), { method: "POST" }));

/** =========================
 *  Event (이벤트 전 종류 전부)
 *  class-level base: /event
 *  ========================= */


/* Trigger (트리거) — 이벤트 랜덤선택, GET + 경로변수 버전 */
/* 랜덤 이벤트 트리거 — GET /event/trigger/{playerId} */
export const triggerEvent = async (playerId) =>
  unwrap(await getJSON(`/event/trigger/${encodeURIComponent(playerId)}`));


/* Normal (일반) */
/* 일반 이벤트 조회 — GET /event/normal?playerId=... */
export const getNormalEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/normal", { playerId })));

/* 일반 이벤트 적용 — POST /event/normal/apply (form: playerId, ne_id, choice) */
export const applyNormalEvent = async (playerId, ne_id, choice) =>
  unwrap(await postForm("/event/normal/apply", {
    playerId,
    ne_id: String(ne_id),
    choice: String(choice),
  }));


/* Roll (주사위) */
/* 주사위 이벤트 조회 — GET /event/roll?playerId=... */
export const getRollEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/roll", { playerId })));

/* 주사위 이벤트 적용 — POST /event/roll/apply (form: playerId, re_id, number) */
export const applyRollEvent = async (playerId, re_id, number) =>
  unwrap(await postForm("/event/roll/apply", {
    playerId,
    re_id: String(re_id),
    number: String(number),
  }));


/* Artifact (유물) */
/* 유물 이벤트 조회 — GET /event/artifact?playerId=... */
export const getArtifactEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/artifact", { playerId })));

/* 유물 후보 목록 — GET /event/artifact/candidates?playerId=... */
export const getArtifactCandidates = async (playerId) =>
  unwrap(await getJSON(withParams("/event/artifact/candidates", { playerId })));

/* 유물 선택 적용 — POST /event/artifact/apply (form: playerId, ae_id, artifactId) */
export const applyArtifactEvent = async (playerId, ae_id, artifactId) =>
  unwrap(await postForm("/event/artifact/apply", {
    playerId,
    ae_id: String(ae_id),
    artifactId: String(artifactId),
  }));


/* Card (카드) */
/* 카드 이벤트 조회 — GET /event/card?playerId=... */
export const getCardEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/card", { playerId })));

/* 카드 후보 목록 — GET /event/card/candidates?playerId=... */
export const getCardCandidates = async (playerId) =>
  unwrap(await getJSON(withParams("/event/card/candidates", { playerId })));

/* 카드 선택 적용 — POST /event/card/apply (form: playerId, ce_id, skillId) */
export const applyCardEvent = async (playerId, ce_id, skillId) =>
  unwrap(await postForm("/event/card/apply", {
    playerId,
    ce_id: String(ce_id),
    skillId: String(skillId),
  }));


/* Select (선택) */
/* 선택 이벤트 조회 — GET /event/select?playerId=... */
export const getSelectEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/select", { playerId })));

/* 선택지 목록 조회 — GET /event/select/choices?se_id=... */
export const getSelectChoices = async (se_id) =>
  unwrap(await getJSON(withParams("/event/select/choices", { se_id: String(se_id) })));

/* 선택 이벤트 적용 — POST /event/select/apply (form: playerId, sec_id) */
export const applySelectEvent = async (playerId, sec_id) =>
  unwrap(await postForm("/event/select/apply", { playerId, sec_id: String(sec_id) }));


/* Trap (함정) */
/* 함정 이벤트 조회 — GET /event/trap?playerId=... */
export const getTrapEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/trap", { playerId })));

/* 함정 이벤트 적용 — POST /event/trap/apply (form: playerId, te_id) */
export const applyTrapEvent = async (playerId, te_id) =>
  unwrap(await postForm("/event/trap/apply", { playerId, te_id: String(te_id) }));


/* Boss (보스) */
/* 보스 이벤트 조회 — GET /event/boss?playerId=... */
export const getBossEvent = async (playerId) =>
  unwrap(await getJSON(withParams("/event/boss", { playerId })));

// 전투 진입(be_id: 보스이벤트 ID)
// 응답 data로 "/battle/event" 문자열을 주므로, 이어서 startEventBattle(PlayerID) 호출 권장
/* 보스 이벤트 전투 진입 — POST /event/boss/fight (form: playerId, be_id) */
export const fightBossEvent = async (playerId, be_id) =>
  unwrap(await postForm("/event/boss/fight", { playerId, be_id: String(be_id) }));


export default {};