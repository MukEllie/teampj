// RewardScreen.jsx - 확률 시스템과 세부 선택 기능 추가
import React, { useState, useEffect } from 'react';
import { getBackground, getCard, getArtifact, getSkill } from '../../utils/ImageManager';
import './RewardScreen.css';
import '../common_style.css';

const RewardScreen = ({ onNavigate }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [showDetailSelection, setShowDetailSelection] = useState(false);
  const [detailSelectionType, setDetailSelectionType] = useState(null);
  const [detailOptions, setDetailOptions] = useState([]);
  const [selectedDetailIndex, setSelectedDetailIndex] = useState(null);

  // 모든 아티팩트 ID (101~121)
  const artifactIds = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121];

  // 확률 기반 보상 생성 함수 (항상 2장 + 30% 아티팩트)
  const generateRewardsByProbability = () => {
    const rewards = [];
    
    // 1. 회복 보상 (무조건 포함)
    const healRewards = [
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
    ];
    
    // 랜덤 회복 보상 선택
    const randomHeal = healRewards[Math.floor(Math.random() * healRewards.length)];
    rewards.push(randomHeal);

    // 2. 스킬 보상 (무조건 포함)
    const randomSkillPreviewImage = Math.floor(Math.random() * 100) + 1; // 1~100 랜덤 이미지
    const skillReward = {
      id: 'skill_selection',
      type: 'skill',
      title: '스킬 획득',
      description: '새로운 스킬을 선택합니다',
      effect: { type: 'skill_selection' },
      image: randomSkillPreviewImage
    };
    rewards.push(skillReward);

    // 3. 아티팩트 보상 (30% 확률)
    if (Math.random() < 0.3) {
      const randomArtifactId = artifactIds[Math.floor(Math.random() * artifactIds.length)];
      const artifactReward = {
        id: 'artifact_reward',
        type: 'artifact',
        title: `아티팩트 ${randomArtifactId}`,
        description: '신비한 아티팩트의 힘을 얻습니다',
        effect: { type: 'artifact', stat: getRandomStat(), value: getRandomValue() },
        image: randomArtifactId
      };
      rewards.push(artifactReward);
    }

    return rewards;
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

  // 세부 선택 옵션 생성
  const generateDetailOptions = (type) => {
    switch (type) {
      case 'skill':
        // 랜덤한 스킬 3개 선택 (1~100)
        const skillIds = [];
        while (skillIds.length < 3) {
          const randomId = Math.floor(Math.random() * 100) + 1;
          if (!skillIds.includes(randomId)) {
            skillIds.push(randomId);
          }
        }
        
        return skillIds.map(id => ({
          id: `skill_${id}`,
          type: 'skill',
          title: `스킬 ${id}`,
          description: `새로운 스킬을 습득합니다`,
          effect: { type: 'skill', skillId: id, value: getRandomValue() },
          image: id
        }));

      default:
        return [];
    }
  };

  // 컴포넌트 마운트 시 보상 생성
  useEffect(() => {
    setAvailableRewards(generateRewardsByProbability());
  }, []);

  // 리롤 버튼 핸들러
  const handleReroll = () => {
    setSelectedCard(null);
    setShowDetailSelection(false);
    setDetailSelectionType(null);
    setDetailOptions([]);
    setSelectedDetailIndex(null);
    setAvailableRewards(generateRewardsByProbability());
  };

  // 카드 선택 핸들러
  const handleCardSelect = (rewardId) => {
    const reward = availableRewards.find(r => r.id === rewardId);
    
    if (reward && reward.type === 'skill') {
      // 세부 선택이 필요한 경우 (스킬만)
      setDetailSelectionType(reward.type);
      setDetailOptions(generateDetailOptions(reward.type));
      setShowDetailSelection(true);
      setSelectedCard(rewardId);
    } else {
      // 즉시 적용 가능한 보상 (회복, 아티팩트)
      setSelectedCard(rewardId);
      if (reward) {
        applyReward(reward);
      }
    }
  };

  // 화면 선택으로 돌아가기
  const handleBackToSelector = () => {
    onNavigate('selector');
  };

  // 세부 선택 핸들러
  const handleDetailSelect = (index) => {
    setSelectedDetailIndex(index);
    const selectedOption = detailOptions[index];
    if (selectedOption) {
      applyReward(selectedOption);
    }
  };

  // 세부 선택 확인
  const handleDetailConfirm = () => {
    if (selectedDetailIndex !== null) {
      setShowDetailSelection(false);
    } else {
      alert('옵션을 선택해주세요!');
    }
  };

  // 세부 선택 취소
  const handleDetailCancel = () => {
    setShowDetailSelection(false);
    setSelectedCard(null);
    setDetailSelectionType(null);
    setDetailOptions([]);
    setSelectedDetailIndex(null);
  };

  // 보상 적용
  const applyReward = (reward) => {
    switch (reward.effect.type) {
      case 'heal':
        const currentHealth = parseInt(localStorage.getItem('playerHealth') || '100');
        const maxHealth = parseInt(localStorage.getItem('playerMaxHealth') || '100');
        const newHealth = Math.min(currentHealth + reward.effect.value, maxHealth);
        localStorage.setItem('playerHealth', newHealth.toString());
        break;
      
      case 'skill':
        const playerSkills = JSON.parse(localStorage.getItem('playerSkills') || '[]');
        playerSkills.push({
          id: reward.effect.skillId,
          name: reward.title,
          value: reward.effect.value
        });
        localStorage.setItem('playerSkills', JSON.stringify(playerSkills));
        break;
      
      case 'artifact':
        const playerStats = JSON.parse(localStorage.getItem('playerStats') || '{"attack": 10, "health": 100, "luck": 3}');
        playerStats[reward.effect.stat] = (playerStats[reward.effect.stat] || 0) + reward.effect.value;
        localStorage.setItem('playerStats', JSON.stringify(playerStats));
        
        // 체력 아티팩트의 경우 최대 체력도 업데이트
        if (reward.effect.stat === 'health') {
          const newMaxHealth = playerStats.health;
          localStorage.setItem('playerMaxHealth', newMaxHealth.toString());
        }
        break;
      
      default:
        break;
    }
  };

  // 계속하기 버튼
  const handleContinue = () => {
    if (selectedCard && !showDetailSelection) {
      onNavigate('battle');
    } else {
      alert('보상을 선택해주세요!');
    }
  };

  // 이미지 가져오기 함수
  const getRewardImage = (reward) => {
    if (!reward.image) return null;
    
    switch (reward.type) {
      case 'skill':
        return getSkill(reward.image);
      case 'artifact':
        return getArtifact(reward.image);
      default:
        return null;
    }
  };

  if (availableRewards.length === 0) {
    return <div>로딩 중...</div>;
  }

  // 세부 선택 화면 렌더링
  if (showDetailSelection) {
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

          {/* 제목 */}
          <div style={{
            position: 'absolute',
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '32px',
            color: '#EEEFF2',
            fontFamily: 'SeoulNamsan',
            textShadow: '0px 0px 5px #17181A',
            zIndex: 10
          }}>
            스킬 선택
          </div>

          {/* 3개 옵션 카드 */}
          {detailOptions.map((option, index) => (
            <div 
              key={option.id}
              className={`detail-card-${index === 0 ? 'left' : index === 1 ? 'center' : 'right'} ${selectedDetailIndex === index ? 'selected' : ''}`}
              onClick={() => handleDetailSelect(index)}
            >
              {/* 옵션 이미지 */}
              {option.image && (
                <div 
                  style={{
                    position: 'absolute',
                    width: '146px',
                    height: '171px',
                    left: '62px',
                    top: '50px',
                    backgroundImage: `url(${getRewardImage(option)})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          ))}

          {/* 옵션 설명 텍스트 */}
          {detailOptions.map((option, index) => (
            <div 
              key={`text-${option.id}`}
              style={{
                position: 'absolute',
                width: '270px',
                left: index === 0 ? 'calc(50% - 270px/2 - 300px)' : 
                      index === 1 ? '505px' : '805px',
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
                {option.title}
              </div>
              <div style={{ 
                fontFamily: 'SeoulNamsan', 
                fontSize: '16px', 
                color: '#EEEFF2',
                textShadow: '0px 0px 3px #17181A'
              }}>
                {option.description}
              </div>
            </div>
          ))}

          {/* 확인/취소 버튼 */}
          <button 
            className="detail-confirm-button"
            onClick={handleDetailConfirm}
            disabled={selectedDetailIndex === null}
          >
            확인
          </button>

          <button 
            className="detail-cancel-button"
            onClick={handleDetailCancel}
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  // 메인 보상 선택 화면
  return (
    <div className = "screen">
      {/* 배경 이미지 */}
      <div className = "background" style = {{backgroundImage: `url(${getBackground('game')})`}}></div>
      <div className = "contents">
        <div className = "rewards">  
          
          {/* 왼쪽 카드 */}
          <div className = {`rewards_1 ${selectedCard === availableRewards[0]?.id ? 'selected' : ''}`}
              onClick={() => handleCardSelect(availableRewards[0]?.id)}>
            {/* 카드 내부 이미지 */}
            {availableRewards[0]?.image && (
            <img className="rewards_icon" src={getRewardImage(availableRewards[0])} alt="reward icon"/>)}
            <div>
              <div>{availableRewards[0]?.title}</div>
              <div>{availableRewards[0]?.description}</div>
            </div>
          </div>

          {/* 중앙 카드 */}
          <div className = {`rewards_2 ${selectedCard === availableRewards[1]?.id ? 'selected' : ''}`}
              onClick={() => handleCardSelect(availableRewards[1]?.id)}>
            {/* 카드 내부 이미지 */}
            {availableRewards[1]?.image && (
            <img className="rewards_icon" src={getRewardImage(availableRewards[1])} alt="reward icon"/>)}
            <div>
              <div>{availableRewards[1]?.title}</div>
              <div>{availableRewards[1]?.description}</div>
            </div>
          </div>

          {/* 우측 카드 */}
          {availableRewards[2] && (
            <div className={`rewards_3 ${selectedCard === availableRewards[2]?.id ? 'selected' : ''}`}
                onClick={() => handleCardSelect(availableRewards[2]?.id)}>
              {/* 카드 내부 이미지*/}
              {availableRewards[2]?.image && (
                <img className="rewards_icon" src={getRewardImage(availableRewards[2])} alt="reward icon"/>)}
              {availableRewards[2] && (
                <div>
                  <div>{availableRewards[2]?.title}</div>
                  <div>{availableRewards[2]?.description}</div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* 리롤 버튼 */}
        <button onClick={handleReroll} disabled={selectedCard !== null}> 다시 뽑기 </button>
        {/* 확인 버튼 */}
        <div className = "button" onClick = {handleContinue}>
            <div className = "button_line"></div>
            <div className = "button_violet"></div>
            <div className = "text_violet"> {selectedCard ? '계속하기' : '보상 선택'} </div>
        </div>
      </div>
    </div>
  );
};

export default RewardScreen;