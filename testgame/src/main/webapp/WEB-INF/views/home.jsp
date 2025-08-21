<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Home</title></head>
<body>
  <h1>플레이어 선택</h1>

  <!-- src/main/webapp/WEB-INF/views/home.jsp -->

<form action="/event/trigger/test01" method="get">
  <button type="submit">test01 이벤트 보기</button>
</form>

<form action="/event/trigger/test02" method="get">
  <button type="submit">test02 이벤트 보기</button>
</form>

<form action="/event/trigger/test03" method="get">
  <button type="submit">test03 이벤트 보기</button>
</form>
</body>
</html>