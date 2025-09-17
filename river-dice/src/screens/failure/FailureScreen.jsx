// FailureScreen.jsx
import React, { useState, useEffect } from 'react';
import { getBackground } from '../../utils/ImageManager';
import './FailureScreen.css';

const FailureScreen = ({ onNavigate }) => {
  const [gameStats, setGameStats] = useState({
    survivedTime: '00:00',
    enemiesDefeated: 0,
    highestDamage: 0,
    cardsUsed: 0,
    cause: 'Unknown'
  });

  useEffect(() => {
    // 게임 통계 로드 (localStorage에서)
    try {
      const stats = JSON.parse(localStorage.getItem('lastGameStats') || '{}');
      setGameStats({
        survivedTime: stats.survivedTime || '08:15',
        enemiesDefeated: stats.enemiesDefeated || Math.floor(Math.random() * 10) + 3,
        highestDamage: stats.highestDamage || Math.floor(Math.random() * 200) + 50,
        cardsUsed: stats.cardsUsed || Math.floor(Math.random() * 30) + 10,
        cause: stats.cause || '강력한 적에게 패배'
      });
    } catch (error) {
      console.error('게임 통계 로드 실패:', error);
    }
  }, []);

  const handleRetry = () => {
    // 타이틀 화면으로 이동
    onNavigate('selector');
  };

  const handleBackToSelector = () => {
    onNavigate('selector');
  };

  return (
    <div className="failure-wrapper">
      <div className="failure-container">
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
          className="failure-background"
          style={{ 
            backgroundImage: `url(${getBackground('game')})`
          }}
        />

        {/* Game Over - 실패 텍스트 */}
        <div className="failure-title">
          Game Over
        </div>

        {/* Vector - 대각선 장식들 */}
        <div className="failure-vector-left" />
        <div className="failure-vector-right" />

        {/* Line - 좌우 선들 */}
        <div className="failure-line-left" />
        <div className="failure-line-right" />

        {/* button_1_1 - 타이틀 화면으로 가기 버튼 */}
        <button className="failure-button" onClick={handleRetry}>
          <div className="failure-button-line" />
          <div className="failure-button-inner">
            <span className="failure-button-text">타이틀 화면</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default FailureScreen;