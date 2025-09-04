<%@ page contentType="text/html; charset=UTF-8" %>
<html><body>
  <h2>카드 이벤트 결과</h2>
  <pre>${message}</pre>

  <div style="margin-top:12px;">
    <a href="/event/trigger/${param.playerId}">다음 이벤트</a>
    &nbsp;|&nbsp;
    
    <hr>
  <form method="get" action="${pageContext.request.contextPath}/camp">
    <input type="hidden" name="playerId" value="${playerId}" />
    <button type="submit">정비하기로 이동</button>
  </form>
  
    <a href="/">홈으로</a>
  </div>
</body></html>