// screenRegistry.js
// 새로운 화면을 자동으로 등록하는 유틸리티

/**
 * 새 화면을 자동으로 등록합니다
 * @param {Object} screenInfo - 화면 정보
 * @param {string} screenInfo.id - 화면 ID (필수)
 * @param {string} screenInfo.name - 화면 이름 (선택)
 * @param {string} screenInfo.description - 화면 설명 (선택)
 * @param {string} screenInfo.status - 화면 상태: 'ready', 'dev', 'todo' (선택, 기본값: 'ready')
 */
export const registerScreen = (screenInfo) => {
  if (!screenInfo.id) {
    console.error('화면 ID는 필수입니다');
    return false;
  }

  try {
    // 기존 등록된 화면들 가져오기
    const detectedScreens = JSON.parse(localStorage.getItem('detectedScreens') || '[]');
    
    // 중복 체크
    const existingIndex = detectedScreens.findIndex(screen => screen.id === screenInfo.id);
    
    const newScreen = {
      id: screenInfo.id,
      name: screenInfo.name || `${screenInfo.id} 화면`,
      description: screenInfo.description || `${screenInfo.id} 화면입니다`,
      status: screenInfo.status || 'ready',
      registeredAt: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      // 기존 화면 업데이트
      detectedScreens[existingIndex] = { ...detectedScreens[existingIndex], ...newScreen };
      console.log('화면 정보 업데이트됨:', newScreen);
    } else {
      // 새 화면 추가
      detectedScreens.push(newScreen);
      console.log('새 화면 등록됨:', newScreen);
    }
    
    // localStorage에 저장
    localStorage.setItem('detectedScreens', JSON.stringify(detectedScreens));
    
    // 전역 함수가 있다면 호출 (ScreenSelector에서 설정)
    if (window.registerScreen) {
      window.registerScreen(newScreen);
    }
    
    return true;
  } catch (error) {
    console.error('화면 등록 중 오류:', error);
    return false;
  }
};

/**
 * 화면 상태를 업데이트합니다
 * @param {string} screenId - 화면 ID
 * @param {string} status - 새로운 상태 ('ready', 'dev', 'todo')
 */
export const updateScreenStatus = (screenId, status) => {
  try {
    const detectedScreens = JSON.parse(localStorage.getItem('detectedScreens') || '[]');
    const screenIndex = detectedScreens.findIndex(screen => screen.id === screenId);
    
    if (screenIndex >= 0) {
      detectedScreens[screenIndex].status = status;
      detectedScreens[screenIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('detectedScreens', JSON.stringify(detectedScreens));
      
      console.log(`화면 ${screenId} 상태가 ${status}로 변경됨`);
      return true;
    } else {
      console.warn(`화면 ${screenId}를 찾을 수 없습니다`);
      return false;
    }
  } catch (error) {
    console.error('화면 상태 업데이트 중 오류:', error);
    return false;
  }
};

/**
 * 등록된 모든 화면 목록을 가져옵니다
 */
export const getRegisteredScreens = () => {
  try {
    return JSON.parse(localStorage.getItem('detectedScreens') || '[]');
  } catch (error) {
    console.error('등록된 화면 목록 조회 중 오류:', error);
    return [];
  }
};

/**
 * 특정 화면을 삭제합니다
 * @param {string} screenId - 삭제할 화면 ID
 */
export const removeScreen = (screenId) => {
  try {
    const detectedScreens = JSON.parse(localStorage.getItem('detectedScreens') || '[]');
    const filteredScreens = detectedScreens.filter(screen => screen.id !== screenId);
    
    localStorage.setItem('detectedScreens', JSON.stringify(filteredScreens));
    console.log(`화면 ${screenId} 삭제됨`);
    return true;
  } catch (error) {
    console.error('화면 삭제 중 오류:', error);
    return false;
  }
};

/**
 * 모든 등록된 화면을 초기화합니다
 */
export const clearAllScreens = () => {
  try {
    localStorage.removeItem('detectedScreens');
    console.log('모든 등록된 화면이 삭제되었습니다');
    return true;
  } catch (error) {
    console.error('화면 초기화 중 오류:', error);
    return false;
  }
};

// 사용 예시:
/*
// 새 화면 등록
import { registerScreen, updateScreenStatus } from './utils/screenRegistry';

// 컴포넌트 내에서 호출
registerScreen({
  id: 'myNewScreen',
  name: '나의 새 화면',
  description: '새로운 기능을 제공하는 화면입니다',
  status: 'ready'
});

// 상태 업데이트
updateScreenStatus('myNewScreen', 'dev');
*/

export default {
  registerScreen,
  updateScreenStatus,
  getRegisteredScreens,
  removeScreen,
  clearAllScreens
};