<%@ page contentType="text/html; charset=UTF-8" %>
<html><body>
  <h2>함정 이벤트 결과</h2>
  <pre style="white-space:pre-wrap;">${message}</pre>
  <a href="/event/trigger/${param.playerId}">다음 이벤트</a> |
  
  <hr>
  <form method="get" action="${pageContext.request.contextPath}/camp">
    <input type="hidden" name="playerId" value="${playerId}" />
    <button type="submit">정비하기로 이동</button>
  </form>
  
  <a href="/">홈으로</a>
</body></html>