// CharacterSelectScreen.jsx
import React, { useState, useEffect } from 'react';
import { getBackground, getCharacter, getCharacterSkin } from '../../utils/ImageManager';
import './CharacterSelectScreen.css';

const CharacterSelectScreen = ({ onNavigate }) => {
  const [selectedCharacter, setSelectedCharacter] = useState('warrior');
  const [selectedSkin, setSelectedSkin] = useState('101');

  const [statsByKey, setStatsByKey] = useState({});
  const [skinsByKey, setSkinsByKey] = useState({ warrior: [], thief: [], mage: [] });

  const jobKey = (name = '') => {
    const k = String(name).trim().toLowerCase();
    if (k === 'warrior' || k === '전사') return 'warrior';
    if (k === 'thief'   || k === '도적') return 'thief';
    if (k === 'mage'    || k === '마법사') return 'mage';
    return '';
  };

  const jobFromSkinId = (id) => {
    const s = String(id || '');
    const f = s[0];
    if (f === '1' || f === '2') return 'warrior';
    if (f === '3' || f === '4') return 'thief';
    if (f === '5' || f === '6') return 'mage';
    return '';
  };

  const characters = {
    warrior: { name: '전사' },
    mage:    { name: '도적' },
    thief:   { name: '마법사' }
  };

// CharacterDB → 스탯 로드
useEffect(() => {
  const parse = (raw) => {
    const payload = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const out = {};
    payload.forEach((row = {}) => {
      const key = jobKey(row.name);
      if (!key) return;
      const hp = row.hp, atk = row.atk, luck = row.luck;
      if ([hp, atk, luck].every(v => v != null)) {
        out[key] = { health: hp, attack: atk, luck };
      }
    });
    return out;
  };
  (async () => {
    const MAX_TRIES = 3;
    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
      try {
        const res = await fetch('/start/options', {
          headers: { Accept: 'application/json' },
          credentials: 'include',
          cache: 'no-store'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const map = parse(json);
        if (Object.keys(map).length) {
          setStatsByKey(map);
          return;
        }
        // 파싱 결과가 비었으면 재시도
        throw new Error('parsed empty payload');
      } catch (e) {
        if (attempt === MAX_TRIES) {
          console.warn(`[CharacterSelect] /start/options failed after ${MAX_TRIES} tries:`, e);
        } else {
          await new Promise(r => setTimeout(r, 200 * attempt)); // 200ms, 400ms 백오프
        }
      }
    }
  })();
}, []);

  // User 보유 스킨 로드
  useEffect(() => {
    const userId = (localStorage.getItem('userId') || '').trim();
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/SkinGacha/ViewUserSkin?userId=${encodeURIComponent(userId)}`, {
          headers: { Accept: 'application/json' },
          credentials: 'include'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        const byKey = { warrior: [], thief: [], mage: [] };
        list.forEach((row = {}) => {
          const id = row.Skin_ID ?? row.skinId ?? row.id ?? row.SkinId;
          if (id == null) return;
          const key = jobFromSkinId(id);
          if (!key) return;
          byKey[key].push({ id: String(id), name: row.Skin_Name ?? row.name ?? '' });
        });
        const uniqSort = (arr) => {
          const seen = new Set(); const out = [];
          arr.sort((a,b) => Number(a.id) - Number(b.id)).forEach(x => { if (!seen.has(x.id)) { seen.add(x.id); out.push(x); } });
          return out;
        };
        byKey.warrior = uniqSort(byKey.warrior);
        byKey.thief   = uniqSort(byKey.thief);
        byKey.mage    = uniqSort(byKey.mage);
        setSkinsByKey(byKey);

        const first = (byKey[selectedCharacter] || [])[0]?.id;
        if (first) setSelectedSkin(first);
      } catch (e) {
        console.warn('[CharacterSelect] ViewUserSkin load failed:', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    const firstSkin = (skinsByKey[character] || [])[0]?.id;
    if (firstSkin) setSelectedSkin(firstSkin);
  };

  const handleSkinSelect = (skinId) => setSelectedSkin(skinId);

  const handleStartGame = async () => {
    const userId = (localStorage.getItem('userId') || '').trim();
    if (!userId) { alert('로그인이 필요합니다.'); return; }

    const s = statsByKey[selectedCharacter] || {};
    if ([s.health, s.attack, s.luck].some(v => v == null)) {
      alert('스탯 로딩 중입니다. 잠시 후 다시 시도해주세요.'); return;
    }
    const skinIdNum = Number(selectedSkin);
    if (!skinIdNum) { alert('스킨을 선택해주세요.'); return; }

    const classNameMap = { warrior: 'Warrior', thief: 'Thief', mage: 'Mage' };
    const className = classNameMap[selectedCharacter];

    try {
      const form = new URLSearchParams({
        userId, className,
        hp: String(s.health), atk: String(s.attack), luck: String(s.luck),
        skinId: String(skinIdNum)
      });
      const chooseRes = await fetch('/start/choose', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        credentials: 'include',
        body: form.toString()
      });
      if (!chooseRes.ok) {
        const text = await chooseRes.text().catch(()=> ''); throw new Error(`choose failed: ${chooseRes.status} ${text}`);
      }

      const contRes = await fetch(`/start/continue?userId=${encodeURIComponent(userId)}`, {
        headers: { Accept: 'application/json' }, credentials: 'include'
      });
      if (!contRes.ok) {
        const text = await contRes.text().catch(()=> ''); throw new Error(`continue failed: ${contRes.status} ${text}`);
      }
      let next = await contRes.text();
      try { const j = JSON.parse(next); next = j?.data ?? j?.next ?? j; } catch {}

      localStorage.setItem('selectedCharacter', JSON.stringify({ type: selectedCharacter, skin: selectedSkin, stats: s }));
      onNavigate(String(next).includes('/camp') ? 'lobby' : 'battle');
    } catch (e) {
      console.error(e);
      alert('시작 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleBack = () => onNavigate('title');

  const currentCharacter = characters[selectedCharacter];
  const displaySkins = skinsByKey[selectedCharacter] || [];
  const currentSkinData = displaySkins.find(s => s.id === selectedSkin) || displaySkins[0] || { id: selectedSkin, name: '' };
  const effectiveStats = statsByKey[selectedCharacter] || {};

  return (
    <div className="char-select-wrapper">
      <div className="char-select-container">
        <div className="char-select-background" style={{ backgroundImage: `url(${getBackground('characterSelect')})` }} />
        <button className="char-select-back-button" onClick={handleBack}>
          <div className="char-back-button-1"></div>
          <div className="char-back-button-2"></div>
          <div className="char-back-button-3"></div>
          <div className="char-back-arrow">←</div>
        </button>

        <div className="char-info-panel">
          <div className="char-character-name">{currentCharacter.name}</div>
          <div className="char-skin-name">{currentSkinData.name}</div>
          <div className="char-stats-container">
            <div className="char-stat-row"><span className="char-stat-label">공격력</span><span className="char-stat-value">{effectiveStats.attack ?? ''}</span></div>
            <div className="char-stat-row"><span className="char-stat-label">체력</span><span className="char-stat-value">{effectiveStats.health ?? ''}</span></div>
            <div className="char-stat-row"><span className="char-stat-label">행운</span><span className="char-stat-value">{effectiveStats.luck ?? ''}</span></div>
          </div>
          <div className="char-skin-preview">
            <img src={getCharacterSkin(selectedCharacter, selectedSkin)} alt={`${currentCharacter.name} 스킨`} />
          </div>
        </div>

        <div className="char-select-start-button" onClick={handleStartGame}>
          <div className="char-button-line" />
          <div className="char-button char-button-pink" />
          <span className="char-button-text">시작</span>
        </div>

        <div className="char-class-buttons-container">
          <button className={`char-class-button ${selectedCharacter === 'warrior' ? 'active' : ''}`} onClick={() => handleCharacterSelect('warrior')}>전사</button>
          <button className={`char-class-button ${selectedCharacter === 'mage' ? 'active' : ''}`}    onClick={() => handleCharacterSelect('mage')}>도적</button>
          <button className={`char-class-button ${selectedCharacter === 'thief' ? 'active' : ''}`}   onClick={() => handleCharacterSelect('thief')}>마법사</button>
        </div>

        <div className="char-character-display">
          <img src={getCharacter(selectedCharacter, selectedSkin)} alt={currentCharacter.name} className="char-main-image" />
        </div>

        <div className="char-selection-panel">
          <div className="char-skin-gallery">
            {displaySkins.map((skin) => (
              <div key={skin.id} className={`char-skin-item ${selectedSkin === skin.id ? 'active' : ''}`} onClick={() => handleSkinSelect(skin.id)}>
                <img src={getCharacterSkin(selectedCharacter, skin.id)} alt={skin.name || skin.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectScreen;