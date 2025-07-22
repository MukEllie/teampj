<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html>
<head>
    <title>이벤트 발생</title>
</head>
<body>
    <h1>이벤트 발생!</h1>
    <p><strong>이벤트:</strong> ${event.e_name}</p>
    <p><strong>진행하시겠습니까?</strong></p>

    <!-- 진행할 때 반드시 이벤트 ID 포함 -->
    <a href="/event/${dungeonLevel}/proceed/${event.e_id}"><button>진행한다</button></a>
    <a href="/"><button>지나간다</button></a>
</body>
</html>