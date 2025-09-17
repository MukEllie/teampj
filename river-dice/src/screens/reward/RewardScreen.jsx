// RewardScreen.jsx
import React, { useState, useEffect } from 'react';
import { getBackground, getCard, getArtifact, getSkill } from '../../utils/ImageManager';
import './RewardScreen.css';

const RewardScreen = ({ onNavigate }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [availableRewards, setAvailableRewards] = useState([]);

  // 모든 아티팩트 ID (101~121)
  const artifactIds = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121];
  
  // 모든 스킬 ID (30~70)
  const skillIds = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70];

  // 동적 보상 생성 함수
  const generateAllRewards = () => {
    const rewards = [];
    
    // 회복 보상들 (여러 종류)
    rewards.push(
      {
        id: 'heal_small',
        type: 'heal',
        title: '회복',
        description: '체력을 회복합니다',
        effect: { type: 'heal', value: 30 },
        image: null
      },
      {
        id: 'heal_medium',
        type: 'heal',
        title: '중간 회복',
        description: '체력을 적당히 회복합니다',
        effect: { type: 'heal', value: 50 },
        image: null
      },
      {
        id: 'heal_large',
        type: 'heal',
        title: '큰 회복',
        description: '체력을 크게 회복합니다',
        effect: { type: 'heal', value: 80 },
        image: null
      },
      {
        id: 'heal_full',
        type: 'heal',
        title: '완전 회복',
        description: '체력을 완전히 회복합니다',
        effect: { type: 'heal', value: 999 },
        image: null
      }
    );

    // 카드 보상들
    const cardTypes = ['fire', 'grass', 'water', 'none'];
    cardTypes.forEach(cardType => {
      rewards.push({
        id: `card_${cardType}`,
        type: 'card',
        title: `${getCardTypeName(cardType)} 카드`,
        description: `${getCardTypeName(cardType)} 속성의 강력한 카드를 획득합니다`,
        effect: { type: 'card', element: cardType },
        image: cardType
      });
    });

    // 모든 아티팩트 보상들 (101~121)
    artifactIds.forEach(id => {
      rewards.push({
        id: `artifact_${id}`,
        type: 'artifact',
        title: `아티팩트 ${id}`,
        description: `신비한 아티팩트의 힘을 얻습니다`,
        effect: { type: 'artifact', stat: getRandomStat(), value: getRandomValue() },
        image: id
      });
    });

    // 모든 스킬 보상들 (30~70)
    skillIds.forEach(id => {
      rewards.push({
        id: `skill_${id}`,
        type: 'skill',
        title: `스킬 ${id}`,
        description: `새로운 스킬을 습득합니다`,
        effect: { type: 'skill', skillId: id, value: getRandomValue() },
        image: id
      });
    });

    return rewards;
  };

  // 카드 타입 이름 변환
  const getCardTypeName = (type) => {
    const nameMap = {
      'fire': '불의',
      'grass': '풀의',
      'water': '물의',
      'none': '무속성'
    };
    return nameMap[type] || '알 수 없는';
  };

  // 랜덤 스탯 생성
  const getRandomStat = () => {
    const stats = ['attack', 'health', 'luck', 'defense', 'magic'];
    return stats[Math.floor(Math.random() * stats.length)];
  };

  // 랜덤 수치 생성
  const getRandomValue = () => {
    return Math.floor(Math.random() * 20) + 5; // 5~25 랜덤 값
  };

  // 랜덤 보상 3개 선택 함수
  const generateRandomRewards = () => {
    const allRewards = generateAllRewards();
    const shuffled = [...allRewards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // 컴포넌트 마운트 시 랜덤 보상 3개 선택
  useEffect(() => {
    setAvailableRewards(generateRandomRewards());
  }, []);

  // 리롤 버튼 핸들러
  const handleReroll = () => {
    setSelectedCard(null); // 선택 초기화
    setAvailableRewards(generateRandomRewards());
  };

  // 카드 선택 핸들러
  const handleCardSelect = (cardId) => {
    setSelectedCard(cardId);
    
    // 선택된 카드의 효과 적용
    const card = availableRewards.find(c => c.id === cardId);
    if (card) {
      applyReward(card);
    }
  };

  // 보상 적용
  const applyReward = (card) => {
    switch (card.effect.type) {
      case 'heal':
        const currentHealth = parseInt(localStorage.getItem('playerHealth') || '100');
        const maxHealth = parseInt(localStorage.getItem('playerMaxHealth') || '100');
        const newHealth = Math.min(currentHealth + card.effect.value, maxHealth);
        localStorage.setItem('playerHealth', newHealth.toString());
        break;
      
      case 'card':
        const playerCards = JSON.parse(localStorage.getItem('playerCards') || '[]');
        playerCards.push({
          id: Date.now(),
          type: card.effect.element,
          name: card.title
        });
        localStorage.setItem('playerCards', JSON.stringify(playerCards));
        break;
      
      case 'artifact':
        const playerStats = JSON.parse(localStorage.getItem('playerStats') || '{"attack": 10, "health": 100, "luck": 3}');
        playerStats[card.effect.stat] = (playerStats[card.effect.stat] || 0) + card.effect.value;
        localStorage.setItem('playerStats', JSON.stringify(playerStats));
        
        // 체력 아티팩트의 경우 최대 체력도 업데이트
        if (card.effect.stat === 'health') {
          const newMaxHealth = playerStats.health;
          localStorage.setItem('playerMaxHealth', newMaxHealth.toString());
        }
        break;
      
      case 'skill':
        const playerSkills = JSON.parse(localStorage.getItem('playerSkills') || '[]');
        playerSkills.push({
          id: card.effect.skillId,
          name: card.title,
          value: card.effect.value
        });
        localStorage.setItem('playerSkills', JSON.stringify(playerSkills));
        break;
      
      default:
        break;
    }
  };

  // 화면 선택으로 돌아가기
  const handleBackToSelector = () => {
    onNavigate('selector');
  };

  // 계속하기 버튼
  const handleContinue = () => {
    if (selectedCard) {
      onNavigate('battle');
    } else {
      alert('보상을 선택해주세요!');
    }
  };

  // 이미지 가져오기 함수
  const getRewardImage = (reward) => {
    if (!reward.image) return null;
    
    switch (reward.type) {
      case 'card':
        return getCard(reward.image);
      case 'artifact':
        return getArtifact(reward.image);
      case 'skill':
        return getSkill(reward.image);
      default:
        return null;
    }
  };

  if (availableRewards.length === 0) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="reward-wrapper">
      <div className="reward-container">
        {/* 배경 이미지 */}
        <div 
          className="reward-background"
          style={{ 
            backgroundImage: `url(${getBackground('game')})`
          }}
        />

        {/* 화면 선택으로 돌아가기 버튼 */}
        <button 
          className="reward-back-to-selector"
          onClick={handleBackToSelector}
        >
          River Dice - 화면 선택
        </button>

        {/* 왼쪽 카드 */}
        <div 
          className={`card-box-left ${selectedCard === availableRewards[0]?.id ? 'selected' : ''}`}
          onClick={() => handleCardSelect(availableRewards[0]?.id)}
        >
          {/* 카드 내부 이미지 (있는 경우) */}
          {availableRewards[0]?.image && (
            <div 
              style={{
                position: 'absolute',
                width: '146px',
                height: '171px',
                left: '62px',
                top: '50px',
                backgroundImage: `url(${getRewardImage(availableRewards[0])})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>
        
        {/* 중앙 카드 */}
        <div 
          className={`card-box-center ${selectedCard === availableRewards[1]?.id ? 'selected' : ''}`}
          onClick={() => handleCardSelect(availableRewards[1]?.id)}
        >
          {/* 카드 내부 이미지 (있는 경우) */}
          {availableRewards[1]?.image && (
            <div 
              style={{
                position: 'absolute',
                width: '146px',
                height: '171px',
                left: '62px',
                top: '50px',
                backgroundImage: `url(${getRewardImage(availableRewards[1])})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>

        {/* 우측 카드 */}
        <div 
          className={`card-box-right ${selectedCard === availableRewards[2]?.id ? 'selected' : ''}`}
          onClick={() => handleCardSelect(availableRewards[2]?.id)}
        >
          {/* 카드 내부 이미지 (있는 경우) */}
          {availableRewards[2]?.image && (
            <div 
              style={{
                position: 'absolute',
                width: '146px',
                height: '171px',
                left: '62px',
                top: '50px',
                backgroundImage: `url(${getRewardImage(availableRewards[2])})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>

        {/* 통일된 텍스트 위치 - 각 카드 하단 중앙 */}
        <div 
          style={{
            position: 'absolute',
            width: '270px',
            left: 'calc(50% - 270px/2 - 300px)',
            top: 'calc(50% + 200px)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <div style={{ 
            fontFamily: 'SeoulNamsan', 
            fontSize: '22px', 
            color: '#EEEFF2', 
            textShadow: '0px 0px 5px #17181A',
            marginBottom: '8px'
          }}>
            {availableRewards[0]?.title}
          </div>
          <div style={{ 
            fontFamily: 'SeoulNamsan', 
            fontSize: '16px', 
            color: '#EEEFF2',
            textShadow: '0px 0px 3px #17181A'
          }}>
            {availableRewards[0]?.description}
          </div>
        </div>

        <div 
          style={{
            position: 'absolute',
            width: '270px',
            left: '505px',
            top: 'calc(50% + 200px)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <div style={{ 
            fontFamily: 'SeoulNamsan', 
            fontSize: '22px', 
            color: '#EEEFF2', 
            textShadow: '0px 0px 5px #17181A',
            marginBottom: '8px'
          }}>
            {availableRewards[1]?.title}
          </div>
          <div style={{ 
            fontFamily: 'SeoulNamsan', 
            fontSize: '16px', 
            color: '#EEEFF2',
            textShadow: '0px 0px 3px #17181A'
          }}>
            {availableRewards[1]?.description}
          </div>
        </div>

        <div 
          style={{
            position: 'absolute',
            width: '270px',
            left: '805px',
            top: 'calc(50% + 200px)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <div style={{ 
            fontFamily: 'SeoulNamsan', 
            fontSize: '22px', 
            color: '#EEEFF2', 
            textShadow: '0px 0px 5px #17181A',
            marginBottom: '8px'
          }}>
            {availableRewards[2]?.title}
          </div>
          <div style={{ 
            fontFamily: 'SeoulNamsan', 
            fontSize: '16px', 
            color: '#EEEFF2',
            textShadow: '0px 0px 3px #17181A'
          }}>
            {availableRewards[2]?.description}
          </div>
        </div>

        {/* 리롤 버튼 */}
        <button 
          className="reward-reroll-button"
          onClick={handleReroll}
          disabled={selectedCard !== null}
        >
          다시 뽑기
        </button>

        {/* 하단 버튼 - 피그마 스타일 */}
        <div className="reward-button" onClick={handleContinue}>
          <div className="reward-button-line" />
          <div className="reward-button-body" />
          <div className="reward-button-text">
            {selectedCard ? '계속하기' : '보상 선택'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardScreen;