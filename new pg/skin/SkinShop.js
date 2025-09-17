import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SkinShop() {
  const [gold, setGold] = useState(0);
  const [myCards, setMyCards] = useState([]);
  const [error, setError] = useState(null);

  const userId = 'test';
  const navigate = useNavigate();

  //스킨 조회
  const ViewUserSkin = useCallback(() => {
    axios.get('http://localhost:8080/testgame/SkinGacha/ViewUserSkin', { params: { userId } })
      .then(res => setMyCards(res.data))
      .catch(err => console.error('스킨 불러오기 실패 : ', err.response?.data || err.message));
  }, [userId]);

  //골드 조회
  const ViewUserGold = useCallback(() => {
    axios.get('http://localhost:8080/testgame/SkinGacha/ViewUserGold', { params: { userId } })
      .then(res => setGold(res.data))
      .catch(err => console.error('골드 불러오기 실패 : ', err.response?.data || err.message));
  }, [userId]);

  //데이터 조회
  useEffect(() => {
    ViewUserGold();
    ViewUserSkin();
  }, [ViewUserGold, ViewUserSkin]);

  //스킨 뽑기
  const AddSkin = () => {
    axios.get('http://localhost:8080/testgame/SkinGacha/AddSkin', { params: { userId } })
      .then(res => {
        setMyCards(prev => [...prev, res.data]);
        ViewUserGold();
        navigate('/SkinResult', { state: { skin: res.data } });
      })
      .catch(err => {
        if (err.response && err.response.status === 400) {
          const { error, errorImage } = err.response.data;
          setError({ message: error, image: errorImage });
        } else {
          alert(`가챠 실패: ${err.response?.data || err.message}`);
        }
        console.error('가챠 실패:', err.response?.data || err.message);
      });
  };

  // 골드 구매
  const BuyGold = () => {
    axios.post('http://localhost:8080/testgame/SkinGacha/BuyGold', null, { params: { userId } })
      .then(() => ViewUserGold())
      .catch(err => {
        alert(`골드 구매 실패: ${err.response?.data || err.message}`);
        console.error('골드 구매 실패:', err.response?.data || err.message);
      });
  };

  return (
    <div>
      <div id="card_area">
        {myCards.map(card => (
          <div
            key={card.skinId}
            className={`card ${card.job}`}
            onClick={() => console.log(`${card.job} - ${card.skinName}`)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={process.env.PUBLIC_URL + `/image/character_skin/${card.skinId}.png`}
              alt={`${card.job} skin`}
            />
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/')}>
        <img src={process.env.PUBLIC_URL + '/back.png'} alt="뒤로가기" />
      </button>

      <p>골드 {gold}</p>

      <button onClick={AddSkin}>1회 뽑기</button>
      <button onClick={BuyGold}>골드 구매</button>

      {error && (
        <div>
          <p>{error.message}</p>
          {error.image && (
            <img src={process.env.PUBLIC_URL + error.image}/>)}
          <button onClick={() => setError(null)}>닫기</button>
        </div>
      )}
    </div>
  );
}

export default SkinShop;