import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Title from './Title';
import SkinShop from './skin/SkinShop';
import SkinResult from './skin/SkinResult';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Title/>} />
        <Route path="/SkinShop" element={<SkinShop/>} />
        <Route path="/SkinResult" element={<SkinResult/>} />
      </Routes>
    </Router>
  );
}

export default App;
