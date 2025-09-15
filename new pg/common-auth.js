// common-auth.js - 모든 HTML 페이지에서 사용하는 공통 인증 관련 함수들

/**
 * 로그인 상태에 따라 헤더의 인증 버튼을 업데이트하는 함수
 */
function updateAuthButtons() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (currentUser) {
        // 로그인된 상태 - 닉네임, 회원정보, 로그아웃 버튼 표시
        authButtons.innerHTML = `
            <span class="user-info">${currentUser.nickname}님</span>
            <a href="/profile" class="auth-btn profile-btn">회원정보</a>
            <button class="auth-btn logout-btn" id="headerLogoutBtn">로그아웃</button>
        `;
        
        // 로그아웃 버튼 이벤트 리스너 추가
        const logoutBtn = document.getElementById('headerLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                logout();
            });
        }
    } else {
        // 비로그인 상태 - 로그인, 회원가입 버튼 표시
        const currentPath = window.location.pathname;
        const loginActive = currentPath === '/login' ? 'active' : '';
        const signupActive = currentPath === '/signup' ? 'active' : '';
        
        authButtons.innerHTML = `
            <a href="/login" class="auth-btn login-btn ${loginActive}">로그인</a>
            <a href="/signup" class="auth-btn signup-btn ${signupActive}">회원가입</a>
        `;
    }
}

/**
 * 로그아웃 처리 함수
 */
function logout() {
    if (confirm('정말 로그아웃하시겠습니까?')) {
        // localStorage에서 사용자 정보 제거
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberUser');
        
        alert('로그아웃되었습니다.');
        
        // 메인 페이지로 리다이렉트
        window.location.href = '/';
    }
}

/**
 * 현재 로그인된 사용자 정보를 반환하는 함수
 * @returns {Object|null} 사용자 정보 객체 또는 null
 */
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

/**
 * 로그인 여부를 확인하는 함수
 * @returns {boolean} 로그인 여부
 */
function isLoggedIn() {
    return getCurrentUser() !== null;
}

/**
 * 로그인이 필요한 페이지에서 사용하는 함수
 * 로그인되지 않은 경우 로그인 페이지로 리다이렉트
 * @param {string} message - 표시할 메시지 (선택사항)
 */
function requireLogin(message = '로그인이 필요합니다.') {
    if (!isLoggedIn()) {
        alert(message);
        window.location.href = '/login';
        return false;
    }
    return true;
}

/**
 * 로그인 성공 후 호출할 함수
 * @param {Object} userData - 서버에서 받은 사용자 데이터
 */
function onLoginSuccess(userData) {
    // 사용자 정보를 localStorage에 저장
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // 헤더 업데이트
    updateAuthButtons();
    
    // 메인 페이지로 리다이렉트
    window.location.href = '/';
}

/**
 * 사용자 정보를 업데이트하는 함수
 * @param {Object} newUserData - 새로운 사용자 데이터
 */
function updateUserData(newUserData) {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const updatedUser = { ...currentUser, ...newUserData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        updateAuthButtons();
    }
}

/**
 * 페이지 로드 시 자동으로 헤더를 업데이트하는 초기화 함수
 */
function initAuthSystem() {
    // DOM이 로드되면 헤더 업데이트
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateAuthButtons);
    } else {
        updateAuthButtons();
    }
    
    // 스토리지 변경 시 다른 탭에서도 업데이트
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentUser') {
            updateAuthButtons();
        }
    });
}

/**
 * 에러 처리를 위한 공통 함수들
 */
const AuthUtils = {
    /**
     * API 응답 에러를 처리하는 함수
     * @param {Response} response - fetch 응답 객체
     * @param {Object} result - 응답 데이터
     */
    handleApiError: function(response, result) {
        if (response.status === 401) {
            // 인증 실패 - 로그아웃 처리
            localStorage.removeItem('currentUser');
            updateAuthButtons();
            alert('인증이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '/login';
        } else {
            // 기타 에러
            alert(result.error || '오류가 발생했습니다.');
        }
    },

    /**
     * 네트워크 에러를 처리하는 함수
     * @param {Error} error - 에러 객체
     */
    handleNetworkError: function(error) {
        console.error('Network Error:', error);
        alert('서버와의 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
};

// 페이지 로드 시 자동 초기화
initAuthSystem();