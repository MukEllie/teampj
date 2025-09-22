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

const BattleScreen = ({ onNavigate, stageType = 'grass', monsterCount = 2, isBoss = false, playerID = 'testPlayer' }) => {
  // 속성별 몬스터 매핑(우선 백업)
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

  // 게임 상태 관리 (구조 유지, 초기값만 수정)
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
    battleLog: ['전투 준비 중...']
  });

  // 이미지 상태 관리 (기존 구조 유지)
  const [images, setImages] = useState({
    background: null,
    player: null,
    monsters: [],
    cards: [],
    artifacts: []
  });

  // API 로딩 상태 추가
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // 몬스터 클릭 시스템 상태 추가
  const [targetSelectionMode, setTargetSelectionMode] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [hoveredMonsterIndex, setHoveredMonsterIndex] = useState(null);

  // 플레이어 스킬 상태 추가
  const [playerSkills, setPlayerSkills] = useState([]);

  // 백엔드 API 호출 함수
  const startBattleAPI = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const response = await fetch(`http://localhost:8090/battle/start?PlayerID=${playerID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('전투 시작 API 응답 :', data);

      // API 응답 데이터로 게임 상태 업데이트
      if (data.battleStatus && data.initResult) {
        updateGameStateFromAPI(data);
      }

    } catch (error) {
      console.error('전투 시작 API 에러 : ', error);
      setApiError(error.message);
      // 에러 시 기존 하드코딩된 데이터로 폴백
      initializeWithFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  // API 응답으로 게임 상태 업데이트
  const updateGameStateFromAPI = async (apiData) => {
    const { battleStatus, initResult } = apiData;

    // 플레이어 정보 업데이트
    const playerHp = battleStatus.playerHp || gameState.playerStats.health;

    // 몬스터 정보 업데이트 (aliveMonsters에서 가져오기)
    const monsters = (battleStatus.aliveMonsters || []).map((monster, index) => ({
      name: monster.name || `몬스터 ${index + 1}`,
      health: monster.currentHp || 100,
      maxHealth: monster.maxHp || 100,
      id: monster.id || (index + 10)
    }));

    // 전투 로그 업데이트
    const battleLog = [
      '전투가 시작되었습니다!',
      apiData.message || '전투 준비 완료',
      ...(initResult.battleLog || []).map(log => log.message || log.toString())
    ];

    setGameState(prev => ({
      ...prev,
      playerStats: {
        ...prev.playerStats,
        health: playerHp,
        maxHealth: playerHp // API에서 maxHp를 따로 주지 않는다면 현재 HP로 설정
      },
      monsters: monsters,
      monsterCount: monsters.length,
      battleLog: battleLog
    }));

    // 플레이어 스킬 로드
    const skills = await fetchPlayerSkills();
    if (skills) {
      setPlayerSkills(skills);
      console.log('플레이어 스킬 로드 완료:', skills);
    } else {
      console.warn('플레이어 스킬 로드 실패, 하드코딩 데이터 사용');
      setPlayerSkills([]); // 빈 배열로 설정하여 하드코딩 데이터 사용
    }
  };

  // 폴백 데이터로 초기화 (기존 로직 유지)
  const initializeWithFallbackData = async () => {
    const monsters = createMonsters(gameState.element, gameState.monsterCount);
    setGameState(prev => ({
      ...prev,
      monsters: monsters,
      battleLog: [
        '전투가 시작되었습니다! (오프라인 모드)',
        `${monsterNames[gameState.element][0]}${gameState.monsterCount > 1 ? '들' : ''}이 나타났습니다!`
      ]
    }));

    // 오프라인 모드에서도 스킬 로드 시도
    const skills = await fetchPlayerSkills();
    if (skills) {
      setPlayerSkills(skills);
      console.log('오프라인 모드에서 스킬 로드 성공 : ', skills);
    } else {
      console.warn('오프라인 모드 : 하드코딩 스킬 데이터 사용');
      setPlayerSkills([]); // 빈 배열로 설정
    }
  };

  // 기존 몬스터 생성 함수 (폴백용으로 유지)
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

  // 플레이어 스킬 목록 API 호출 함수
  const fetchPlayerSkills = async () => {
    try {
      const response = await fetch(`http://localhost:8090/battle/skills/battle?PlayerID=${playerID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status : ${response.status}`);
      }

      const data = await response.json();
      console.log('플레이어 스킬 API 응답 : ', data);

      return data.skills || [];
    } catch (error) {
      console.error('플레이어 스킬 API 에러 : ', error);
      return null;
    }
  }
  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    startBattleAPI();
  }, [playerID]);

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

  // 기존 함수들 유지
  // 카드 정보
  const cardData = [
    { type: 'grass', title: '풀의 칼날', rank: 'SR' },
    { type: 'water', title: '물의 칼날', rank: 'R' },
    { type: 'fire', title: '불의 칼날', rank: 'N' },
    { type: 'none', title: '휘두르기', rank: 'N' }
  ];

  // 실제 사용할 카드 데이터 결정 (API 스킬이 있으면 사용, 없으면 하드코딩)
  const currentCardData = playerSkills.length > 0 ? playerSkills.map((skill, index) => ({
    id: skill.skillID,
    type: skill.element?.toLowerCase() || 'none',
    title: skill.name || `스킬 ${index + 1}`,
    rank: skill.rarity || 'N',
    targetType: skill.target || 'Pick',
    description: skill.description || '',
    damage: skill.damage || '0~0'
  })) : cardData;

  const handleMonsterClick = (monsterIndex) => {
    console.log(`몬스터 ${monsterIndex} 클릭됨 : `, gameState.monsters[monsterIndex]);

    if (targetSelectionMode && selectedSkill) {
      executeSkill(selectedSkill, monsterIndex);
    } else {
      console.log('몬스터 정보 : ', gameState.monsters[monsterIndex]);
    }
  };

  const executeSkill = async (skill, targetIndex = null) => {
    try {
      console.log('스킬 사용 : ', skill, '타겟 : ', targetIndex);

      const response = await fetch(`http://localhost:8090/battle/battle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          PlayerID: playerID,
          SkillID: skill.id,
          targetIndex: targetIndex
        })
      });

      const newLog = [
        ...gameState.battleLog,
        `${skill.title}를 사용했습니다!` + (targetIndex !== null ? ` (대상 : ${gameState.monsters[targetIndex]?.name})` : '')
      ];

      setGameState(prev => ({
        ...prev,
        battleLog: newLog
      }));

      // 타겟 선택 모드 해제
      setTargetSelectionMode(false);
      setSelectedSkill(null);
      setHoveredMonsterIndex(null);

    } catch (error) {
      console.error('스킬 사용 중 오류 :', error);
    }
  };

  // 타겟 선택 모드 취소 함수
  const cancelTargetSelection = () => {
    setTargetSelectionMode(false);
    setSelectedSkill(null);
    setHoveredMonsterIndex(null);

    const newLog = [...gameState.battleLog, '타겟 선택이 취소되었습니다.'];
    setGameState(prev => ({
      ...prev,
      battleLog: newLog
    }));
  };

  // 배경 이미지 스타일
  const backgroundStyle = images.background ? {
    backgroundImage: `url(${images.background})`
  } : {};

  // 카드 클릭 핸들러 수정 (스킬 타입에 따른 분기)
  const handleCardClick = (cardIndex) => {
    const skill = currentCardData[cardIndex];

    // 스킬 타입 확인
    const skillTargetType = skill.targetType || 'Pick';

    if (skillTargetType === 'Pick') {
      // 단일 타겟 스킬 - 타겟 선택 모드 활성화
      setTargetSelectionMode(true);
      setSelectedSkill({
        ...skill,
        id: skill.id || (cardIndex + 1)
      });

      const newLog = [...gameState.battleLog, `${skill.title}  선택됨 - 대상을 클릭하세요!`];
      setGameState(prev => ({
        ...prev,
        battleLog: newLog
      }));

    } else {
      // 전체/랜덤 타겟 스킬 - 바로 실행
      executeSkill({
        ...skill,
        id: skill.id || (cardIndex + 1)
      });
    }
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

  // 몬스터 렌더링 함수 (클릭 가능하게 수정)
  const renderMonsters = () => {
    const { monsterCount, monsters } = gameState;

    // 공통 몬스터 컴포넌트 생성 함수
    const createMonsterComponent = (index, className, nameClassName, healthClassName) => {
      const monster = monsters[index];
      if (!monster) return null;

      const isHovered = hoveredMonsterIndex === index;
      const isTargetable = targetSelectionMode;

      return (
        <React.Fragment key={`monster-${index}`}>
          {/* 몬스터 이미지 */}
          <div
            className={`${className} ${isTargetable ? 'monster-targetable' : ''} ${isHovered ? 'monster-hovered' : ''}`}
            onClick={() => handleMonsterClick(index)}
            onMouseEnter={() => isTargetable && setHoveredMonsterIndex(index)}
            onMouseLeave={() => setHoveredMonsterIndex(null)}
            style={{
              cursor: isTargetable ? 'crosshair' : 'default',
              transform: isHovered && isTargetable ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.2s ease',
              filter: isTargetable ? (isHovered ? 'brightness(1.2)' : 'brightness(0.8)') : 'none',
              border: isTargetable ? (isHovered ? '3px solid #ff6b6b' : '2px solid #ffd93d') : 'none',
              borderRadius: '10px'
            }}
            data-monster-index={index} // 디버깅용 데이터 속성
          >
            {images.monsters[index] && (
              <img src={images.monsters[index]} alt={`몬스터${index + 1}`} />
            )}
          </div>

          {/* 몬스터 이름 */}
          <div className={nameClassName}>
            {monster.name}
            {isTargetable && isHovered && <span style={{ color: '#ff6b6b' }}> ← 클릭!</span>}
          </div>

          {/* 몬스터 체력바 */}
          <div className={healthClassName}>
            <div className="hp-icon" />
            <span className="hp-text">
              {monster.health} / {monster.maxHealth}
            </span>
            <div className="status-icons">
              <div className="status-icon" />
              <div className="status-icon" />
            </div>
          </div>
        </React.Fragment>
      );
    };

    // 몬스터 수에 따른 렌더링 (기존 CSS 클래스 유지)
    if (monsterCount === 1) {
      return createMonsterComponent(0, "monster-single", "monster-name-single", "monster-health-bar-single");
    }
    else if (monsterCount === 2) {
      return (
        <>
          {createMonsterComponent(0, "monster-1", "monster-name-1", "monster-health-bar-1")}
          {createMonsterComponent(1, "monster-2", "monster-name-2", "monster-health-bar-2")}
        </>
      );
    }
    else if (monsterCount === 3) {
      return (
        <>
          {createMonsterComponent(0, "monster-triple-1", "monster-name-triple-1", "monster-health-bar-triple-1")}
          {createMonsterComponent(1, "monster-triple-2", "monster-name-triple-2", "monster-health-bar-triple-2")}
          {createMonsterComponent(2, "monster-triple-3", "monster-name-triple-3", "monster-health-bar-triple-3")}
        </>
      );
    }

    return null;
  };

  // 타겟 선택 UI 렌더링
  const renderTargetSelectionUI = () => {
    if (!targetSelectionMode) return null;

    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        zIndex: 1000,
        textAlign: 'center'
      }}>
        <h3>타겟 선택</h3>
        <p>"{selectedSkill?.title}"의 대상을 선택하세요</p>
        <button
          onClick={cancelTargetSelection}
          style={{
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          취소
        </button>
      </div>
    );
  };

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return (
      <div className="game-container-wrapper">
        <div className="game-container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'white',
            fontSize: '18px'
          }}>
            전투 준비 중...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container-wrapper">
      <div className="game-container">
        {/* API 에러 표시 */}
        {apiError && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 100
          }}>
            API 연결 실패: {apiError} (오프라인 모드)
          </div>
        )}

        {/* 배경 이미지 */}
        <div className="battle-background" style={backgroundStyle} />

        {/* 타겟 선택 UI */}
        {renderTargetSelectionUI()}

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
          <button onClick={() => changeStage('fire', 1)} style={{ fontSize: '9px', padding: '2px 4px' }}>불 1마리</button>
          <button onClick={() => changeStage('fire', 2)} style={{ fontSize: '9px', padding: '2px 4px' }}>불 2마리</button>
          <button onClick={() => changeStage('fire', 3)} style={{ fontSize: '9px', padding: '2px 4px' }}>불 3마리</button>
          <button onClick={() => changeStage('water', 1)} style={{ fontSize: '9px', padding: '2px 4px' }}>물 1마리</button>
          <button onClick={() => changeStage('water', 2)} style={{ fontSize: '9px', padding: '2px 4px' }}>물 2마리</button>
          <button onClick={() => changeStage('water', 3)} style={{ fontSize: '9px', padding: '2px 4px' }}>물 3마리</button>
          <button onClick={() => changeStage('grass', 1)} style={{ fontSize: '9px', padding: '2px 4px' }}>풀 1마리</button>
          <button onClick={() => changeStage('grass', 2)} style={{ fontSize: '9px', padding: '2px 4px' }}>풀 2마리</button>
          <button onClick={() => changeStage('grass', 3)} style={{ fontSize: '9px', padding: '2px 4px' }}>풀 3마리</button>
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
          {currentCardData.map((card, index) => (
            <div
              key={index}
              className={`card card-${card.type} ${targetSelectionMode ? 'card-disabled' : ''}`}
              onClick={() => !targetSelectionMode && handleCardClick(index)}
              style={{
                opacity: targetSelectionMode ? 0.5 : 1,
                cursor: targetSelectionMode ? 'not-allowed' : 'pointer'
              }}
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
              {/* API 스킬 정보 표시 */}
              {card.damage && card.damage !== '0~0' && (
                <div style={{
                  position: 'absolute',
                  bottom: '25px',
                  right: '5px',
                  fontSize: '10px',
                  color: 'white',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}>
                  {card.damage}
                </div>
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
              {apiError ? ' (오프라인 모드)' : ' (온라인)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleScreen;