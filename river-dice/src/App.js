import React, { useState } from 'react';
import ScreenSelector from './screens/ScreenSelector';
import TitleScreen from './screens/title/TitleScreen';
import BattleScreen from './screens/game/BattleScreen';
import CharacterSelectScreen from './screens/character/CharacterSelectScreen';
import CardInventoryScreen from './screens/cardInventory/CardInventoryScreen';
import LobbyScreen from './screens/lobby/LobbyScreen';
import CardExchangeScreen from './screens/cardExchange/CardExchangeScreen';
import RewardScreen from './screens/reward/RewardScreen';
import SkinShop from './screens/skinShop/SkinShop';
import ClearScreen from './screens/clear/ClearScreen';
import FailureScreen from './screens/failure/FailureScreen';
import EventScreen from './screens/event/EventScreen';

import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('selector');

  const handleNavigate = (screenId) => {
    console.log(`Navigating to: ${screenId}`);
    setCurrentScreen(screenId);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'selector':
        return <ScreenSelector onNavigate={handleNavigate} />;

      case 'title':
        return <TitleScreen onNavigate={handleNavigate} />;

      case 'battle':
        return (
          <div className="screen-wrapper">
            <button
              className="back-button"
              onClick={() => setCurrentScreen('selector')}
            >
              ← 화면 선택으로
            </button>
            <BattleScreen />
          </div>
        );

      case 'characterSelect':
        return <CharacterSelectScreen onNavigate={handleNavigate} />;

      case 'cardInventory':
        return <CardInventoryScreen onNavigate={handleNavigate} />;

      case 'cardExchange':
        return <CardExchangeScreen onNavigate={handleNavigate} />;

      case 'reward':
        return <RewardScreen onNavigate={handleNavigate} />;

      case 'skin':
        return <SkinShop onNavigate={handleNavigate} />;

      case 'lobby':
        return <LobbyScreen onNavigate={handleNavigate} />;

      case 'clear':
        return <ClearScreen onNavigate={handleNavigate} />;

      case 'failure':
        return <FailureScreen onNavigate={handleNavigate} />;

      case 'event':
          return <EventScreen onNavigate={handleNavigate} />;

      case 'artifact':
        return (
          <div className="placeholder-screen">
            <button
              className="back-button-placeholder"
              onClick={() => setCurrentScreen('selector')}
            >
              ← 화면 선택으로
            </button>
            <h2>⚡ 아티팩트 화면</h2>
            <p>아티팩트를 관리하는 화면입니다.</p>
            <p>개발 예정...</p>
          </div>
        );

      case 'clear':
        return (
          <div className="placeholder-screen">
            <button
              className="back-button-placeholder"
              onClick={() => setCurrentScreen('selector')}
            >
              ← 화면 선택으로
            </button>
            <h2>🎉 클리어 화면</h2>
            <p>게임을 클리어했을 때 나타나는 화면입니다.</p>
            <p>개발 예정...</p>
          </div>
        );

      case 'failure':
        return (
          <div className="placeholder-screen">
            <button
              className="back-button-placeholder"
              onClick={() => setCurrentScreen('selector')}
            >
              ← 화면 선택으로
            </button>
            <h2>💀 실패 화면</h2>
            <p>게임 오버 시 나타나는 화면입니다.</p>
            <p>개발 예정...</p>
          </div>
        );

      default:
        return <ScreenSelector onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      {renderScreen()}
    </div>
  );
}

export default App;