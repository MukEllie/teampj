<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>이벤트 결과</title>
</head>
<body>

<h1>이벤트 발생</h1>

<p><strong>이벤트 이름:</strong> ${event.e_name}</p>
<p><strong>다이스 범위:</strong> 1 ~ ${event.e_dice}</p>
<p><strong>이벤트 타입:</strong> ${event.e_type}</p>

<p><strong>이벤트 효과:</strong></p>
<ul>
    <c:if test="${event.e_phealth != 0}">
        <li>플레이어 현재체력 변화: ${event.e_phealth}%</li>
    </c:if>
    <c:if test="${event.e_patk != 0}">
        <li>플레이어 공격력 증가 
        
		<p><strong>이벤트 다이스 결과:</strong> ${event.effectDiceResult}</p>
        
        공격력 증가량: (${event.effectDiceResult} × ${event.e_patk})</li>
    </c:if>
    <c:if test="${event.e_luck != 0}">
        <li>운 증가: ${event.e_luck}</li>
    </c:if>
    <c:if test="${event.e_gold != 0}">
        <li>골드 획득: ${event.e_gold} G</li>
    </c:if>
    <c:if test="${event.e_mhealth != 0}">
        <li>몬스터 체력 변화: ${event.e_mhealth}%</li>
    </c:if>
    <c:if test="${event.e_matk != 0}">
        <li>몬스터 공격력 감소
        <p><strong>이벤트 다이스 결과:</strong> ${event.effectDiceResult}</p>
        공격력 감소량: (${event.effectDiceResult} × ${event.e_matk})</li>
    </c:if>
</ul>

<p><strong>플레이어 상태:</strong></p>
<ul>
    <li>이름: ${player.p_name}</li>
    <li>HP: ${player.p_currenthp} / ${player.p_maxhp}</li>
    <li>ATK: ${player.p_atk}</li>
    <li>LUCK: ${player.p_luck}</li>
    <li>GOLD: ${playerGold}</li>
</ul>

<a href="/">돌아가기</a>

</body>
</html>