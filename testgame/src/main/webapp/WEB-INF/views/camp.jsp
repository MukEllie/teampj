<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<!DOCTYPE html>
<html>
<head> ... 생략 ... </head>
<body>
<div class="wrap">
  <div class="title">정비소</div>
  <div class="card">
    <div>플레이어: <b>${playerId}</b></div>
    <div>계층: <b>${whereSession}</b> / 스테이지: <b>${whereStage}</b></div>
  </div>

  <div class="card">
    <div style="margin-bottom:8px; font-weight:600;">다음 진행</div>

    <!-- 10층 보스 격파 후 캠프 도착 → 다음 계층 이동 버튼 -->
    <c:if test="${canAdvanceLayer}">
      <form method="post" action="${pageContext.request.contextPath}/camp/nextlayer">
        <input type="hidden" name="playerId" value="${playerId}"/>
        <button type="submit" class="btn primary">다음 계층으로 이동</button>
        <div style="color:#666; font-size:12px; margin-top:6px;">
          계층이 순환(물→불→풀)하고 스테이지가 1로 초기화됩니다.
        </div>
      </form>
    </c:if>

    <!-- 일반 시나리오 → 다음 스테이지 진행 -->
    <c:if test="${!canAdvanceLayer}">
      <form method="post" action="${pageContext.request.contextPath}/camp/nextstage">
        <input type="hidden" name="playerId" value="${playerId}"/>
        <button type="submit" class="btn primary">다음 스테이지 진행</button>
        <div style="color:#666; font-size:12px; margin-top:6px;">
          70% 전투 / 30% 이벤트 (5/10층은 전투 강제)
        </div>
      </form>
    </c:if>
  </div>
</div>
</body>
</html>