<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>정비소</title>
<style>
  body { font-family: sans-serif; margin: 24px; }
  .wrap { max-width: 720px; margin: 0 auto; }
  .title { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
  .card { border: 1px solid #ddd; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  .btn { padding: 10px 16px; border: 1px solid #333; border-radius: 8px; background:#fafafa; cursor: pointer; }
  .btn.primary { background:#333; color:#fff; }
  .row { display:flex; gap:12px; flex-wrap:wrap; }
</style>
</head>
<body>
<div class="wrap">
  <div class="title">정비소</div>
  <div class="card">
    <div>플레이어: <b>${playerId}</b></div>
    <div style="color:#666; font-size:14px; margin-top:4px;">카드 교체, 다음 스테이지 진행을 선택하세요.</div>
  </div>

  <div class="card">
    <div style="margin-bottom:8px; font-weight:600;">카드 관리</div>
    <!-- TODO: 실제 카드 목록/교체 UI는 추후 연동. 지금은 자리표시자 -->
    <div class="row">
      <button class="btn" disabled>카드 교체(준비중)</button>
    </div>
  </div>

  <div class="card">
    <div style="margin-bottom:8px; font-weight:600;">다음 스테이지로</div>
    <form method="post" action="${pageContext.request.contextPath}/camp/nextstage">
      <input type="hidden" name="playerId" value="${playerId}"/>
      <button type="submit" class="btn primary">다음 스테이지 진행</button>
      <div style="color:#666; font-size:12px; margin-top:6px;">
        70% 확률로 전투, 30% 확률로 이벤트로 이동합니다.
      </div>
    </form>
  </div>
</div>
</body>
</html>