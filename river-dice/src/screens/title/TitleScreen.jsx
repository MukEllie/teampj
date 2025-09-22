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
    <div className="title-wrapper">
      {/* 뒤로가기 버튼 */}
      <button 
        className="title-back-to-selector"
        onClick={handleBackToSelector}
        aria-label="화면 선택으로 돌아가기"
      >
        ← 화면 선택
      </button>

      {/* 플레이어 확인 버튼 (임시) */}
      <button 
        onClick={checkPlayer}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '5px 10px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          fontSize: '12px',
          zIndex: 1000
        }}
      >
        내 계정 확인
      </button>
      
      {playerStatus && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '5px',
          borderRadius: '3px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          {playerStatus}
        </div>
      )}

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