import React from 'react';
import { useNavigate } from 'react-router-dom';

function Title() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate('/SkinShop')}>스킨 상점</button>
    </div>
  );
}

export default Title;
