// EventScreen.jsx
import React, { useState, useEffect } from 'react';
import { getBackground } from '../../utils/ImageManager';
import './EventScreen.css';

const EventScreen = ({ onNavigate }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [eventData, setEventData] = useState({
    title: "신비한 상인을 만났습니다",
    description: "이벤트 설명",
    options: [
      { id: 1, text: "체력 물약 구매", effect: "체력 +20" },
      { id: 2, text: "공격력 강화", effect: "공격력 +5" },
      { id: 3, text: "그냥 지나간다", effect: "아무 일도 일어나지 않음" }
    ]
  });

  useEffect(() => {
    // 랜덤 이벤트 생성 로직
    generateRandomEvent();
  }, []);

  const generateRandomEvent = () => {
    const events = [
      {
        title: "신비한 상인을 만났습니다",
        description: "이벤트 설명",
        options: [
          { id: 1, text: "체력 물약 구매", effect: "체력 +20" },
          { id: 2, text: "공격력 강화", effect: "공격력 +5" },
          { id: 3, text: "그냥 지나간다", effect: "아무 일도 일어나지 않음" }
        ]
      },
      {
        title: "고대 유적을 발견했습니다",
        description: "이벤트 설명",
        options: [
          { id: 1, text: "신중하게 탐색", effect: "행운 +3" },
          { id: 2, text: "마법 카드 획득", effect: "카드 획득" },
          { id: 3, text: "성급하게 진입", effect: "함정에 빠짐 (-10 체력)" }
        ]
      }
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    setEventData(randomEvent);
  };

  const handleOptionSelect = (optionId) => {
    const selectedOpt = eventData.options.find(opt => opt.id === optionId);
    if (selectedOpt) {
      setSelectedOption(selectedOpt);
      
      // 이벤트 효과 적용
      applyEventEffect(selectedOpt.effect);
      
      // 잠시 후 로비 화면으로 이동
      setTimeout(() => {
        onNavigate('lobby');
      }, 2000);
    }
  };

  const applyEventEffect = (effect) => {
    try {
      const playerStats = JSON.parse(localStorage.getItem('playerStats') || '{"attack": 0, "health": 100, "luck": 0}');
      
      if (effect.includes('체력')) {
        const healthChange = parseInt(effect.match(/[+-]\d+/)[0]);
        playerStats.health = Math.max(0, playerStats.health + healthChange);
      } else if (effect.includes('공격력')) {
        const attackChange = parseInt(effect.match(/[+-]\d+/)[0]);
        playerStats.attack = Math.max(0, playerStats.attack + attackChange);
      } else if (effect.includes('행운')) {
        const luckChange = parseInt(effect.match(/[+-]\d+/)[0]);
        playerStats.luck = Math.max(0, playerStats.luck + luckChange);
      }
      
      localStorage.setItem('playerStats', JSON.stringify(playerStats));
    } catch (error) {
      console.error('이벤트 효과 적용 실패:', error);
    }
  };

  const handleBackToSelector = () => {
    onNavigate('selector');
  };

  return (
    <div className="event-wrapper">
      <div className="event-container">
        {/* 뒤로가기 버튼 */}
        <button 
          className="back-button-selector"
          onClick={handleBackToSelector}
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

        {/* game 1 - 배경 이미지 */}
        <div 
          className="event-background"
          style={{ 
            backgroundImage: `url(${getBackground('event')})`
          }}
        />

        {/* game 2 - 오버레이 */}
        <div className="event-overlay" />

        {/* 이벤트 설명 - 상단 */}
        <div className="event-description">
          {eventData.title}
        </div>

        {/* 이벤트 선택지들 */}
        <div className="event-options">
          {/* 첫 번째 선택지 */}
          <div 
            className="event-option option-1"
            onClick={() => handleOptionSelect(1)}
          >
            <div className="option-background" />
            <div className="option-text">{eventData.options[0]?.text}</div>
          </div>

          {/* 두 번째 선택지 */}
          <div 
            className="event-option option-2"
            onClick={() => handleOptionSelect(2)}
          >
            <div className="option-background" />
            <div className="option-text">{eventData.options[1]?.text}</div>
          </div>

          {/* 세 번째 선택지 */}
          <div 
            className="event-option option-3"
            onClick={() => handleOptionSelect(3)}
          >
            <div className="option-background" />
            <div className="option-text">{eventData.options[2]?.text}</div>
          </div>
        </div>

        {/* 선택된 옵션 결과 표시 */}
        {selectedOption && (
          <div className="event-result">
            <div className="result-background" />
            <div className="result-text">
              {selectedOption.effect}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventScreen;