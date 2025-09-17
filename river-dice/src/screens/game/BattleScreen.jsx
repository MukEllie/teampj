import React, { useState, useEffect } from 'react';
import './BattleScreen.css';
import { 
  getBackground,
  getCharacter,
  getCharacterSkin,
  getCard,
  getDiceImage,
  getMonster,
  getArtifact,
  getStageBackground
} from '../../utils/ImageManager';

const BattleScreen = ({ onNavigate, stageType = 'grass', monsterCount = 2, isBoss = false }) => {
  // 속성별 몬스터 매핑
  const elementMonsters = {
    fire: { 
      single: 10, 
      double: [10, 11],
      triple: [11, 10, 10] // 메인, 서브1, 서브2
    },
    water: { 
      single: 20, 
      double: [20, 21],
      triple: [21, 20, 20]
    },
    grass: { 
      single: 30, 
      double: [30, 30],
      triple: [30, 30, 30]
    }
  };

  // 속성별 몬스터 이름
  const monsterNames = {
    fire: ['불꽃 정령', '화염 정령', '마그마 정령'],
    water: ['물방울 정령', '얼음 정령', '바다 정령'],
    grass: ['나무지기', '숲지기', '거대나무']
  };

  // 게임 상태 관리
  const [gameState, setGameState] = useState({
    stage: 1,
    element: stageType,
    monsterCount: monsterCount,
    isBoss: isBoss,
    playerStats: {
      attack: 10,
      luck: 5,
      health: 100,
      maxHealth: 100
    },
    monsters: [],
    battleLog: [
      '전투가 시작되었습니다!',
      `${monsterNames[stageType][0]}${monsterCount > 1 ? '들' : ''}이 나타났습니다!`
    ]
  });

  // 이미지 상태 관리
  const [images, setImages] = useState({
    background: null,
    player: null,
    monsters: [],
    cards: [],
    artifacts: []
  });

  // 몬스터 데이터 생성 함수
  const createMonsters = (element, count) => {
    const names = monsterNames[element];
    const monsterIds = elementMonsters[element];
    
    switch (count) {
      case 1:
        return [{
          name: names[0],
          health: isBoss ? 200 : 100,
          maxHealth: isBoss ? 200 : 100,
          id: monsterIds.single
        }];
      case 2:
        return [
          {
            name: names[0],
            health: 100,
            maxHealth: 100,
            id: monsterIds.double[0]
          },
          {
            name: names[1],
            health: 100,
            maxHealth: 100,
            id: monsterIds.double[1]
          }
        ];
      case 3:
        return [
          {
            name: names[0], // 첫 번째 몬스터 (일반)
            health: 80,
            maxHealth: 80,
            id: monsterIds.triple[1]
          },
          {
            name: names[1], // 두 번째 몬스터 (일반)
            health: 80,
            maxHealth: 80,
            id: monsterIds.triple[2]
          },
          {
            name: names[2], // 세 번째 몬스터 (보스)
            health: 150,
            maxHealth: 150,
            id: monsterIds.triple[0]
          }
        ];
      default:
        return [];
    }
  };

  // 게임 상태 초기화
  useEffect(() => {
    const monsters = createMonsters(gameState.element, gameState.monsterCount);
    setGameState(prev => ({
      ...prev,
      monsters: monsters
    }));
  }, [gameState.element, gameState.monsterCount, gameState.isBoss]);

  // 이미지 로드
  useEffect(() => {
    const loadedImages = {
      background: getStageBackground(gameState.element, gameState.isBoss),
      player: getCharacter('warrior', '201'),
      monsters: gameState.monsters.map(monster => getMonster(monster.id)),
      cards: [
        getCard('grass'),
        getCard('water'),
        getCard('fire'),
        getCard('none')
      ],
      artifacts: [
        getArtifact(105),
        getArtifact(104),
        getArtifact(103),
        getArtifact(102),
        getArtifact(101),
        getArtifact(121),
        getArtifact(120),
        getArtifact(119),
        getArtifact(118),
        getArtifact(117)
      ]
    };
    setImages(loadedImages);
  }, [gameState.monsters, gameState.element, gameState.isBoss]);

  // 카드 정보
  const cardData = [
    { type: 'grass', title: '풀의 칼날', rank: 'SR' },
    { type: 'water', title: '물의 칼날', rank: 'R' },
    { type: 'fire', title: '불의 칼날', rank: 'N' },
    { type: 'none', title: '휘두르기', rank: 'N' }
  ];

  // 배경 이미지 스타일
  const backgroundStyle = images.background ? {
    backgroundImage: `url(${images.background})`
  } : {};

  // 카드 클릭 핸들러
  const handleCardClick = (cardIndex) => {
    const newLog = [...gameState.battleLog, `${cardData[cardIndex].title}을(를) 사용했습니다!`];
    setGameState(prev => ({
      ...prev,
      battleLog: newLog
    }));
  };

  // 나가기 버튼 핸들러
  const handleExit = () => {
    if (onNavigate) {
      onNavigate('characterSelect');
    }
  };

  // 스테이지 변경 핸들러 (테스트용)
  const changeStage = (element, count, boss = false) => {
    const monsters = createMonsters(element, count);
    setGameState(prev => ({
      ...prev,
      element: element,
      monsterCount: count,
      isBoss: boss,
      monsters: monsters,
      battleLog: [
        `${element} 스테이지로 변경되었습니다!`,
        `${monsters[0].name}${count > 1 ? ' 일행' : ''}이 나타났습니다!`
      ]
    }));
  };

  // 몬스터 렌더링 함수
  const renderMonsters = () => {
    const { monsterCount, monsters } = gameState;
    
    if (monsterCount === 1) {
      return (
        <>
          <div className="monster-single">
            {images.monsters[0] && (
              <img src={images.monsters[0]} alt="몬스터" />
            )}
          </div>
          <div className="monster-name-single">
            {monsters[0]?.name}
          </div>
          <div className="monster-health-bar-single">
            <div className="hp-icon" />
            <span className="hp-text">
              {monsters[0]?.health} / {monsters[0]?.maxHealth}
            </span>
            <div className="status-icons">
              <div className="status-icon" />
              <div className="status-icon" />
            </div>
          </div>
        </>
      );
    } else if (monsterCount === 2) {
      return (
        <>
          <div className="monster-1">
            {images.monsters[0] && (
              <img src={images.monsters[0]} alt="몬스터1" />
            )}
          </div>
          <div className="monster-2">
            {images.monsters[1] && (
              <img src={images.monsters[1]} alt="몬스터2" />
            )}
          </div>
          <div className="monster-name-1">
            {monsters[0]?.name}
          </div>
          <div className="monster-name-2">
            {monsters[1]?.name}
          </div>
          <div className="monster-health-bar-1">
            <div className="hp-icon" />
            <span className="hp-text">
              {monsters[0]?.health} / {monsters[0]?.maxHealth}
            </span>
            <div className="status-icons">
              <div className="status-icon" />
              <div className="status-icon" />
            </div>
          </div>
          <div className="monster-health-bar-2">
            <div className="hp-icon" />
            <span className="hp-text">
              {monsters[1]?.health} / {monsters[1]?.maxHealth}
            </span>
            <div className="status-icons">
              <div className="status-icon" />
              <div className="status-icon" />
            </div>
          </div>
        </>
      );
    } else if (monsterCount === 3) {
      return (
        <>
          {/* 첫 번째 몬스터 (좌측) */}
          <div className="monster-triple-1">
            {images.monsters[0] && (
              <img src={images.monsters[0]} alt="몬스터1" />
            )}
          </div>
          {/* 두 번째 몬스터 (중앙) */}
          <div className="monster-triple-2">
            {images.monsters[1] && (
              <img src={images.monsters[1]} alt="몬스터2" />
            )}
          </div>
          {/* 세 번째 몬스터 (우측, 보스급) */}
          <div className="monster-triple-3">
            {images.monsters[2] && (
              <img src={images.monsters[2]} alt="몬스터3" />
            )}
          </div>
          {/* 몬스터 이름들 */}
          <div className="monster-name-triple-1">
            {monsters[0]?.name}
          </div>
          <div className="monster-name-triple-2">
            {monsters[1]?.name}
          </div>
          <div className="monster-name-triple-3">
            {monsters[2]?.name}
          </div>
          {/* 몬스터 체력바들 */}
          <div className="monster-health-bar-triple-1">
            <div className="hp-icon" />
            <span className="hp-text">
              {monsters[0]?.health} / {monsters[0]?.maxHealth}
            </span>
            <div className="status-icons">
              <div className="status-icon" />
            </div>
          </div>
          <div className="monster-health-bar-triple-2">
            <div className="hp-icon" />
            <span className="hp-text">
              {monsters[1]?.health} / {monsters[1]?.maxHealth}
            </span>
            <div className="status-icons">
              <div className="status-icon" />
            </div>
          </div>
          <div className="monster-health-bar-triple-3">
            <div className="hp-icon" />
            <span className="hp-text">
              {monsters[2]?.health} / {monsters[2]?.maxHealth}
            </span>
            <div className="status-icons">
              <div className="status-icon" />
              <div className="status-icon" />
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="game-container-wrapper">
      <div className="game-container">
        {/* 배경 이미지 */}
        <div className="battle-background" style={backgroundStyle} />

        {/* 상단 아티팩트 바 */}
        <div className="artifact-bar">
          {images.artifacts.map((artifact, index) => (
            <div 
              key={index}
              className="artifact-item"
              style={{ 
                backgroundImage: artifact ? `url(${artifact})` : 'none' 
              }}
            />
          ))}
        </div>

        {/* 나가기 버튼 */}
        <div className="exit-button" onClick={handleExit}>
          나가기
        </div>

        {/* 테스트용 속성 변경 버튼들 */}
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          zIndex: 20
        }}>
          <button onClick={() => changeStage('fire', 1)} style={{fontSize: '9px', padding: '2px 4px'}}>불 1마리</button>
          <button onClick={() => changeStage('fire', 2)} style={{fontSize: '9px', padding: '2px 4px'}}>불 2마리</button>
          <button onClick={() => changeStage('fire', 3)} style={{fontSize: '9px', padding: '2px 4px'}}>불 3마리</button>
          <button onClick={() => changeStage('water', 1)} style={{fontSize: '9px', padding: '2px 4px'}}>물 1마리</button>
          <button onClick={() => changeStage('water', 2)} style={{fontSize: '9px', padding: '2px 4px'}}>물 2마리</button>
          <button onClick={() => changeStage('water', 3)} style={{fontSize: '9px', padding: '2px 4px'}}>물 3마리</button>
          <button onClick={() => changeStage('grass', 1)} style={{fontSize: '9px', padding: '2px 4px'}}>풀 1마리</button>
          <button onClick={() => changeStage('grass', 2)} style={{fontSize: '9px', padding: '2px 4px'}}>풀 2마리</button>
          <button onClick={() => changeStage('grass', 3)} style={{fontSize: '9px', padding: '2px 4px'}}>풀 3마리</button>
        </div>

        {/* 플레이어 캐릭터 */}
        <div className="player-character">
          {images.player && (
            <img src={images.player} alt="플레이어" />
          )}
        </div>

        {/* 플레이어 스탯 */}
        <div className="player-stats">
          <div className="stat-item">
            <span className="stat-label">스테이지</span>
            <span className="stat-value">{gameState.stage} ({gameState.element})</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">공격력</span>
            <span className="stat-value">{gameState.playerStats.attack}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">행운</span>
            <span className="stat-value">{gameState.playerStats.luck}</span>
          </div>
        </div>

        {/* 플레이어 체력바 */}
        <div className="player-health-bar">
          <div className="hp-icon" />
          <span className="hp-text">
            {gameState.playerStats.health} / {gameState.playerStats.maxHealth}
          </span>
          <div className="status-icons">
            <div className="status-icon" />
            <div className="status-icon" />
          </div>
        </div>

        {/* 몬스터 렌더링 - 1/2/3마리에 따라 다르게 */}
        {renderMonsters()}

        {/* 카드들 */}
        <div className="cards-container">
          {cardData.map((card, index) => (
            <div 
              key={index}
              className={`card card-${card.type}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="card-border-1" />
              <div className="card-border-2" />
              <div className="card-icon" />
              <div className="card-title">{card.title}</div>
              <div className="card-rank">
                <span className="card-rank-text">{card.rank}</span>
              </div>
              {images.cards[index] && (
                <img 
                  src={images.cards[index]} 
                  alt={card.title}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: 0.1,
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* 전투 로그 */}
        <div className="battle-log">
          <div className="log-content">
            {gameState.battleLog.map((log, index) => (
              <p key={index} style={{ margin: '5px 0' }}>{log}</p>
            ))}
            <p style={{ margin: '5px 0', fontSize: '12px', opacity: 0.7 }}>
              현재: {gameState.element} 속성, {gameState.monsterCount}마리 
              {gameState.isBoss ? ' (보스)' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleScreen;