<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>전투 시작</title>
<script>
  window.addEventListener('DOMContentLoaded', function(){
    document.getElementById('autoForm').submit();
  });
</script>
</head>
<body>
  <form id="autoForm" method="post" action="${pageContext.request.contextPath}/battle/start">
    <!-- BattleController는 'PlayerID' (대소문자 주의) 를 요구 -->
    <input type="hidden" name="PlayerID" value="${playerId}" />
    <noscript>
      <p>자동으로 전투를 시작하지 못했습니다. 아래 버튼을 눌러 시작하세요.</p>
      <button type="submit">전투 시작</button>
    </noscript>
  </form>
</body>
</html>