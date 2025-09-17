// CardExchangeScreen.jsx
import React, { useState, useEffect } from 'react';
import { getBackground, getCard, getSkill } from '../../utils/ImageManager';
import './CardExchangeScreen.css';

const CardExchangeScreen = ({ onNavigate }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [exchangeCard, setExchangeCard] = useState(null);
  const [updateKey, setUpdateKey] = useState(0); // 강제 리렌더링용
  const [forceUpdate, setForceUpdate] = useState(0); // 추가 강제 업데이트

  // 내 카드 목록 (예시 데이터 - 실제로는 localStorage나 props에서 가져옴)
  const defaultMyCards = [5, 3, 4, 13, 14, 15, 23, 24, 25, 95];

  // 카드 데이터를 숫자 ID로 변환하는 헬퍼 함수
  const extractCardId = (card) => {
    if (typeof card === 'object' && card !== null) {
      // 객체인 경우 id, type, 또는 숫자 값 추출
      return card.id || card.type || parseInt(Object.values(card)[0]) || 1;
    }
    // 이미 숫자인 경우 그대로 반환
    return typeof card === 'number' ? card : parseInt(card) || 1;
  };

  useEffect(() => {
    console.log('CardExchangeScreen 마운트됨');
    
    try {
      // localStorage에서 플레이어 카드 로드
      const playerCards = JSON.parse(localStorage.getItem('playerCards') || '[]');
      
      if (playerCards.length > 0) {
        console.log('localStorage에서 카드 로드:', playerCards);
        
        // 카드 데이터를 숫자 ID로 변환
        const cardIds = playerCards.map(extractCardId).slice(0, 10);
        
        console.log('추출된 카드 ID들:', cardIds);
        setMyCards(cardIds);
      } else {
        console.log('기본 카드 설정');
        setMyCards(defaultMyCards);
        localStorage.setItem('playerCards', JSON.stringify(defaultMyCards));
      }
    } catch (error) {
      console.error('localStorage 카드 데이터 로드 오류:', error);
      // 오류 발생시 기본 카드 사용
      setMyCards(defaultMyCards);
      localStorage.setItem('playerCards', JSON.stringify(defaultMyCards));
    }

    // 새로운 스킬 카드 랜덤 생성 (1~100 범위)
    generateNewSkillCard();
  }, []);

  // 카드 배열이 변경될 때마다 리렌더링
  useEffect(() => {
    console.log('내 카드 배열 업데이트됨:', myCards);
    setUpdateKey(prev => prev + 1);
  }, [myCards]);

  // 새로운 스킬 카드 생성 함수
  const generateNewSkillCard = () => {
    const skillCardId = Math.floor(Math.random() * 100) + 1; // 1~100 범위
    console.log('새 스킬 카드 생성:', skillCardId);
    setExchangeCard(skillCardId);
  };

  const handleCardSelect = (cardId) => {
    console.log('카드 선택:', cardId);
    setSelectedCard(cardId);
  };

  const handleExchange = () => {
    if (!selectedCard) {
      alert('버릴 카드를 선택해주세요!');
      return;
    }

    console.log('교체 시작 - 선택된 카드:', selectedCard, '새 카드:', exchangeCard);

    // 선택한 카드를 제거하고 새 카드를 추가
    const cardIndex = myCards.indexOf(selectedCard);
    if (cardIndex === -1) {
      alert('선택된 카드를 찾을 수 없습니다!');
      return;
    }

    // 기존 카드 배열에서 선택된 카드 제거하고 새 카드 추가
    const newCards = [...myCards];
    const oldCardId = newCards[cardIndex];
    newCards[cardIndex] = exchangeCard; // 선택된 위치에 새 카드 배치
    
    console.log('교체 전 배열:', myCards);
    console.log('교체 후 배열:', newCards);
    console.log(`${oldCardId}번 카드 → ${exchangeCard}번 카드로 교체`);
    
    // state 즉시 업데이트
    setMyCards(newCards);
    
    // 강제 리렌더링을 위한 키 업데이트
    setUpdateKey(prev => prev + 1);
    setForceUpdate(prev => prev + 1);
    
    // localStorage에 숫자 배열로 저장 (객체가 아닌 숫자만)
    try {
      localStorage.setItem('playerCards', JSON.stringify(newCards));
      console.log('localStorage 업데이트 완료:', newCards);
    } catch (error) {
      console.error('localStorage 저장 오류:', error);
    }
    
    // 약간의 지연 후 한번 더 강제 업데이트 (브라우저 캐시 대응)
    setTimeout(() => {
      setUpdateKey(prev => prev + 1);
      setForceUpdate(prev => prev + 1);
    }, 100);
    
    alert(`카드 ${oldCardId}번을 버리고 새로운 카드 ${exchangeCard}번을 획득했습니다!`);
    
    // 선택 초기화
    setSelectedCard(null);
    
    // 새로운 스킬 카드 생성
    generateNewSkillCard();
  };

  // 새 카드 뽑기 버튼 (화면 진입할 때마다 새로운 카드)
  const handleNewCard = () => {
    generateNewSkillCard();
    setSelectedCard(null); // 선택 초기화
    alert('새로운 스킬 카드를 뽑았습니다!');
  };

  // localStorage 초기화 버튼 (디버깅용)
  const handleResetCards = () => {
    setMyCards(defaultMyCards);
    localStorage.setItem('playerCards', JSON.stringify(defaultMyCards));
    setSelectedCard(null);
    setUpdateKey(prev => prev + 1);
    setForceUpdate(prev => prev + 1);
    alert('카드를 기본 상태로 초기화했습니다!');
  };

  return (
    <div className="card-exchange-wrapper">
      <div className="card-exchange-container">
        {/* 뒤로가기 버튼 */}
        <button 
          className="back-button-selector"
          onClick={() => onNavigate('selector')}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '12px 20px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            zIndex: 1000,
            fontSize: '14px'
          }}
        >
          ← River Dice - 화면 선택으로
        </button>

        {/* 배경 이미지 */}
        <div 
          className="card-exchange-background"
          style={{ 
            backgroundImage: `url(${getBackground('game')})`
          }}
        />

        {/* 제목 */}
        <div className="exchange-title">
          버릴 카드를 선택해 주세요
        </div>

        {/* 내 카드 영역 */}
        <div className="my-card-area">
          <div className="card-box-container">
            {myCards.map((cardId, index) => {
              const safeCardId = extractCardId(cardId); // 안전한 ID 추출
              const cardImage = getSkill(safeCardId); // 개별 번호별 스킬 이미지 사용
              console.log(`카드 ${safeCardId} 이미지:`, cardImage);
              
              return (
                <div
                  key={`card-${safeCardId}-${index}-${updateKey}-${forceUpdate}`}
                  className={`card-slot ${selectedCard === safeCardId ? 'selected' : ''}`}
                  style={{
                    left: `${13 + (index % 5) * 146}px`,
                    top: `${9 + Math.floor(index / 5) * 171}px`,
                    backgroundImage: `url(${cardImage}?v=${updateKey}_${forceUpdate})` // 캐시 방지
                  }}
                  onClick={() => handleCardSelect(safeCardId)}
                />
              );
            })}
          </div>
        </div>

        {/* 교체될 카드 영역 */}
        <div className="exchange-card-area">
          <div className="exchange-card-box">
            {exchangeCard && (
              <div
                className="exchange-card-slot"
                style={{
                  backgroundImage: `url(${getSkill(exchangeCard)})`
                }}
              />
            )}
            <div className="exchange-card-description">
              새로운 스킬 카드를 획득합니다
            </div>
          </div>
        </div>

        {/* 교체 버튼 */}
        <div className="exchange-button" onClick={handleExchange}>
          <div className="button-line" />
          <div className="button-body" />
          <div className="button-text">교체</div>
        </div>

        {/* 새 카드 뽑기 버튼 */}
        <button 
          className="new-card-button"
          onClick={handleNewCard}
        >
          🎲 새 카드 뽑기
        </button>

        {/* 카드 초기화 버튼 (디버깅용) */}
        <button 
          className="reset-button"
          onClick={handleResetCards}
          style={{
            position: 'absolute',
            top: '30px',
            right: '200px',
            padding: '8px 15px',
            background: 'rgba(255, 0, 0, 0.7)',
            border: '2px solid #FF0000',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            cursor: 'pointer',
            zIndex: 15
          }}
        >
          🔄 카드 초기화
        </button>

        {/* 뒤로가기 버튼 */}
        <button 
          className="back-button"
          onClick={() => onNavigate('lobby')}
        >
          ← 로비로 돌아가기
        </button>

        {/* 도움말 텍스트 */}
        <div className="help-text">
          <p>왼쪽에서 버릴 카드를 선택하고, 오른쪽 새 스킬 카드를 획득하세요!</p>
          <p style={{fontSize: '12px', marginTop: '5px', opacity: 0.7}}>
            현재 교체할 스킬: {exchangeCard}번 | 선택된 카드: {selectedCard || '없음'}
          </p>
          <p style={{fontSize: '10px', marginTop: '3px', opacity: 0.5}}>
            업데이트 키: {updateKey}-{forceUpdate} | 카드 배열: [{myCards.join(', ')}]
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardExchangeScreen;