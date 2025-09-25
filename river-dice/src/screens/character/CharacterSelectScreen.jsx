// src/screens/character/CharacterSelectScreen.jsx
import React, { useState, useEffect } from 'react';
import { getBackground, getCharacter, getCharacterSkin } from '../../utils/ImageManager';
import { getStartOptions, continueRun, chooseClass, getUserSkins } from '../../api/client';
import './CharacterSelectScreen.css';
import '../common_style.css';

const CharacterSelectScreen = ({ onNavigate }) => {
  const [selectedCharacter, setSelectedCharacter] = useState('warrior');
  const [selectedSkin, setSelectedSkin] = useState('101'); // 글로벌 스킨ID(101/201/301/401/501/601)

  // 직업별 이름/보유스킨/스탯 상태 보관
  const [characters, setCharacters] = useState({
    warrior: { name: '전사', skins: [], stats: { health: '-', attack: '-', luck: '-' } },
    thief:   { name: '도적', skins: [], stats: { health: '-', attack: '-', luck: '-' } },
    mage:    { name: '마법사', skins: [], stats: { health: '-', attack: '-', luck: '-' } },
  });

  // 응답 배열 입력
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
      } catch {}
    }
    return [];
  };

  // 시작 옵션 파싱 입력
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

  // 시작 옵션으로 스탯 입력
  useEffect(() => {
    (async () => {
      try {
        const raw = await getStartOptions();
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

  // 스킨ID로 직업 분류
  const jobFromSkinId = (id) => {
    const first = String(id || '').trim()[0];
    if (first === '1' || first === '2') return 'warrior';
    if (first === '3' || first === '4') return 'thief';
    if (first === '5' || first === '6') return 'mage';
    return '';
  };

  // 글로벌→로컬 스킨ID 변환(직업 내부 키: 101/201)
  const localSkinId = (globalId) => {
    const f = String(globalId || '').trim()[0];
    if (f === '1' || f === '3' || f === '5') return '101';
    if (f === '2' || f === '4' || f === '6') return '201';
    return '101';
  };

  // 보유 스킨 불러와 분류
  useEffect(() => {
    const userId = localStorage.getItem('userId')?.trim() || '';
    if (!userId) return;

    (async () => {
      try {
        const raw = await getUserSkins(userId);
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        console.log('[getUserSkins raw]:', raw);
        console.log('[getUserSkins list]:', list);
        if (!list.length) return;

        const byKey = { warrior: [], thief: [], mage: [] };
        for (const row of list) {
          const id = row?.Skin_ID ?? row?.skinId ?? row?.id ?? row?.SkinId;
          if (id == null) continue;
          const key = jobFromSkinId(id);
          if (!key) continue;
          byKey[key].push({ id: String(id), name: row?.Skin_Name ?? row?.skinName ?? row?.name ?? String(id) });
        }
        console.log('[byKey after classify]:', byKey);

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
        console.log(
          '[characters.skins lengths] warrior:',
          byKey.warrior.length, 'thief:', byKey.thief.length, 'mage:', byKey.mage.length
        );

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

  // 직업 선택
  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    const first = characters[character]?.skins?.[0]?.id;
    setSelectedSkin(first || '');
  };

  // 스킨 선택
  const handleSkinSelect = (skinId) => setSelectedSkin(skinId);

  // 세이브 생성 요청
  const handleStartGame = async () => {
    const userId = localStorage.getItem('userId')?.trim() || '';
    if (!userId) { alert('로그인이 필요합니다.'); return; }

    const classNameMap = { warrior: 'Warrior', thief: 'Thief', mage: 'Mage' };
    const className = classNameMap[selectedCharacter];

    try {
      await chooseClass(userId, className, Number(selectedSkin));
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

  // 타이틀 이동
  const handleBack = () => { onNavigate('title'); };

  // 현재 직업/스킨 계산
  const currentCharacter = characters[selectedCharacter] || {};
  const currentSkinData =
    (currentCharacter.skins || []).find(s => s.id === selectedSkin) ||
    (currentCharacter.skins || [])[0] || { id: selectedSkin, name: '' };

  // 렌더용 로컬 스킨ID(101/201)
  const skinLocal = localSkinId(selectedSkin);

  return (
    <div className="screen">
      {/* 선택 배경 표시 */}
      <div
        className="background"
        style={{ backgroundImage: `url(${getBackground('characterSelect')})` }}
      ></div>

      <div className="contents">
        <div className="content_top">

          {/* 뒤로가기/직업 선택 */}
          <div className="top_1">
            <button onClick={handleBack}> 뒤로</button>
            <div>
              <div className="select_job">
                <div className="button_s">
                  <div className="button_line_s"></div>
                  <button
                    className={`job_button ${selectedCharacter === 'warrior' ? 'active' : ''}`}
                    onClick={() => handleCharacterSelect('warrior')}
                  >
                    전사
                  </button>
                </div>
                <div className="button_s">
                  <div className="button_line_s"></div>
                  <button
                    className={`job_button ${selectedCharacter === 'mage' ? 'active' : ''}`}
                    onClick={() => handleCharacterSelect('mage')}
                  >
                    마법사
                  </button>
                </div>
                <div className="button_s">
                  <div className="button_line_s"></div>
                  <button
                    className={`job_button ${selectedCharacter === 'thief' ? 'active' : ''}`}
                    onClick={() => handleCharacterSelect('thief')}
                  >
                    도적
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 중앙 전신샷 표시 */}
          <div className="top_2">
            <img
              className="skin"
              src={getCharacter(selectedCharacter, skinLocal)}
              alt={currentCharacter.name}
            />
          </div>

          {/* 스탯/선택 스킨 카드 */}
          <div className="top_3">
            <div className="info">
              <div className="info_text">
                <div className="job_text">{currentCharacter.name}</div>
                <div>
                  <div className="stats_text">
                    <p>공격력</p>
                    <p>{currentCharacter?.stats?.attack ?? '-'}</p>
                  </div>
                  <div className="stats_text">
                    <span>체력</span>
                    <span>{currentCharacter?.stats?.health ?? '-'}</span>
                  </div>
                  <div className="stats_text">
                    <span>행운</span>
                    <span>{currentCharacter?.stats?.luck ?? '-'}</span>
                  </div>
                </div>
              </div>

              {/* 선택 스킨 카드 */}
              <div>
                <img
                  src={getCharacterSkin(selectedCharacter, skinLocal)}
                  alt={`${currentCharacter.name} 스킨`}
                />
              </div>
            </div>

            {/* 시작 버튼 */}
            <div className="button" onClick={handleStartGame}>
              <div className="button_line"></div>
              <div className="button_pink"></div>
              <div className="text_pink"> 시작 </div>
            </div>
          </div>
        </div>

        {/* 보유 스킨 썸네일 */}
        <div className="my_skin">
          <div>
            {(currentCharacter.skins || []).map((skin) => {
              const thumbLocal = localSkinId(skin.id);
              return (
                <div
                  key={skin.id}
                  className={`char-skin-item ${selectedSkin === skin.id ? 'active' : ''}`}
                  onClick={() => handleSkinSelect(skin.id)}
                >
                  <img
                    src={getCharacterSkin(selectedCharacter, thumbLocal)}
                    alt={skin.name}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectScreen;