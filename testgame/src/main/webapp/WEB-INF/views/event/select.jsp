<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<html><body>
  <h2>이벤트: ${event.se_name}</h2>

  <c:forEach var="c" items="${choices}">
    <form action="/event/select/apply" method="post" style="margin-bottom:8px;">
      <input type="hidden" name="playerId" value="${playerId}">
      <input type="hidden" name="sec_id" value="${c.sec_id}">
      <button type="submit">${c.sec_text}</button>
    </form>
  </c:forEach>

  <a href="/">돌아간다</a>
</body></html>