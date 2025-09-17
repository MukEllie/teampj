// CharacterSelectScreen.jsx
import React, { useState } from 'react';
import { getBackground, getCharacter, getCharacterSkin } from '../../utils/ImageManager';
import './CharacterSelectScreen.css';

const CharacterSelectScreen = ({ onNavigate }) => {
  const [selectedCharacter, setSelectedCharacter] = useState('warrior');
  const [selectedSkin, setSelectedSkin] = useState('101');
  
  // 캐릭터 데이터 - 스킨 2개만, 이름 제거
  const characters = {
    warrior: {
      name: '전사',
      skins: [
        { id: '101', name: 'Basic' },
        { id: '201', name: 'Iron Knight' }
      ],
      stats: { health: 150, attack: 12, luck: 3 }
    },
    mage: {
      name: '도적',
      skins: [
        { id: '101', name: 'Basic' },
        { id: '201', name: 'shadow' }
      ],
      stats: { health: 80, attack: 18, luck: 5 }
    },
    thief: {
      name: '마법사',
      skins: [
        { id: '101', name: 'Basic' },
        { id: '201', name: 'Arcane' }
      ],
      stats: { health: 100, attack: 15, luck: 8 }
    }
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    // 캐릭터 변경 시 첫 번째 스킨으로 자동 선택
    setSelectedSkin(characters[character].skins[0].id);
  };

  const handleSkinSelect = (skinId) => {
    setSelectedSkin(skinId);
  };

  const handleStartGame = () => {
    // 선택한 캐릭터 정보 저장
    localStorage.setItem('selectedCharacter', JSON.stringify({
      type: selectedCharacter,
      skin: selectedSkin,
      stats: characters[selectedCharacter].stats
    }));
    onNavigate('battle');
  };

  const handleBack = () => {
    onNavigate('title');
  };

  const currentCharacter = characters[selectedCharacter];
  const currentSkinData = currentCharacter.skins.find(skin => skin.id === selectedSkin);

  return (
    <div className="char-select-wrapper">
      <div className="char-select-container">
        {/* 배경 이미지 */}
        <div 
          className="char-select-background"
          style={{ backgroundImage: `url(${getBackground('characterSelect')})` }}
        />

        {/* 뒤로가기 버튼 */}
        <button className="char-select-back-button" onClick={handleBack}>
          <div className="char-back-button-1"></div>
          <div className="char-back-button-2"></div>
          <div className="char-back-button-3"></div>
          <div className="char-back-arrow">←</div>
        </button>

        {/* 우측 정보 패널 */}
        <div className="char-info-panel">
          <div className="char-character-name">{currentCharacter.name}</div>
          <div className="char-skin-name">{currentSkinData.name}</div>
          
          <div className="char-stats-container">
            <div className="char-stat-row">
              <span className="char-stat-label">공격력</span>
              <span className="char-stat-value">{currentCharacter.stats.attack}</span>
            </div>
            <div className="char-stat-row">
              <span className="char-stat-label">체력</span>
              <span className="char-stat-value">{currentCharacter.stats.health}</span>
            </div>
            <div className="char-stat-row">
              <span className="char-stat-label">행운</span>
              <span className="char-stat-value">{currentCharacter.stats.luck}</span>
            </div>
          </div>

          {/* 스킨 미리보기 */}
          <div className="char-skin-preview">
            <img 
              src={getCharacterSkin(selectedCharacter, selectedSkin)} 
              alt={`${currentCharacter.name} 스킨`}
            />
          </div>
        </div>

        {/* 독립적인 시작 버튼 - 정보 패널 밖에서 자유롭게 위치 */}
        <div className="char-select-start-button" onClick={handleStartGame}>
          <div className="char-button-line" />
          <div className="char-button char-button-pink" />
          <span className="char-button-text">시작</span>
        </div>

        {/* 캐릭터 선택 버튼들 - 독립 배치 */}
        <div className="char-class-buttons-container">
          <button 
            className={`char-class-button ${selectedCharacter === 'warrior' ? 'active' : ''}`}
            onClick={() => handleCharacterSelect('warrior')}
          >
            전사
          </button>
          <button 
            className={`char-class-button ${selectedCharacter === 'mage' ? 'active' : ''}`}
            onClick={() => handleCharacterSelect('mage')}
          >
            도적
          </button>
          <button 
            className={`char-class-button ${selectedCharacter === 'thief' ? 'active' : ''}`}
            onClick={() => handleCharacterSelect('thief')}
          >
            마법사
          </button>
        </div>

        {/* 중앙 캐릭터 디스플레이 - 반응형 크기 */}
        <div className="char-character-display">
          <img 
            src={getCharacter(selectedCharacter, selectedSkin)} 
            alt={currentCharacter.name}
            className="char-main-image"
          />
        </div>

        {/* 하단 선택 패널 - 스킨만 표시, 이름 없이 */}
        <div className="char-selection-panel">
          <div className="char-skin-gallery">
            {currentCharacter.skins.map((skin) => (
              <div 
                key={skin.id}
                className={`char-skin-item ${selectedSkin === skin.id ? 'active' : ''}`}
                onClick={() => handleSkinSelect(skin.id)}
              >
                <img 
                  src={getCharacterSkin(selectedCharacter, skin.id)} 
                  alt={skin.name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectScreen;