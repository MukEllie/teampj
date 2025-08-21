<%@ page contentType="text/html; charset=UTF-8" %>
<html><body>
  <h2>보스이벤트: ${event.be_name}</h2>
  <p>보스가 나타났습니다! 전투하기를 누르면 (임시) 홈으로 이동합니다.</p>

  <form action="/event/boss/fight" method="post">
    <input type="hidden" name="playerId" value="${playerId}">
    <input type="hidden" name="be_id" value="${event.be_id}">
    <button type="submit">전투하기</button>
  </form>
</body></html>