<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html>
<head>
    <title>이벤트 결과</title>
</head>
<body>
    <h1>이벤트 결과</h1>
    <p><strong>이벤트:</strong> ${event.e_name}</p>
    
    <ul>
        <c:if test="${event.e_phealth != 0}">
    		<li>
        	플레이어 체력 
        		<c:choose>
           			<c:when test="${event.effectPhealth > 0}">
                		${event.effectPhealth}% 회복
            		</c:when>
            		<c:when test="${event.effectPhealth < 0}">
                	${-event.effectPhealth}% 감소
            		</c:when>
            		<c:otherwise>
                	변화 없음
            		</c:otherwise>
        		</c:choose>
    		</li>
		</c:if>
        <c:if test="${event.e_patk != 0}">
            <li>플레이어 공격력 증가 
			<p><strong>이벤트 다이스 결과:</strong> ${event.effectDiceResult}</p>
        	공격력 증가량: (${event.effectDiceResult} × ${event.e_patk})</li>
        </c:if>
        <c:if test="${event.e_luck != 0}">
            <li>운 증가: ${event.effectLuck}</li>
        </c:if>
        <c:if test="${event.e_gold != 0}">
            <li>골드 획득: ${event.effectGold} G</li>
        </c:if>
        <c:if test="${event.e_mhealth != 0}">
    		<li>
        	몬스터 체력 
        		<c:choose>
            		<c:when test="${event.effectMhealth > 0}">
                		${event.effectMhealth}% 회복
            		</c:when>
            		<c:when test="${event.effectMhealth < 0}">
                		${-event.effectMhealth}% 감소
            		</c:when>
            		<c:otherwise>
                		변화 없음
            		</c:otherwise>
        		</c:choose>
    		</li>
		</c:if>
        <c:if test="${event.e_matk != 0}">
            <li>몬스터 공격력 감소
        	<p><strong>이벤트 다이스 결과:</strong> ${event.effectDiceResult}</p>
        	공격력 감소량: (${event.effectDiceResult} × ${-event.e_matk})</li>
        </c:if>
    </ul>

    <hr>

    <h3>플레이어 상태</h3>
    <ul>
        <li>이름: ${player.p_name}</li>
        <li>HP: ${player.p_currenthp} / ${player.p_maxhp}</li>
        <li>ATK: ${player.p_atk}</li>
        <li>LUCK: ${player.p_luck}</li>
        <li>GOLD: ${playerGold}</li>
    </ul>

    <a href="/">되돌아가기</a>
</body>
</html>