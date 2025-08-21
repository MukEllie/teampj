<%@ page contentType="text/html; charset=UTF-8" %>
<html><body>
  <h2>이벤트: ${event.re_name}</h2>
  <p>주사위: 1 ~ ${event.re_dice} / 성공 기준: ${event.re_dicelimit} 이상</p>

  <form action="/event/roll/apply" method="post">
    <input type="hidden" name="playerId" value="${playerId}">
    <input type="hidden" name="re_id" value="${event.re_id}">
    <button type="submit">주사위 굴리기</button>
  </form>

  <a href="/" style="margin-left:12px;">돌아간다</a>
</body></html>