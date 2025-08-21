<%@ page contentType="text/html; charset=UTF-8" %>
<html><body>
  <h2>함정: ${event.te_name}</h2>
  <p>주사위: 1 ~ ${event.te_dice} / 성공 기준: ${event.te_dicelimit} 이상</p>

  <form action="/event/trap/apply" method="post">
    <input type="hidden" name="playerId" value="${playerId}">
    <input type="hidden" name="te_id" value="${event.te_id}">
    <button type="submit">주사위 굴리기(진행)</button>
  </form>
  <!-- 함정은 돌아간다 없음 -->
</body></html>