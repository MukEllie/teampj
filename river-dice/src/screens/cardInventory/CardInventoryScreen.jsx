// CardInventoryScreen.jsx - 최종 완성본
import React, { useState, useEffect } from 'react';
import { getBackground, getSkill } from '../../utils/ImageManager';
import './CardInventoryScreen.css';

const CardInventoryScreen = ({ onNavigate }) => {
  const [allCards, setAllCards] = useState([]); // 보유한 모든 카드 (최대 10장)
  const [selectedCards, setSelectedCards] = useState([]); // 전투용 선택된 카드 (4장)
  const [hoveredCard, setHoveredCard] = useState(null); // 호버된 카드

  // 기본 카드 데이터
  const defaultAllCards = [5, 3, 4, 13, 14, 15, 23, 24, 25, 95];
  const defaultSelectedCards = []; // 빈 슬롯으로 시작

  useEffect(() => {
    // localStorage에서 카드 데이터 로드
    try {
      const playerCards = JSON.parse(localStorage.getItem('playerCards') || '[]');
      const battleCards = JSON.parse(localStorage.getItem('battleCards') || '[]');

      if (playerCards.length > 0) {
        setAllCards(playerCards.slice(0, 10));
      } else {
        setAllCards(defaultAllCards);
        localStorage.setItem('playerCards', JSON.stringify(defaultAllCards));
      }

      if (battleCards.length === 4) {
        setSelectedCards(battleCards);
      } else {
        setSelectedCards(defaultSelectedCards);
        localStorage.setItem('battleCards', JSON.stringify(defaultSelectedCards));
      }

      console.log('카드 인벤토리 로드됨');
      console.log('보유 카드:', playerCards);
      console.log('전투 카드:', battleCards);
    } catch (error) {
      console.error('카드 데이터 로드 오류:', error);
      setAllCards(defaultAllCards);
      setSelectedCards(defaultSelectedCards);
    }
  }, []);

  // 인벤토리 카드 클릭 - 전투용 카드로 선택/해제
  const handleCardClick = (cardId) => {
    console.log(`카드 ${cardId} 클릭됨`);
    
    if (selectedCards.includes(cardId)) {
      // 이미 선택된 카드면 제거
      const newSelected = selectedCards.filter(id => id !== cardId);
      setSelectedCards(newSelected);
      console.log(`카드 ${cardId} 선택 해제됨`);
    } else {
      // 새로 선택하는 경우
      if (selectedCards.length < 4) {
        // 4장 미만이면 빈 슬롯에 추가
        const newSelected = [...selectedCards, cardId];
        setSelectedCards(newSelected);
        console.log(`카드 ${cardId} 선택됨 (${newSelected.length}/4)`);
      } else {
        // 4장이면 가장 오래된 카드(첫 번째)를 새 카드로 교체
        const newSelected = [...selectedCards.slice(1), cardId];
        setSelectedCards(newSelected);
        console.log(`카드 ${selectedCards[0]}을 ${cardId}로 교체함`);
      }
    }
  };

  // 선택된 카드 클릭 - 전투용 카드에서 제거
  const handleSelectedCardClick = (cardId) => {
    console.log(`선택된 카드 ${cardId} 제거`);
    const newSelected = selectedCards.filter(id => id !== cardId);
    setSelectedCards(newSelected);
  };

  // 설정 저장
  const handleSave = () => {
    if (selectedCards.length !== 4) {
      alert(`전투용 카드를 정확히 4장 선택해주세요! (현재: ${selectedCards.length}장)`);
      return;
    }

    try {
      localStorage.setItem('battleCards', JSON.stringify(selectedCards));
      console.log('전투용 카드 저장됨:', selectedCards);
      alert('전투용 카드 설정이 저장되었습니다!');
      onNavigate('lobby');
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 카드가 선택되었는지 확인
  const isCardSelected = (cardId) => {
    return selectedCards.includes(cardId);
  };

  // 카드 자동 정렬 (선택된 순서대로)
  const handleAutoArrange = () => {
    // 이미 4장이면 정렬만, 부족하면 자동으로 채움
    if (selectedCards.length === 4) {
      alert('카드가 이미 4장 선택되어 있습니다.');
      return;
    }

    const availableCards = allCards.filter(cardId => !selectedCards.includes(cardId));
    const needed = 4 - selectedCards.length;
    const autoSelected = availableCards.slice(0, needed);
    
    const newSelected = [...selectedCards, ...autoSelected];
    setSelectedCards(newSelected);
    console.log('자동 정렬 완료:', newSelected);
  };

  return (
    <div className="card-inventory-wrapper">
      <div className="card-inventory-container">
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

        {/* 배경 */}
        <div 
          className="card-inventory-background"
          style={{ 
            backgroundImage: `url(${getBackground('game')})`
          }}
        />

        {/* 선택된 스킬 영역 */}
        <div className="selected-skill-section">
          <div className="selected-skill-title">선택</div>
          
          <div className="my-skill-area">
            <div className="skill-card-box">
              {[0, 1, 2, 3].map((index) => {
                const cardId = selectedCards[index];
                return (
                  <div
                    key={`selected-${index}`}
                    className={`skill-slot ${cardId ? 'has-card' : 'empty'}`}
                    data-slot={index + 1}
                    style={{
                      left: `${13 + index * 146}px`,
                      top: '9px',
                      backgroundImage: cardId ? `url(${getSkill(cardId)})` : 'none'
                    }}
                    onClick={() => cardId && handleSelectedCardClick(cardId)}
                    onMouseEnter={() => setHoveredCard(cardId)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {!cardId && (
                      <div className="empty-slot-text">빈 슬롯</div>
                    )}
                    {cardId && (
                      <div className="card-number">{cardId}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 스킬 목록 영역 */}
        <div className="skill-list-section">
          <div className="skill-list-title"></div>
          
          <div className="my-card-area">
            <div className="card-box-container">
              {allCards.map((cardId, index) => (
                <div
                  key={`card-${cardId}-${index}`}
                  className={`card-slot ${isCardSelected(cardId) ? 'selected' : ''} ${hoveredCard === cardId ? 'hovered' : ''}`}
                  data-card-id={cardId}
                  style={{
                    left: `${13 + (index % 5) * 146}px`,
                    top: `${9 + Math.floor(index / 5) * 171}px`,
                    backgroundImage: `url(${getSkill(cardId)})`
                  }}
                  onClick={() => handleCardClick(cardId)}
                  onMouseEnter={() => setHoveredCard(cardId)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="card-number">{cardId}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="save-button" onClick={handleSave}>
          <div className="button-line" />
          <div className="button-body" />
          <div className="button-text">저장</div>
        </div>

        {/* 자동 정렬 버튼 */}
        <button 
          className="auto-arrange-button"
          onClick={handleAutoArrange}
        >
          🎯 자동 선택
        </button>


        {/* 상태 정보 */}
        <div className="status-info">
          <p><strong>선택된 카드: {selectedCards.length}/4</strong></p>
          <p>전투용 카드: [{selectedCards.join(', ')}]</p>
          <p>보유 카드: [{allCards.join(', ')}]</p>
          {hoveredCard && <p>🔍 호버중: {hoveredCard}번 카드</p>}
          <div className="help-text">
            <small>💡 하단에서 카드를 클릭하여 전투용으로 선택하세요!</small><br/>
            <small>💡 상단에서 카드를 클릭하여 선택을 해제할 수 있습니다.</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardInventoryScreen;