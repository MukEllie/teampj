// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// (전역) ?userId= 쿼리를 localStorage에 흡수 — 앱 렌더 전에 1회 실행
try {
  const sp = new URLSearchParams(window.location.search);
  const uid = sp.get('userId');
  if (uid && !localStorage.getItem('userId')) {
    localStorage.setItem('userId', uid);
    // 주소 깔끔히: 쿼리 제거 (히스토리만 갱신)
    const url = new URL(window.location.href);
    url.searchParams.delete('userId');
    window.history.replaceState(null, '', `${url.pathname}${url.hash}`);
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('ensureUserIdFromQuery (global) failed:', e);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);