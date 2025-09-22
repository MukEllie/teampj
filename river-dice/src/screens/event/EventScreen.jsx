// EventScreen.jsx - 단순화된 이벤트 시스템
import React, { useState, useEffect } from 'react';
import { getBackground, getSkill } from '../../utils/ImageManager';
import './EventScreen.css';

const EventScreen = ({ onNavigate }) => {
  const [eventData, setEventData] = useState(null);
  const [showSkillSelection, setShowSkillSelection] = useState(false);
  const [skillOptions, setSkillOptions] = useState([]);
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(null);

  // 아티팩트 ID 배열 (101~121)
  const artifactIds = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121];

  useEffect(() => {
    // 랜덤 이벤트 자동 발생
    generateRandomEvent();
  }, []);

  const generateRandomEvent = () => {
    // 3가지 이벤트 타입
    const eventTypes = [
      { type: 'artifact', weight: 40 },  // 40% - 아티팩트 획득
      { type: 'skill', weight: 35 },     // 35% - 스킬 획득
      { type: 'trap', weight: 25 }       // 25% - 함정 데미지
    ];

    const selectedType = getRandomEventType(eventTypes);
    const event = generateEventByType(selectedType);
    setEventData(event);

    // 스킬 이벤트인 경우 스킬 선택 화면 표시
    if (selectedType === 'skill') {
      generateSkillOptions();
      setShowSkillSelection(true);
    } else {
      // 아티팩트나 함정은 자동으로 효과 적용 후 이동
      applyEventEffect(event);
      setTimeout(() => {
        onNavigate('lobby');
      }, 3000);
    }
  };

  const getRandomEventType = (eventTypes) => {
    const totalWeight = eventTypes.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const eventType of eventTypes) {
      random -= eventType.weight;
      if (random <= 0) {
        return eventType.type;
      }
    }
    return eventTypes[0].type;
  };

  const generateEventByType = (type) => {
    switch (type) {
      case 'artifact':
        return generateArtifactEvent();
      case 'skill':
        return generateSkillEvent();
      case 'trap':
        return generateTrapEvent();
      default:
        return generateArtifactEvent();
    }
  };

  // 아티팩트 획득 이벤트
  const generateArtifactEvent = () => {
    const randomArtifact = artifactIds[Math.floor(Math.random() * artifactIds.length)];
    const statTypes = ['attack', 'health', 'luck', 'defense', 'magic'];
    const randomStat = statTypes[Math.floor(Math.random() * statTypes.length)];
    const statBonus = Math.floor(Math.random() * 15) + 5; // 5~20 보너스

    return {
      type: 'artifact',
      title: '신비한 아티팩트를 발견했습니다!',
      description: `고대의 힘이 깃든 아티팩트 ${randomArtifact}를 획득했습니다.`,
      result: `아티팩트 ${randomArtifact} 획득! ${getStatName(randomStat)} +${statBonus}`,
      artifactId: randomArtifact,
      stat: randomStat,
      value: statBonus
    };
  };

  // 스킬 획득 이벤트
  const generateSkillEvent = () => {
    return {
      type: 'skill',
      title: '고대 마법서를 발견했습니다!',
      description: '마법서에서 새로운 스킬을 배울 수 있습니다. 어떤 스킬을 선택하시겠습니까?',
      result: null // 선택 후 결정
    };
  };

  // 함정 데미지 이벤트
  const generateTrapEvent = () => {
    const trapTypes = [
      { name: '함정에 빠졌습니다!', damage: 15, description: '갑자기 바닥이 무너지며 구덩이에 떨어졌습니다.' },
      { name: '독가스 함정!', damage: 12, description: '숨겨진 함정에서 독가스가 분출됩니다.' },
      { name: '가시 함정!', damage: 18, description: '숨겨진 가시가 튀어나와 상처를 입었습니다.' },
      { name: '마법 함정!', damage: 10, description: '마법 함정이 발동되어 에너지를 빼앗겼습니다.' }
    ];

    const randomTrap = trapTypes[Math.floor(Math.random() * trapTypes.length)];

    return {
      type: 'trap',
      title: randomTrap.name,
      description: randomTrap.description,
      result: `체력이 ${randomTrap.damage} 감소했습니다...`,
      damage: randomTrap.damage
    };
  };

  // 스킬 선택 옵션 생성
  const generateSkillOptions = () => {
    const skillIds = [];
    while (skillIds.length < 3) {
      const randomId = Math.floor(Math.random() * 100) + 1;
      if (!skillIds.includes(randomId)) {
        skillIds.push(randomId);
      }
    }

    const options = skillIds.map(id => ({
      id: id,
      name: `스킬 ${id}`,
      description: '새로운 스킬을 습득합니다',
      value: Math.floor(Math.random() * 20) + 5 // 5~25 효과값
    }));

    setSkillOptions(options);
  };

  // 스킬 선택 핸들러
  const handleSkillSelect = (index) => {
    setSelectedSkillIndex(index);
    const selectedSkill = skillOptions[index];
    
    // 스킬 적용
    const playerSkills = JSON.parse(localStorage.getItem('playerSkills') || '[]');
    playerSkills.push({
      id: selectedSkill.id,
      name: selectedSkill.name,
      value: selectedSkill.value
    });
    localStorage.setItem('playerSkills', JSON.stringify(playerSkills));

    // 결과 표시 업데이트
    setEventData(prev => ({
      ...prev,
      result: `${selectedSkill.name}을 습득했습니다!`
    }));

    // 스킬 선택 화면 닫기
    setShowSkillSelection(false);

    // 3초 후 로비로 이동
    setTimeout(() => {
      onNavigate('lobby');
    }, 3000);
  };

  // 스탯 이름 변환
  const getStatName = (stat) => {
    const nameMap = {
      'attack': '공격력',
      'health': '체력',
      'luck': '행운',
      'defense': '방어력',
      'magic': '마법력'
    };
    return nameMap[stat] || stat;
  };

  // 이벤트 효과 적용
  const applyEventEffect = (event) => {
    try {
      const playerStats = JSON.parse(localStorage.getItem('playerStats') || '{"attack": 10, "health": 100, "luck": 3}');
      
      switch (event.type) {
        case 'artifact':
          playerStats[event.stat] = (playerStats[event.stat] || 0) + event.value;
          
          // 체력 아티팩트의 경우 최대 체력도 업데이트
          if (event.stat === 'health') {
            const currentHealth = parseInt(localStorage.getItem('playerHealth') || '100');
            const newMaxHealth = playerStats.health;
            localStorage.setItem('playerMaxHealth', newMaxHealth.toString());
            // 현재 체력도 증가
            localStorage.setItem('playerHealth', Math.min(currentHealth + event.value, newMaxHealth).toString());
          }
          break;
          
        case 'trap':
          const currentHealth = parseInt(localStorage.getItem('playerHealth') || '100');
          const newHealth = Math.max(0, currentHealth - event.damage);
          localStorage.setItem('playerHealth', newHealth.toString());
          break;
          
        default:
          break;
      }
      
      localStorage.setItem('playerStats', JSON.stringify(playerStats));
    } catch (error) {
      console.error('이벤트 효과 적용 실패:', error);
    }
  };

  const handleBackToSelector = () => {
    onNavigate('selector');
  };

  if (!eventData) {
    return <div>이벤트 로딩 중...</div>;
  }

  // 스킬 선택 화면 렌더링
  if (showSkillSelection) {
    return (
      <div className="event-wrapper">
        <div className="event-container">
          {/* 배경 이미지 */}
          <div 
            className="event-background"
            style={{ 
              backgroundImage: `url(${getBackground('event')})`
            }}
          />
          <div className="event-overlay" />

          {/* 제목 */}
          <div style={{
            position: 'absolute',
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '28px',
            color: '#EEEFF2',
            fontFamily: 'SeoulNamsan',
            textShadow: '0px 0px 5px #17181A',
            zIndex: 10,
            textAlign: 'center'
          }}>
            스킬을 선택하세요
          </div>

          {/* 3개 스킬 선택 카드 */}
          {skillOptions.map((skill, index) => (
            <div 
              key={skill.id}
              className={`skill-card skill-card-${index === 0 ? 'left' : index === 1 ? 'center' : 'right'} ${selectedSkillIndex === index ? 'selected' : ''}`}
              onClick={() => handleSkillSelect(index)}
              style={{
                position: 'absolute',
                width: '270px',
                height: '360px',
                left: index === 0 ? 'calc(50% - 270px/2 - 300px)' : 
                      index === 1 ? '505px' : '805px',
                top: 'calc(50% - 360px/2 - 30px)',
                background: '#17181A',
                opacity: selectedSkillIndex === index ? 1 : 0.8,
                boxShadow: selectedSkillIndex === index ? '0px 15px 25px rgba(148, 128, 233, 0.6)' : '0px 0px 8px #17181A',
                border: selectedSkillIndex === index ? '3px solid #9480E9' : '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: 5
              }}
            >
              {/* 스킬 이미지 */}
              <div 
                style={{
                  position: 'absolute',
                  width: '146px',
                  height: '171px',
                  left: '62px',
                  top: '50px',
                  backgroundImage: `url(${getSkill(skill.id)})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  pointerEvents: 'none'
                }}
              />
              
              {/* 스킬 정보 */}
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                color: '#EEEFF2',
                fontFamily: 'SeoulNamsan',
                textShadow: '0px 0px 5px #17181A'
              }}>
                <div style={{ fontSize: '18px', marginBottom: '5px' }}>
                  {skill.name}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  효과: {skill.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 메인 이벤트 발생 화면
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

        {/* 배경 이미지 */}
        <div 
          className="event-background"
          style={{ 
            backgroundImage: `url(${getBackground('event')})`
          }}
        />

        {/* 오버레이 */}
        <div className="event-overlay" />

        {/* 이벤트 타입 표시 */}
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '20px',
          padding: '8px 16px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#FFD700',
          borderRadius: '20px',
          fontSize: '14px',
          fontFamily: 'SeoulNamsan',
          zIndex: 1000
        }}>
          {eventData.type === 'artifact' && '🎁 아티팩트 발견!'}
          {eventData.type === 'skill' && '📜 스킬 발견!'}
          {eventData.type === 'trap' && '⚠️ 함정 발생!'}
        </div>

        {/* 이벤트 제목 */}
        <div style={{
          position: 'absolute',
          top: '200px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '32px',
          color: '#EEEFF2',
          fontFamily: 'SeoulNamsan',
          textShadow: '0px 0px 5px #17181A',
          textAlign: 'center',
          zIndex: 10,
          maxWidth: '800px'
        }}>
          {eventData.title}
        </div>

        {/* 이벤트 설명 */}
        <div style={{
          position: 'absolute',
          top: '260px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '18px',
          color: '#CCCCCC',
          fontFamily: 'SeoulNamsan',
          textShadow: '0px 0px 3px #17181A',
          textAlign: 'center',
          zIndex: 10,
          maxWidth: '600px',
          lineHeight: '1.5'
        }}>
          {eventData.description}
        </div>

        {/* 이벤트 결과 표시 */}
        {eventData.result && (
          <div style={{
            position: 'absolute',
            width: '500px',
            height: '100px',
            left: 'calc(50% - 250px)',
            top: '350px',
            background: 'rgba(23, 24, 26, 0.95)',
            border: '2px solid #FFD700',
            borderRadius: '15px',
            boxShadow: '0px 0px 20px rgba(255, 215, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}>
            <div style={{
              fontSize: '20px',
              color: '#FFD700',
              fontFamily: 'SeoulNamsan',
              textShadow: '0px 0px 5px #17181A',
              textAlign: 'center',
              padding: '0 20px'
            }}>
              {eventData.result}
            </div>
          </div>
        )}

        {/* 진행 상태 표시 */}
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '16px',
          color: '#AAAAAA',
          fontFamily: 'SeoulNamsan',
          textAlign: 'center',
          zIndex: 10
        }}>
          {eventData.type === 'skill' && !showSkillSelection ? 
            '스킬 옵션을 준비하고 있습니다...' : 
            '잠시 후 로비로 돌아갑니다...'
          }
        </div>
      </div>
    </div>
  );
};

export default EventScreen;