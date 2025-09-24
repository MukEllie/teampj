// src/screens/character/CharacterSelectScreen.jsx
import React, { useState, useEffect } from 'react';
import { getBackground, getCharacter, getCharacterSkin } from '../../utils/ImageManager';
import { getStartOptions, continueRun, chooseClass, getUserSkins } from '../../api/client';
import './CharacterSelectScreen.css';

const CharacterSelectScreen = ({ onNavigate }) => {
  const [selectedCharacter, setSelectedCharacter] = useState('warrior');
  const [selectedSkin, setSelectedSkin] = useState('101');

  // UI 구조 유지: name / skins / stats만 채움
  const [characters, setCharacters] = useState({
    warrior: { name: '전사', skins: [], stats: { health: '-', attack: '-', luck: '-' } },
    thief:   { name: '도적', skins: [], stats: { health: '-', attack: '-', luck: '-' } },
    mage:    { name: '마법사', skins: [], stats: { health: '-', attack: '-', luck: '-' } },
  });

  // 어떤 응답이 와도 배열로 강제 변환(JSON/문자열/JSON5 대응)
  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === 'object' && Array.isArray(payload.data)) return payload.data;
    if (typeof payload === 'string') {
      const quotedKeys = payload.replace(/([,{]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":');
      const fixedQuotes = quotedKeys.replace(/'/g, '"');
      try {
        const j = JSON.parse(fixedQuotes);
        if (Array.isArray(j)) return j;
        if (j && typeof j === 'object' && Array.isArray(j.data)) return j.data;
      } catch { /* ignore */ }
    }
    return [];
  };

  // B버전: [{name, hp, atk, luck}]만 가정(영문/한글 이름 모두 허용)
  const parseOptions = (arr) => {
    const out = {};
    (arr || []).forEach(({ name, hp, atk, luck }) => {
      const raw = String(name ?? '').trim();
      const low = raw.toLowerCase();
      const key =
        low === 'warrior' || raw === '전사' ? 'warrior' :
        low === 'thief'   || raw === '도적' ? 'thief'   :
        low === 'mage'    || raw === '마법사' ? 'mage'   : '';
      if (!key) return;
      out[key] = { health: Number(hp), attack: Number(atk), luck: Number(luck) };
    });
    return out;
  };

  // /start/options → stats 채우기
  useEffect(() => {
    (async () => {
      try {
        const raw = await getStartOptions(); // 문자열일 수도 있음
        const arr = toArray(raw);
        const mapped = parseOptions(arr);
        console.log('[start/options] mapped:', mapped);
        setCharacters((prev) => ({
          warrior: { ...prev.warrior, stats: mapped.warrior ?? prev.warrior.stats },
          thief:   { ...prev.thief,   stats: mapped.thief   ?? prev.thief.stats },
          mage:    { ...prev.mage,    stats: mapped.mage    ?? prev.mage.stats },
        }));
      } catch (e) {
        console.warn('[CharacterSelect] getStartOptions failed:', e);
      }
    })();
  }, []);

  // 스킨 ID → 직업 키 (1/2 전사, 3/4 도적, 5/6 마법사)
  const jobFromSkinId = (id) => {
    const s = String(id || '');
    const f = s[0];
    if (f === '1' || f === '2') return 'warrior';
    if (f === '3' || f === '4') return 'thief';
    if (f === '5' || f === '6') return 'mage';
    return '';
  };

  // /SkinGacha/ViewUserSkin → skins 채우기
  useEffect(() => {
    const userId = localStorage.getItem('userId')?.trim() || '';
    if (!userId) return;

    (async () => {
      try {
        const raw = await getUserSkins(userId);
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        if (!list.length) return;

        const byKey = { warrior: [], thief: [], mage: [] };
        for (const row of list) {
          const id = row?.Skin_ID ?? row?.skinId ?? row?.id ?? row?.SkinId;
          if (id == null) continue;
          const key = jobFromSkinId(id);
          if (!key) continue;
          byKey[key].push({ id: String(id), name: row?.Skin_Name ?? row?.name ?? String(id) });
        }

        const uniqSort = (arr) => {
          const seen = new Set();
          const out = [];
          arr.slice()
            .sort((a, b) => String(a.id).localeCompare(String(b.id)))
            .forEach(x => { if (!seen.has(x.id)) { seen.add(x.id); out.push(x); } });
          return out;
        };

        setCharacters((prev) => ({
          warrior: { ...prev.warrior, skins: uniqSort(byKey.warrior) },
          thief:   { ...prev.thief,   skins: uniqSort(byKey.thief) },
          mage:    { ...prev.mage,    skins: uniqSort(byKey.mage) },
        }));

        // 현재 직업 스킨에 선택값 없으면 첫 번째로 보정
        const currentList = (byKey[selectedCharacter]) || [];
        if (!currentList.find(s => s.id === selectedSkin)) {
          const first = currentList[0]?.id;
          if (first) setSelectedSkin(first);
        }
      } catch (e) {
        console.warn('[CharacterSelect] getUserSkins failed:', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    const first = characters[character]?.skins?.[0]?.id;
    if (first) setSelectedSkin(first);
  };

  const handleSkinSelect = (skinId) => setSelectedSkin(skinId);

  const handleStartGame = async () => {
    const userId = localStorage.getItem('userId')?.trim() || '';
    if (!userId) { alert('로그인이 필요합니다.'); return; }

    const classNameMap = { warrior: 'Warrior', thief: 'Thief', mage: 'Mage' };
    const className = classNameMap[selectedCharacter];

    try {
      await chooseClass(userId, className); // 원본 client.js 시그니처
      const next = await continueRun(userId);

      localStorage.setItem('selectedCharacter', JSON.stringify({
        type: selectedCharacter,
        skin: selectedSkin,
        stats: characters[selectedCharacter]?.stats || {}
      }));

      onNavigate(String(next).includes('/camp') ? 'lobby' : 'battle');
    } catch (e) {
      console.error(e);
      alert('시작 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleBack = () => onNavigate('title');

  // 화면 바인딩용
  const currentCharacter = characters[selectedCharacter] || {};
  const currentSkinData =
    (currentCharacter.skins || []).find(s => s.id === selectedSkin) ||
    (currentCharacter.skins || [])[0] || { id: selectedSkin, name: '' };

  return (
    <div className="char-select-wrapper">
      <div className="char-select-container">
        <div
          className="char-select-background"
          style={{ backgroundImage: `url(${getBackground('characterSelect')})` }}
        />

        {/* 뒤로가기 버튼(원본 클래스/구조) */}
        <button className="char-select-back-button" onClick={handleBack}>
          <div className="char-back-button-1"></div>
          <div className="char-back-button-2"></div>
          <div className="char-back-button-3"></div>
          <div className="char-back-arrow">←</div>
        </button>

        {/* 우측 정보 패널 */}
        <div className="char-info-panel">
          <div className="char-character-name">{currentCharacter.name}</div>
          <div className="char-skin-name">{currentSkinData.name}</div>

          <div className="char-stats-container">
            <div className="char-stat-row">
              <span className="char-stat-label">공격력</span>
              <span className="char-stat-value">{currentCharacter?.stats?.attack ?? '-'}</span>
            </div>
            <div className="char-stat-row">
              <span className="char-stat-label">체력</span>
              <span className="char-stat-value">{currentCharacter?.stats?.health ?? '-'}</span>
            </div>
            <div className="char-stat-row">
              <span className="char-stat-label">행운</span>
              <span className="char-stat-value">{currentCharacter?.stats?.luck ?? '-'}</span>
            </div>
          </div>

          {/* 스킨 미리보기 */}
          <div className="char-skin-preview">
            <img
              src={getCharacterSkin(selectedCharacter, selectedSkin)}
              alt={`${currentCharacter.name} 스킨`}
            />
          </div>
        </div>

        {/* 좌측 직업 버튼 영역 */}
        <div className="char-class-buttons-container">
          <button
            className={`char-class-button ${selectedCharacter === 'warrior' ? 'active' : ''}`}
            onClick={() => handleCharacterSelect('warrior')}
          >
            전사
          </button>
          <button
            className={`char-class-button ${selectedCharacter === 'thief' ? 'active' : ''}`}
            onClick={() => handleCharacterSelect('thief')}
          >
            도적
          </button>
          <button
            className={`char-class-button ${selectedCharacter === 'mage' ? 'active' : ''}`}
            onClick={() => handleCharacterSelect('mage')}
          >
            마법사
          </button>
        </div>

        {/* 중앙 캐릭터 디스플레이 */}
        <div className="char-character-display">
          <img
            src={getCharacter(selectedCharacter)}
            alt={currentCharacter.name}
            className="char-main-image"
          />
        </div>

        {/* 하단 선택 패널 */}
        <div className="char-selection-panel">
          <div className="char-skin-gallery">
            {(currentCharacter.skins || []).map((skin) => (
              <div
                key={skin.id}
                className={`char-skin-item ${selectedSkin === skin.id ? 'active' : ''}`}
                onClick={() => handleSkinSelect(skin.id)}
              >
                <img
                  src={getCharacterSkin(selectedCharacter, skin.id)}
                  alt={skin.name}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 시작 버튼 */}
        <div className="char-select-start-button" onClick={handleStartGame}>
          <div className="char-button-line" />
          <div className="char-button char-button-pink" />
          <span className="char-button-text">시작</span>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectScreen;