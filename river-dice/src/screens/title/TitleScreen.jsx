// TitleScreen.jsx
import React from 'react';
import { getBackground } from '../../utils/ImageManager';
import './TitleScreen.css';

const TitleScreen = ({ onNavigate }) => {
  const handleStartGame = () => {
    console.log('게임 시작');
    onNavigate('characterSelect');
  };

  const handleLoadGame = () => {
    console.log('게임 이어하기');
    const savedGame = localStorage.getItem('savedGame');
    if (savedGame) {
      onNavigate('battle');
    } else {
      alert('저장된 게임이 없습니다.');
    }
  };

  const handleSettings = () => {
    console.log('설정 열기');
    alert('설정 기능은 준비 중입니다.');
  };

  const handleBackToSelector = () => {
    onNavigate('selector');
  };

  return (
    <div className="title-wrapper">
      {/* 뒤로가기 버튼 */}
      <button 
        className="title-back-to-selector"
        onClick={handleBackToSelector}
        aria-label="화면 선택으로 돌아가기"
      >
        ← 화면 선택
      </button>

      <div className="title-container">
        {/* 배경 이미지 */}
        <div 
          className="title-background title-background-fixed"
          style={{ 
            backgroundImage: `url(${getBackground('title')})`
          }}
        />
        
        {/* 버튼 그룹 */}
        <div className="title-button-group">
          {/* 시작하기 버튼 */}
          <div className="title-button-wrapper title-start-button" onClick={handleStartGame}>
            <div className="title-button-line" />
            <div className="title-button title-button-pink" />
            <span className="title-button-text">시작하기</span>
          </div>
          
          {/* 이어하기 버튼 */}
          <div className="title-button-wrapper title-load-button" onClick={handleLoadGame}>
            <div className="title-button-line" />
            <div className="title-button title-button-purple" />
            <span className="title-button-text">이어하기</span>
          </div>
          
          {/* 설정 버튼 */}
          <div className="title-button-wrapper title-settings-button" onClick={handleSettings}>
            <div className="title-button-line" />
            <div className="title-button title-button-blue" />
            <span className="title-button-text">설정</span>
          </div>
        </div>
        
        {/* 버전 정보 */}
        <div className="title-demo-version">demo ver 0.0.1</div>
      </div>
    </div>
  );
};

export default TitleScreen;