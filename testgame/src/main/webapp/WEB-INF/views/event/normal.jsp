<%@ page contentType="text/html; charset=UTF-8" %>
<html><body>
  <!-- 제목만 표시 (효과 수치 사전 노출 금지) -->
  <h2>이벤트: ${event.ne_name}</h2>
  <p>이 이벤트를 진행하시겠습니까?</p>

  <!-- 진행 버튼: 실제 적용은 /event/normal/apply 에서 처리 -->
  <form action="/event/normal/apply" method="post" style="display:inline;">
    <input type="hidden" name="playerId" value="${playerId}">
    <input type="hidden" name="ne_id" value="${event.ne_id}">
    <button type="submit">진행한다</button>
  </form>

  <!-- 돌아가기: 홈으로 -->
  <a href="/" style="margin-left:12px;">돌아간다</a>
</body></html>