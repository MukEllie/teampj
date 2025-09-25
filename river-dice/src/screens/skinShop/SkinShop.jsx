// SkinShop.jsx
import React, { useState, useEffect } from 'react';
import { getBackground, getCharacterSkin } from '../../utils/ImageManager';
import './SkinShop.css';

const SkinShop = ({ onNavigate }) => {
  const [playerGold, setPlayerGold] = useState(0);
  const [ownedSkins, setOwnedSkins] = useState(['201']); // 기본 스킨은 소유
  const [selectedSkin, setSelectedSkin] = useState('201');

  // 사용 가능한 스킨 목록 (warrior 전용)
  const availableSkins = [
    { id: '201', name: '기본 전사', price: 0, owned: true },
    { id: '202', name: '강철 전사', price: 100, owned: false },
    { id: '203', name: '화염 전사', price: 150, owned: false },
    { id: '204', name: '얼음 전사', price: 150, owned: false },
    { id: '205', name: '황금 전사', price: 300, owned: false },
    { id: '206', name: '어둠 전사', price: 250, owned: false }
  ];

  // 컴포넌트 마운트 시 저장된 데이터 로드
  useEffect(() => {
    const savedGold = localStorage.getItem('playerGold');
    const savedSkins = localStorage.getItem('ownedSkins');
    const savedSelectedSkin = localStorage.getItem('selectedSkin');

    if (savedGold) {
      setPlayerGold(parseInt(savedGold));
    } else {
      setPlayerGold(500); // 기본 골드
    }

    if (savedSkins) {
      setOwnedSkins(JSON.parse(savedSkins));
    }

    if (savedSelectedSkin) {
      setSelectedSkin(savedSelectedSkin);
    }
  }, []);

  // 데이터 저장
  const saveData = (gold, skins, selected) => {
    localStorage.setItem('playerGold', gold.toString());
    localStorage.setItem('ownedSkins', JSON.stringify(skins));
    localStorage.setItem('selectedSkin', selected);
  };

  // 스킨 구매
  const buySkin = (skinId, price) => {
    if (playerGold >= price && !ownedSkins.includes(skinId)) {
      const newGold = playerGold - price;
      const newOwnedSkins = [...ownedSkins, skinId];
      
      setPlayerGold(newGold);
      setOwnedSkins(newOwnedSkins);
      saveData(newGold, newOwnedSkins, selectedSkin);
      
      alert('스킨을 구매했습니다!');
    } else if (ownedSkins.includes(skinId)) {
      alert('이미 소유한 스킨입니다.');
    } else {
      alert('골드가 부족합니다.');
    }
  };

  // 스킨 장착
  const equipSkin = (skinId) => {
    if (ownedSkins.includes(skinId)) {
      setSelectedSkin(skinId);
      saveData(playerGold, ownedSkins, skinId);
      alert('스킨을 장착했습니다!');
    } else {
      alert('소유하지 않은 스킨입니다.');
    }
  };

  // 스킨 카드 클릭 핸들러
  const handleSkinClick = (skin) => {
    if (ownedSkins.includes(skin.id)) {
      equipSkin(skin.id);
    } else {
      buySkin(skin.id, skin.price);
    }
  };

  // 화면 선택으로 돌아가기
  const handleBackToSelector = () => {
    onNavigate('selector');
  };

  // 뒤로가기
  const handleBack = () => {
    onNavigate('title');
  };

  // 메인 버튼 클릭 (임시로 뒤로가기)
  const handleMainButton = () => {
    onNavigate('characterSelect');
  };

  return (
    <div className="skin-shop-wrapper">
      <div className="skin-shop-container">
        {/* 배경 이미지 */}
        <div 
          className="skin-background"
          style={{ 
            backgroundImage: `url(${getBackground('skin')})`
          }}
        />

        {/* 화면 선택으로 돌아가기 버튼 */}
        <button 
          className="skin-back-to-selector"
          onClick={handleBackToSelector}
        >
          River Dice - 화면 선택
        </button>

        {/* 뒤로가기 버튼 */}
        <div className="skin-back-button" onClick={handleBack}>
          <div className="back-button-layer-1" />
          <div className="back-button-layer-2" />
          <div className="back-button-layer-3" />
          <div className="back-arrow" />
        </div>

        {/* 골드 표시 */}
        <div className="gold-box">
          <span className="gold-label">Gold</span>
          <span className="gold-value">{playerGold}</span>
        </div>

        {/* 스킨 그리드 */}
        <div className="skin-grid">
          {availableSkins.map((skin) => {
            const isOwned = ownedSkins.includes(skin.id);
            const isEquipped = selectedSkin === skin.id;
            
            return (
              <div 
                key={skin.id}
                className="skin-card"
                onClick={() => handleSkinClick(skin)}
                style={{
                  border: isEquipped ? '3px solid #9480E9' : isOwned ? '2px solid #4CAF50' : '1px solid #ccc',
                  opacity: isOwned ? 1 : 0.7
                }}
              >
                <div 
                  className="skin-card-image"
                  style={{
                    backgroundImage: `url(${getCharacterSkin('warrior', skin.id)})`
                  }}
                />
                <div className="skin-card-name">
                  {skin.name}
                  {isEquipped && ' (장착됨)'}
                  {isOwned && !isEquipped && ' (소유됨)'}
                </div>
                <div className="skin-card-price">
                  {isOwned ? '구매완료' : `${skin.price} Gold`}
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 버튼 */}
        <div className="skin-shop-button" onClick={handleMainButton}>
          <div className="skin-button-line" />
          <div className="skin-button-body" />
          <div className="skin-button-text">돌아가기</div>
        </div>
      </div>
    </div>
  );
};

export default SkinShop;