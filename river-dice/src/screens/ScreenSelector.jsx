// ScreenSelector.jsx
import React from 'react';
import './ScreenSelector.css';

const ScreenSelector = ({ onNavigate }) => {
  const screens = [
    // 완전 구현된 화면들 (실제 코드 존재)
    { id: 'title', name: '타이틀 화면', description: '게임 시작 화면 - 완전 구현', status: 'ready' },
    { id: 'characterSelect', name: '캐릭터 선택', description: '플레이어 캐릭터 선택 - 완전 구현', status: 'ready' },
    { id: 'battle', name: '전투 화면', description: '메인 전투 화면 - 완전 구현', status: 'ready' },
    { id: 'skin', name: '스킨 상점', description: '캐릭터 스킨 구매/장착 - 완전 구현', status: 'ready' },
    { id: 'reward', name: '보상 화면', description: '전투 후 보상 선택 - 완전 구현', status: 'ready' },
    { id: 'cardInventory', name: '카드 인벤토리', description: '전투용 카드 4장 선택 및 관리 - 완전 구현', status: 'ready' },
    { id: 'cardExchange', name: '카드 교환', description: '보상 시 카드 교체 시스템 - 완전 구현', status: 'ready' },
    { id: 'lobby', name: '로비 화면', description: '메인 로비 화면 - 완전 구현', status: 'ready' },
    { id: 'clear', name: '클리어 화면', description: '게임 클리어 시 나타나는 축하 화면 - 완전 구현', status: 'ready' },
    { id: 'failure', name: '실패 화면', description: '게임 오버 시 나타나는 화면 - 완전 구현', status: 'ready' },
    
    // 이미지 폴더 구조에 있지만 미구현된 화면들
    { id: 'event', name: '이벤트 화면', description: '특별 이벤트 화면 - 폴더 존재', status: 'ready' },
    { id: 'loading', name: '로딩 화면', description: '게임 로딩 화면 - 폴더 존재', status: 'todo' },
    
    // 추가 예정 화면들
    { id: 'artifact', name: '아티팩트', description: '아티팩트 관리', status: 'todo' },
    { id: 'shop', name: '상점', description: '아이템 구매', status: 'todo' },
    { id: 'inventory', name: '인벤토리', description: '아이템 관리', status: 'todo' },
    { id: 'settings', name: '설정', description: '게임 설정', status: 'todo' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'ready': return '#4CAF50';
      case 'dev': return '#FF9800';
      case 'todo': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'ready': return '구현 완료';
      case 'dev': return '개발 중';
      case 'todo': return '예정';
      default: return '예정';
    }
  };

  return (
    <div className="selector-container">

      
      <div className="screens-grid">
        {screens.map((screen) => (
          <div 
            key={screen.id}
            className={`screen-card ${screen.status}`}
            onClick={() => screen.status !== 'todo' && onNavigate(screen.id)}
            style={{
              cursor: screen.status === 'todo' ? 'not-allowed' : 'pointer',
              opacity: screen.status === 'todo' ? 0.5 : 1
            }}
          >
            <div 
              className="screen-status"
              style={{ backgroundColor: getStatusColor(screen.status) }}
            >
              {getStatusText(screen.status)}
            </div>
            <h3>{screen.name}</h3>
            <p>{screen.description}</p>
            {screen.status === 'ready' && (
              <div className="screen-ready-icon">✓</div>
            )}
            {screen.status === 'dev' && (
              <div className="screen-dev-icon">⚠</div>
            )}
            {screen.status === 'todo' && (
              <div className="screen-todo-icon">🔒</div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default ScreenSelector;