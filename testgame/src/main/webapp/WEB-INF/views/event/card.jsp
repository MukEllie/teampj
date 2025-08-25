<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<html><body>
  <h2>이벤트: ${event.ce_name}</h2>
  <p>카드를 선택하세요.</p>

  <c:forEach var="s" items="${skills}">
    <form action="/event/card/apply" method="post" style="margin-bottom:8px;">
      <input type="hidden" name="playerId" value="${playerId}">
      <input type="hidden" name="ce_id" value="${event.ce_id}">
      <input type="hidden" name="skillId" value="${s.skill_id}">
      <button type="submit">
        ${s.skill_name} (${s.rarity})
      </button>
      <div style="font-size:12px;color:#666;margin-top:4px;">
        ${s.skill_text}
      </div>
    </form>
  </c:forEach>

  <a href="/">돌아간다</a>
</body></html>