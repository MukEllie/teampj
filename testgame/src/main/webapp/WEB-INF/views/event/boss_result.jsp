<%@ page contentType="text/html; charset=UTF-8" %>
<html><body>
  <h2>보스 이벤트 결과</h2>
  <pre style="white-space:pre-wrap;">${message}</pre>
  
  <hr>
  <form method="get" action="${pageContext.request.contextPath}/camp">
    <input type="hidden" name="playerId" value="${playerId}" />
    <button type="submit">정비하기로 이동</button>
  </form>
  
  <a href="/">홈으로</a>
</body></html>