import React, { useState } from 'react';
import { getBackground } from '../../utils/ImageManager';
import './TitleScreen.css';
import { getStartState, continueRun } from '../../api/client';

// 응답 키 표기 불일치 방어용 헬퍼
const resolvePlayerId = (p) => p?.playerId ?? p?.PlayerID ?? p?.player_id ?? null;
const resolveStage    = (p) => p?.whereStage ?? p?.WhereStage ?? 'N/A';

const TitleScreen = ({ onNavigate }) => {
  const [playerStatus, setPlayerStatus] = useState('');
  const getLoggedInUserId = () => localStorage.getItem('userId')?.trim() || '';
/*
  // b123 플레이어 확인 함수 추가
  const checkPlayer = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/game/exists/b123');
      const result = await response.json();
      
      if (result.success && result.exists) {
        setPlayerStatus(`플레이어 b123 발견 - 캐릭터: ${result.data.character || '미선택'}`);
      } else {
        setPlayerStatus('플레이어 b123을 찾을 수 없습니다.');
      }
    } catch (err) {
      setPlayerStatus('서버 연결 실패');
    }
  };
*/
  // 로그인된 사용자 기준 확인 (백엔드 /start/state 사용)
  // 로그인된 사용자 기준 확인 (백엔드 /start/state 사용)
const checkPlayer = async () => {
  const userId = getLoggedInUserId();
  if (!userId) { setPlayerStatus('userId가 설정되지 않았습니다.'); return; }
  try {
    const s = await getStartState(userId);
    const player = s?.player || null;
    const pid = resolvePlayerId(player);
    if (s?.userExists && player && pid) {
      const whereStage = resolveStage(player);
      setPlayerStatus(`플레이어 ${pid} 발견 - 스테이지: ${whereStage}`);
    } else {
      setPlayerStatus(`플레이어 ${userId}를 찾을 수 없습니다.`);
    }
  } catch (err) {
    setPlayerStatus('서버 연결 실패');
  }
};

  const handleStartGame = async () => {
  const userId = getLoggedInUserId();
  if (!userId) { alert('로그인이 필요합니다.'); return; }
  try {
    const s = await getStartState(userId);
    const hasSave = !!s?.hasSave || (!!s?.userExists && !!s?.player);
    if (hasSave) {
      alert('기존 저장 데이터가 있습니다. "이어하기"를 눌러주세요.');
      return;
    }
    onNavigate('characterSelect');
  } catch (e) {
    alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
  };

  const handleLoadGame = async () => {
  const userId = getLoggedInUserId();
  if (!userId) { alert('로그인이 필요합니다.'); return; }
  try {
    const s = await getStartState(userId);
    const player = s?.player || null;
    const pid = resolvePlayerId(player);
    if (s?.userExists && player && pid === userId) {
      const next = await continueRun(userId); // 되감기 수행
      localStorage.setItem('PlayerID', userId);
      if (typeof next === 'string' && next.includes('/camp')) onNavigate('lobby');
      else onNavigate('lobby'); // 폴백
    } else {
      alert('저장된 게임이 없습니다.');
    }
  } catch (e) {
    alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
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
    <div className = "title_screen">
      {/* 배경 이미지 */}
      <div className="background" style={{ backgroundImage: `url(${getBackground('title')})` }}></div>
      <div className = "contents">
        {/* 버전 정보 */}
        <div className = "version">demo ver 0.0.1</div>
        
        {/* 버튼 */}
        <div className = "button_group">
          <div className = "button" onClick = {handleStartGame}>
            <div className = "button_line"></div>
            <div className = "button_pink"></div>
            <div className = "text_pink"> 처음부터 </div>
          </div>
          <div className = "button" onClick = {handleLoadGame}>
            <div className = "button_line"></div>
            <div className = "button_violet"></div>
            <div className = "text_violet"> 이어하기 </div>
          </div>
          <div className = "button" onClick = {handleSettings}>
            <div className = "button_line"></div>
            <div className = "button_blue"></div>
            <div className = "text_blue"> 스킨 상점 </div>
          </div>
        </div>
      </div>

      {/* 뒤로가기 버튼 */}
      <button 
        className = "title-back-to-selector"
        onClick = {handleBackToSelector}
        aria-label = "화면 선택으로 돌아가기"
      >
        ← 뒤로
      </button>

      {/* 플레이어 확인 버튼 (임시) */}
      <button onClick={checkPlayer}> 내 계정 확인 </button>
      {playerStatus && (
        <div>
          {playerStatus}
        </div>
      )}
        
    </div>
  );
};

export default TitleScreen;