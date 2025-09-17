// LobbyScreen.jsx
import React, { useState, useEffect } from 'react';
import { getBackground, getCharacter, getSkill, getArtifact, getStatusEffect, getUIImage } from '../../utils/ImageManager';
import './LobbyScreen.css';

const LobbyScreen = ({ onNavigate }) => {
  const [playerData, setPlayerData] = useState({
    name: '플레이어',
    level: 1,
    health: 100,
    maxHealth: 100,
    attack: 0,
    luck: 0,
    character: 201
  });

  // 플레이어 데이터 로드
  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = () => {
    const health = localStorage.getItem('playerHealth') || '100';
    const maxHealth = localStorage.getItem('playerMaxHealth') || '100';
    const stats = JSON.parse(localStorage.getItem('playerStats') || '{"attack": 0, "health": 100, "luck": 0}');
    const selectedCharacter = localStorage.getItem('selectedCharacter') || '201';
    const stage = localStorage.getItem('currentStage') || '1';
    
    setPlayerData({
      name: '플레이어',
      stage: parseInt(stage),
      health: parseInt(health),
      maxHealth: parseInt(maxHealth),
      attack: stats.attack || 0,
      luck: stats.luck || 0,
      character: parseInt(selectedCharacter)
    });
  };

  return (
    <div className="lobby-wrapper">
      <div className="lobby-container">
        {/* 배경 이미지 */}
        <div 
          className="lobby-background"
          style={{ 
            backgroundImage: `url(${getBackground('camp')})`
          }}
        />

        {/* 아티팩트 - 상단 좌측 가로 배열 */}
        <div className="artifact-container">
          {[101, 102, 103, 104, 105, 106, 107, 108, 109, 110].map((id, index) => (
            <div 
              key={id}
              className="artifact-item"
              style={{
                backgroundImage: `url(${getArtifact(id)})`
              }}
            />
          ))}
        </div>

        {/* 나가기 버튼 */}
        <div 
          className="exit-button"
          onClick={() => onNavigate('selector')}
        >
          나가기
        </div>

        {/* 캐릭터 - 좌측 */}
        <div className="character-display">
          <div 
            className="character-image"
            style={{
              backgroundImage: `url(${getCharacter(playerData.character)})`
            }}
          />
        </div>

        {/* 텐트 - 중앙 */}
        <div className="tent-area">
          {/* 텐트는 배경 이미지에 포함되어 있으므로 위치만 잡아줌 */}
        </div>

        {/* 스킬 카드들 - 하단 */}
        <div className="skill-container">
          {[1, 11, 21, 91].map((skillId, index) => (
            <div 
              key={skillId}
              className="skill-card"
              style={{
                backgroundImage: `url(${getSkill(skillId)})`
              }}
            />
          ))}
        </div>

        {/* 버튼들 - 우측 하단 */}
        <div className="game-buttons">
          <button 
            className="game-button button-1"
            onClick={() => onNavigate('battle')}
          >
            <div className="button-line" />
            <div className="button-inner">
              <span className="button-text">게임 시작</span>
            </div>
          </button>
          
          <button 
            className="game-button button-2"
            onClick={() => onNavigate('cardInventory')}
          >
            <div className="button-line" />
            <div className="button-inner">
              <span className="button-text">카드 인벤토리</span>
            </div>
          </button>
        </div>

        {/* 캐릭터 정보창 - 우측 하단 */}
        <div className="character-info">
          <div className="info-background" />
          
          {/* 체력 + 상태이상 */}
          <div className="health-status">
            <div 
              className="hp-icon"
              style={{
                backgroundImage: `url(${getUIImage('hpBar')})`
              }}
            />
            <div className="hp-text">{playerData.health} / {playerData.maxHealth}</div>
            <div 
              className="status-burn"
              style={{
                backgroundImage: `url(${getStatusEffect('burn')})`
              }}
            />
            <div 
              className="status-stun"
              style={{
                backgroundImage: `url(${getStatusEffect('stun')})`
              }}
            />
          </div>

          {/* 스테이지 */}
          <div className="info-row info-stage">
            <span className="info-label">스테이지</span>
            <span className="info-value">{playerData.stage}</span>
          </div>

          {/* 공격력 */}
          <div className="info-row info-attack">
            <span className="info-label">공격력</span>
            <span className="info-value">{playerData.attack}</span>
          </div>

          {/* 행운 */}
          <div className="info-row info-luck">
            <span className="info-label">행운</span>
            <span className="info-value">{playerData.luck}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;