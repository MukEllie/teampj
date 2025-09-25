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

const BattleScreen = ({ onNavigate }) => {
  // 현재는 하드코딩, 추후에 세션에서 받아오는 걸로 처리
  const playerID = 'testPlayer';

  // 게임 상태 관리 - 디폴트(0 or null)
  const [gameState, setGameState] = useState({
    stage: null,
    element: null,
    monsterCount: 0,
    isBoss: false,
    playerStats: {
      attack: 0,
      luck: 0,
      health: 0,
      maxHealth: 0
    },
    monsters: [],
    battleLog: ['전투 준비 중...']
  });

  const [artifacts, setArtifacts] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 이미지 상태 관리
  const [images, setImages] = useState({
    background: null,
    player: null,
    monsters: [],
    cards: [],
    artifacts: []
  });

  // API 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [battleStatus, setbattleStatus] = useState(null);

  // 몬스터 클릭 시스템 상태
  const [targetSelectionMode, setTargetSelectionMode] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [hoveredMonsterIndex, setHoveredMonsterIndex] = useState(null);

  // 플레이어 스킬 상태
  const [playerSkills, setPlayerSkills] = useState([]);

  // 백엔드 API 호출
  const startBattleAPI = async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      console.log(`전투 시작 API 호출 : playerID=${playerID}`);

      const response = await fetch(`http://localhost:8090/battle/start?PlayerID=${playerID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`응답 상태 : ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status : ${response.status}`);
      }

      const data = await response.json();
      console.log('전투 시작 API 응답 : ', data);

      if (!data.battleStatus) {
        throw new Error('battleStatus가 응답에 없습니다');
      }

      if (data.stage !== 'battleReady') {
        throw new Error(`예상치 못한 stage : ${data.stage}`);
      }

      await fetchArtifacts();
      await updateGameStateFromAPI(data);
      setbattleStatus(data.battleStatus);

    } catch (error) {
      console.error('전투 시작 API 에러 : ', error);
      setApiError(error.message);

      setGameState(prev => ({
        ...prev, battleLog: ['전투 시작 중 오류가 발생했습니다.',
          `오류 : ${error.message}`,
          'PlayerID가 올바른지 확인하거나 서버 상태를 확인해주세요.'
        ]
      }));
    } finally {
      setIsLoading(false);
    }
  };



  // 플레이어 스킬 목록 API 호출
  const fetchPlayerSkills = async () => {
    try {
      const response = await fetch(`http://localhost:8090/battle/skills/battle?PlayerID=${playerID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`스킬 API 응답 상태 : ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('플레이어 스킬 API 응답', data);

      if (data.success && data.skills) {
        console.log(`스킬 ${data.skillCount} 개 로드 성공`);
        return data.skills;
      } else {
        console.warn('스킬 데이터가 예상 형식과 다릅니다:', data);
        return [];
      }

    } catch (error) {
      console.error('플레이어 스킬 API 에러 : ', error);
      return null;
    }
  };

  // 아티팩트 목록 API 호출
  const fetchArtifacts = async () => {
    try {
      const response = await fetch(`http://localhost:8090/battle/artifacts?PlayerID=${playerID}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('아티팩트 데이터:', data);
        setArtifacts(data.artifacts || []);
      } else {
        console.error('아티팩트 API 응답 오류:', response.status);
        setArtifacts([]);
      }
    } catch (error) {
      console.error('아티팩트 조회 오류:', error);
      setArtifacts([]);
    }
  };

  // 게임 상태 업데이트
  const updateGameStateFromAPI = async (apiData) => {
    const { battleStatus, initResult, message } = apiData;

    try {
      console.log('게임 상태 업데이트 시작');
      console.log('battleStatus:', battleStatus);
      console.log('initResult:', initResult);

      // 플레이어 정보 - 이제 백엔드에서 완전한 데이터 받아옴
      const playerHp = battleStatus.playerHp || 0;
      const playerMaxHp = battleStatus.playerMaxHp || playerHp;
      const playerAtk = battleStatus.playerAtk || 10;
      const playerLuck = battleStatus.playerLuck || 5;
      const currentTurn = battleStatus.currentTurn || 1;


      console.log(`플레이어 HP: ${playerHp}/${playerMaxHp}, ATK: ${playerAtk}, LUCK: ${playerLuck}, 턴: ${currentTurn}`);

      // 몬스터 데이터 파싱 - 백엔드에서 완전한 객체 배열로 받아옴
      let monsters = [];
      if (battleStatus.aliveMonsters && Array.isArray(battleStatus.aliveMonsters)) {
        monsters = battleStatus.aliveMonsters.map((monster, index) => {
          if (typeof monster === 'object' && monster !== null) {
            // 백엔드에서 완전한 몬스터 객체를 받은 경우
            return {
              name: monster.name || `몬스터 ${index + 1}`,
              health: monster.hp || 0,
              maxHealth: monster.maxHp || 100,
              id: monster.id || (index + 10),
              element: monster.element || 'None',
              alive: monster.alive !== false && (monster.hp || 0) > 0,
              attack: monster.atk || 0,
              initiative: monster.initiative || 0,
              statusEffects: monster.statusEffects || {},
              index: monster.index !== undefined ? monster.index : index
            };
          } else if (typeof monster === 'string') {
            // 혹시 이름만 받은 경우 (이전 호환성)
            console.warn('몬스터 데이터가 문자열로 받아짐:', monster);
            return {
              name: monster,
              health: 100, // 임시값
              maxHealth: 100,
              id: index + 10,
              element: 'None',
              alive: true,
              attack: 0,
              initiative: 0,
              statusEffects: {},
              index: index
            };
          } else {
            console.error('알 수 없는 몬스터 데이터 형식:', monster);
            return {
              name: `몬스터 ${index + 1}`,
              health: 100,
              maxHealth: 100,
              id: index + 10,
              element: 'None',
              alive: true,
              attack: 0,
              initiative: 0,
              statusEffects: {},
              index: index
            };
          }
        });
      }

      console.log(`총 몬스터 수: ${monsters.length}`);
      console.log('처리된 몬스터들 : ', monsters);

      // 현재 위치의 속성은 원래라면 PlayerDto의 WhereSession을 받아와야하는데, 현재 해당 엔드포인트가 없음
      let SessionElement = battleStatus.playerSession || 'Fire';

      const battleLog = [
        '전투가 시작되었습니다!',
        message || '전투 준비 완료',
        `현재 턴: ${currentTurn}`,
        `${monsters.length} 마리의 몬스터와 대전 중`,
        `필드 속성: ${SessionElement}`
      ];

      if (initResult && initResult.message) {
        battleLog.push(`시스템: ${initResult.message}`);
      }

      setGameState(prev => ({
        ...prev,
        stage: currentTurn,
        element: SessionElement,
        monsterCount: monsters.length,
        isBoss: monsters.some(m => m.maxHealth > 150), // 체력이 높으면 보스로 간주. 수정 필요
        playerStats: {
          attack: playerAtk,
          luck: playerLuck,
          health: playerHp,
          maxHealth: playerMaxHp
        },
        monsters: monsters,
        battleLog: battleLog
      }));

      console.log('플레이어 스킬 로드 시작');
      const skills = await fetchPlayerSkills();
      if (skills && skills.length > 0) {
        setPlayerSkills(skills);
        console.log('플레이어 스킬 로드 완료 : ', skills);
      } else {
        console.warn('플레이어 스킬을 불러올 수 없습니다');
        setPlayerSkills([]);

        setGameState(prev => ({
          ...prev,
          battleLog: [...prev.battleLog, '경고: 플레이어 스킬을 불러오지 못했습니다']
        }));
      }

      console.log('게임 상태 업데이트 완료');

    } catch (error) {
      console.error('게임 상태 업데이트 중 오류:', error);
      setApiError(`게임 상태 업데이트 실패: ${error.message}`);

      setGameState(prev => ({
        ...prev,
        battleLog: [
          ...prev.battleLog,
          `게임 상태 업데이트 오류: ${error.message}`
        ]
      }));

      throw error;
    }
  };

  const executeSkill = async (skill, targetIndex = null) => {
    try {
      console.log('스킬 사용 : ', skill, '타겟 : ', targetIndex);

      let url = `http://localhost:8090/battle/battle?PlayerID=${playerID}&SkillID=${skill.skillID || skill.id}`;
      if (targetIndex !== null && targetIndex !== undefined && targetIndex >= 0) {
        url += `&targetIndex=${targetIndex}`;
      }

      console.log('스킬 사용 API 호출 URL : ', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      console.log(`스킬 사용 API 응답 상태: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status : ${response.status}`);
      }

      const battleResult = await response.json();
      console.log('스킬 사용 API 응답 : ', battleResult);

      await processBattleResult(battleResult, skill, targetIndex);

    } catch (error) {
      console.error('스킬 사용 중 오류 : ', error);

      const newLog = [
        ...gameState.battleLog,
        `스킬 사용 실패: ${error.message}`
      ];

      setGameState(prev => ({
        ...prev,
        battleLog: newLog
      }));
    } finally {
      setTargetSelectionMode(false);
      setSelectedSkill(null);
      setHoveredMonsterIndex(null);
    }
  };

  const processBattleResult = async (battleResult, usedSkill, targetIndex) => {
    const { battleResult: result, updateStatus, battleEnded } = battleResult;

    let logMessages = [
      `${usedSkill.name || usedSkill.title}을(를) 사용했습니다!`
    ];

    if (targetIndex !== null && gameState.monsters[targetIndex]) {
      logMessages.push(`대상 : ${gameState.monsters[targetIndex].name}`);
    }

    if (result && result.message) {
      logMessages.push(result.message);
    }

    if (result && result.battleLog) {
      result.battleLog.forEach(log => {
        // BattleLogEntry 구조: actorName, actionType, detail, turnNumber
        let logMessage = '';

        if (log.detail) {
          // detail 필드에 데미지 정보가 들어있음 (백엔드 구조)
          logMessage = `[턴 ${log.turnNumber || '?'}] ${log.detail}`;
        } else if (log.message) {
          // 혹시 message 필드가 있는 경우 (호환성)
          logMessage = `[턴 ${log.turnNumber || '?'}] ${log.message}`;
        } else {
          // 기본 형태
          logMessage = `[턴 ${log.turnNumber || '?'}] ${log.actorName}: ${log.actionType}`;
        }

        if (logMessage.trim()) {
          logMessages.push(logMessage);
        }
      });
    }

    // 추가로 BattleResultDto의 damage 정보도 활용
    if (result && result.damage && result.damage > 0) {
      logMessages.push(`💥 총 데미지: ${result.damage}`);
    }

    if (result && result.isHit === false) {
      logMessages.push(`🎯 공격이 빗나갔습니다!`);
    }

    if (updateStatus) {
      console.log('Battle 상태 업데이트 : ', updateStatus);

      if (updateStatus.playerHp !== undefined) {
        setGameState(prev => ({
          ...prev,
          playerStats: {
            attack: updateStatus.playerAtk || prev.playerStats.attack,
            luck: updateStatus.playerLuck || prev.playerStats.luck,
            health: updateStatus.playerHp,
            maxHealth: updateStatus.playerMaxHp || prev.playerStats.maxHealth
          }
        }));
      }

      // 몬스터 상태 업데이트 - 백엔드에서 완전한 객체 배열
      if (updateStatus.aliveMonsters && Array.isArray(updateStatus.aliveMonsters)) {
        const updatedMonsters = updateStatus.aliveMonsters.map((monster, index) => {
          if (typeof monster === 'object' && monster !== null) {
            // 완전한 몬스터 객체
            return {
              name: monster.name || `몬스터 ${index + 1}`,
              health: monster.hp || 0,
              maxHealth: monster.maxHp || 100,
              id: monster.id || (index + 10),
              element: monster.element || 'None',
              alive: monster.alive !== false && (monster.hp || 0) > 0,
              attack: monster.atk || 0,
              initiative: monster.initiative || 0,
              statusEffects: monster.statusEffects || {},
              index: monster.index !== undefined ? monster.index : index
            };
          } else if (typeof monster === 'string') {
            // 문자열인 경우 (이전 호환성)
            return {
              name: monster,
              health: 100,
              maxHealth: 100,
              id: index + 10,
              element: 'None',
              alive: true,
              attack: 0,
              initiative: 0,
              statusEffects: {},
              index: index
            };
          } else {
            return {
              name: `몬스터 ${index + 1}`,
              health: 0,
              maxHealth: 100,
              id: index + 10,
              element: 'None',
              alive: false,
              attack: 0,
              initiative: 0,
              statusEffects: {},
              index: index
            };
          }
        });

        setGameState(prev => ({
          ...prev,
          monsters: updatedMonsters,
          monsterCount: updatedMonsters.filter(m => m.alive).length
        }));
      }
    }

    setGameState(prev => ({
      ...prev,
      battleLog: [...prev.battleLog, ...logMessages]
    }));

    if (battleEnded) {
      logMessages.push('전투가 종료되었습니다!');

      if (battleResult.stage === 'battleWon') {
        logMessages.push('승리했습니다!');
      } else if (battleResult === 'battleLost') {
        logMessages.push('패배하였습니다.');
      }
    }
  };

  useEffect(() => {
    startBattleAPI();
  }, []);

  useEffect(() => {
    if (gameState.element && gameState.monsters.length > 0) {
      const loadedImages = {
        background: getStageBackground(gameState.element, gameState.isBoss),
        player: getCharacter('warrior', '201'),
        monsters: gameState.monsters.map(monster => getMonster(monster.id)),
        cards: playerSkills.map(skill => {
          const element = skill.element?.toLowerCase() || 'none';
          return getCard(element);
        }),
        artifacts: artifacts.map(artifact => getArtifact(artifact.id))
      };
      setImages(loadedImages);
    }
  }, [gameState.monsters, gameState.element, gameState.isBoss, playerSkills]);

  const currentCardData = playerSkills.map((skill, index) => ({
    id: skill.skillID || skill.skill_id,
    type: skill.element?.toLowerCase() || 'none',
    title: skill.name || `스킬 ${index + 1}`,
    rank: skill.rarity || 'N',
    targetType: skill.target || 'Pick',
    description: skill.description || '',
    damage: skill.damage || '0~0'
  }));

  const renderMonsters = () => {
    if (!gameState.monsters || gameState.monsters.length === 0) {
      return null;
    }

    const monsterCount = gameState.monsters.length;

    return gameState.monsters.map((monster, index) => {
      if (!monster.alive) return null;

      let monsterClass = '';
      let healthBarClass = '';
      let nameClass = '';

      if (monsterCount === 1) {
        monsterClass = 'monster-single';
        healthBarClass = 'monster-health-bar-single';
        nameClass = 'monster-name-single';
      } else if (monsterCount === 2) {
        monsterClass = index === 0 ? 'monster-1' : 'monster-2';
        healthBarClass = index === 0 ? 'monster-health-bar-1' : 'monster-health-bar-2';
        nameClass = index === 0 ? 'monster-name-1' : 'monster-name-2';
      } else if (monsterCount === 3) {
        const classes = ['monster-triple-1', 'monster-triple-2', 'monster-triple-3'];
        const healthClasses = ['monster-health-bar-triple-1', 'monster-health-bar-triple-2', 'monster-health-bar-triple-3'];
        const nameClasses = ['monster-name-triple-1', 'monster-name-triple-2', 'monster-name-triple-3'];

        monsterClass = classes[index];
        healthBarClass = healthClasses[index];
        nameClass = nameClasses[index];
      }

      const healthPercentage = monster.maxHealth > 0 ?
        (monster.health / monster.maxHealth) * 100 : 0;

      const isHovered = hoveredMonsterIndex === index;
      const isTargetable = targetSelectionMode;

      console.log(`몬스터 ${index} - 이름: ${monster.name}, 클래스: ${monsterClass}, 이름클래스: ${nameClass}`);

      return (
        <div key={monster.id || index}>

          {/* 몬스터 이미지 */}
          <div
            className={monsterClass}
            onClick={() => handleMonsterClick(index)}
            onMouseEnter={() => targetSelectionMode && setHoveredMonsterIndex(index)}
            onMouseLeave={() => targetSelectionMode && setHoveredMonsterIndex(null)}
            // 임의의 스타일
            style={{
              cursor: targetSelectionMode ? 'crosshair' : 'pointer',
              border: hoveredMonsterIndex === index && targetSelectionMode ? '3px solid #FFD700' : 'none',
              borderRadius: '10px'
            }}
          >
            {images.monsters[index] && (
              <img
                src={images.monsters[index]}
                alt={monster.name || '몬스터'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            )}
            {!images.monsters[index] && (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#444',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                textAlign: 'center'
              }}>
                {monster.name || '몬스터'}
              </div>
            )}
            {/* 타겟 선택 모드 표시 */}
            {targetSelectionMode && hoveredMonsterIndex === index && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(255, 215, 0, 0.9)',
                color: 'black',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                zIndex: 20
              }}>
                클릭하여 공격
              </div>
            )}
          </div>

          {/* 몬스터 이름 - CSS에 정의된 클래스 사용 */}
          <div className={nameClass}>
            {monster.name || '몬스터'}
          </div>

          {/* 체력바 - CSS에 정의된 클래스 사용 */}
          <div className={healthBarClass}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div
                style={{
                  width: `${healthPercentage}%`,
                  height: '100%',
                  backgroundColor:
                    healthPercentage > 50 ? '#4CAF50' :
                      healthPercentage > 25 ? '#FF9800' : '#F44336',
                  transition: 'width 0.3s ease'
                }}
              />
              <span style={{
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '1px 1px 2px black',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1
              }}>
                {monster.health}/{monster.maxHealth}
              </span>
            </div>
          </div>
        </div>
      );
    });
  };

  const handleCardClick = (cardIndex) => {
    if (currentCardData.length === 0) return;

    const skill = currentCardData[cardIndex];
    if (!skill) return;

    console.log('선택된 스킬:', skill);

    const skillTargetType = skill.targetType || skill.hit_target || 'Pick';
    console.log('스킬 타겟 타입:', skillTargetType);

    if (skillTargetType === 'Pick') {
      setTargetSelectionMode(true);
      setSelectedSkill(skill);

      const newLog = [...gameState.battleLog, `${skill.title || skill.name} 선택됨 - 대상을 선택하세요!`];
      setGameState(prev => ({
        ...prev, battleLog: newLog
      }));
    } else {
      executeSkill(skill);
    }
  };

  const handleArtifactMouseEnter = (event, artifact) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10
    });
    setTooltipData(artifact);
    setShowTooltip(true);
  };

  const handleArtifactMouseLeave = () => {
    setShowTooltip(false);
    setTooltipData(null);
  };

  const getJobKorean = (job) => {
    switch (job) {
      case 'Warrior': return '전사';
      case 'Mage': return '마법사';
      case 'Thief': return '도적';
      case 'Common': return '공용';
      default: return job;
    }
  };

  const handleMonsterClick = (monsterIndex) => {
    const monster = gameState.monsters[monsterIndex];
    if (!monster || !monster.alive) {
      console.log('유효하지 않은 몬스터 선택:', monsterIndex, monster);
      return;
    }


    console.log(`몬스터 ${monsterIndex} 클릭됨 : `, monster);

    if (targetSelectionMode && selectedSkill) {
      if (monsterIndex >= 0 && monsterIndex < gameState.monsters.length) {
        executeSkill(selectedSkill, monsterIndex);
      } else {
        console.error('유효하지 않은 몬스터 인덱스:', monsterIndex);
        const newLog = [...gameState.battleLog, '유효하지 않은 대상입니다.'];
        setGameState(prev => ({
          ...prev,
          battleLog: newLog
        }));
      }
    } else {
      console.log('몬스터 정보 : ', monster);
    }
  };

  // 타겟 선택 모드 취소
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

  // 나가기 버튼 핸들러
  const handleExit = () => {
    if (onNavigate) {
      onNavigate('characterSelect');
    }
  };

  // 배경 이미지 스타일
  const backgroundStyle = images.background ? {
    backgroundImage: `url(${images.background})`
  } : {};

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="game-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          fontSize: '24px',
          color: 'white'
        }}>
          전투 로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="battle-background" style={backgroundStyle}>
        <div className="artifact-bar">
          {artifacts.map((artifact) => (
            <div
              key={artifact.id}
              className="artifact-item"
              style={{
                backgroundImage: `url(${getArtifact(artifact.id)})`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => handleArtifactMouseEnter(e, artifact)}
              onMouseLeave={handleArtifactMouseLeave}
              title={artifact.name}
            />
          ))}
        </div>

        {Array.from({ length: Math.max(0, 6 - artifacts.length) }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="artifact-item empty-artifact"
            style={{
              border: '2px dashed rgba(255, 255, 255, 0)',
              backgroundColor: 'rgba(255, 255, 255, 0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0)',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >

          </div>
        ))}

        {showTooltip && tooltipData && (
          <div
            className="artifact-tooltip"
            style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              padding: '8px 12px',
              maxWidth: '250px',
              fontSize: '12px',
              color: 'white'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {tooltipData.name}
              <span style={{ float: 'right', fontSize: '11px', opacity: 0.7 }}>
                {getJobKorean(tooltipData.job)}
              </span>
            </div>
            <div style={{ marginBottom: '6px' }}>
              <strong style={{ color: '#4CAF50' }}>효과:</strong> {tooltipData.effect}
            </div>
            <div style={{ fontSize: '11px', fontStyle: 'italic', opacity: 0.6 }}>
              "{tooltipData.description}"
            </div>
          </div>
        )}
      </div>

      {/* 나가기 버튼 */}
      <div className="exit-button" onClick={handleExit}>
        나가기
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
          <span className="stat-value">{gameState.stage || '?'} ({gameState.element || '?'})</span>
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

      {/* 몬스터 렌더링 */}
      {renderMonsters()}

      {/* 타겟 선택 모드 UI */}
      {
        targetSelectionMode && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            zIndex: 100
          }}>
            <div>스킬: {selectedSkill?.title}</div>
            <div>대상을 선택하세요</div>
            <button
              onClick={cancelTargetSelection}
              style={{
                marginTop: '10px',
                padding: '5px 15px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
          </div>
        )
      }

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
            {/* 스킬 데미지 정보 표시 */}
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
            PlayerID: {playerID}
            {apiError ? ' (오류 발생)' : ' (온라인)'}
          </p>
        </div>
      </div>
    </div >
  )

  // 전투 상태 디버깅용 함수. 아직은 사용하지 않음
  const logBattleState = () => {
    console.log('=== 현재 전투 상태 ===');
    console.log('GameState:', gameState);
    console.log('PlayerSkills:', playerSkills);
    console.log('BattleStatus:', battleStatus);
    console.log('Loading:', isLoading);
    console.log('Error:', apiError);
    console.log('=====================');
  };

  // 개발자 도구에서 사용할 수 있도록 window에 디버깅 함수 노출. 아직은 사용하지 않음
  if (typeof window !== 'undefined') {
    window.debugBattle = {
      logState: logBattleState,
      gameState,
      playerSkills,
      battleStatus,
      isLoading,
      apiError
    };
  }
}

export default BattleScreen;