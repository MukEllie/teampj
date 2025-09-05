<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<html><body>
  <h2>이벤트: ${event.ae_name}</h2>
  <p>아티팩트를 하나 선택하세요.</p>

  <c:forEach var="a" items="${artifacts}">
    <form action="/event/artifact/apply" method="post" style="margin-bottom:10px;">
      <input type="hidden" name="playerId" value="${playerId}">
      <input type="hidden" name="ae_id" value="${event.ae_id}">
      <!-- ✨ 여기 세 줄이 핵심 수정 -->
      <input type="hidden" name="artifactId" value="${a.artifactID}">
      <button type="submit">
        ${a.artifactName}
      </button>
      <div style="font-size:12px;color:#666;margin-top:4px;">
        ${a.artifactText}
      </div>
    </form>
  </c:forEach>

  <a href="/">돌아간다</a>
</body></html>