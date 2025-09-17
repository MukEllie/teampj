import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function SkinResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const skin = location.state?.skin;

  if (!skin) {
    return (
      <div>
        <p>스킨 정보가 없습니다</p>
        <button onClick={() => navigate('/skinShop')}>확인</button>
      </div>
    );
  }

  const imgSrc = process.env.PUBLIC_URL + `/image/character_skin/${skin.skinId}.png`;

  return (
    <div>
      <div className={`card ${skin.job}`}>
        <img src={imgSrc} alt={`${skin.job} skin`}/>
      </div>
      <button onClick={() => navigate('/skinShop')}>확인</button>
    </div>
  );
}

export default SkinResult;