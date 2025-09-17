// ClearScreen.jsx
import React, { useState, useEffect } from 'react';
import { getBackground } from '../../utils/ImageManager';
import './ClearScreen.css';

const ClearScreen = ({ onNavigate }) => {
  const [gameStats, setGameStats] = useState({
    finalScore: 0,
    timeElapsed: '00:00',
    enemiesDefeated: 0,
    cardsUsed: 0
  });

  useEffect(() => {
    // 게임 통계 로드 (localStorage에서)
    try {
      const stats = JSON.parse(localStorage.getItem('gameStats') || '{}');
      setGameStats({
        finalScore: stats.finalScore || Math.floor(Math.random() * 10000) + 5000,
        timeElapsed: stats.timeElapsed || '15:32',
        enemiesDefeated: stats.enemiesDefeated || Math.floor(Math.random() * 20) + 10,
        cardsUsed: stats.cardsUsed || Math.floor(Math.random() * 50) + 25
      });
    } catch (error) {
      console.error('게임 통계 로드 실패:', error);
    }
  }, []);

  const handleContinue = () => {
    // 타이틀 화면으로 이동
    onNavigate('selector');
  };

  const handleBackToSelector = () => {
    onNavigate('selector');
  };

  return (
    <div className="clear-wrapper">
      <div className="clear-container">
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

        {/* game - 배경 */}
        <div 
          className="clear-background"
          style={{ 
            backgroundImage: `url(${getBackground('game')})`
          }}
        />

        {/* VICTORY - 승리 텍스트 */}
        <div className="clear-title">
          VICTORY
        </div>

        {/* Vector - 대각선 장식들 */}
        <div className="victory-vector-left" />
        <div className="victory-vector-right" />

        {/* Line - 좌우 선들 */}
        <div className="victory-line-left" />
        <div className="victory-line-right" />

        {/* button_3_1 - 타이틀 화면으로 가기 버튼 */}
        <button className="clear-button" onClick={handleContinue}>
          <div className="clear-button-line" />
          <div className="clear-button-inner">
            <span className="clear-button-text">타이틀 화면</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ClearScreen;