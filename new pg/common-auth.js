// common-auth.js - 모든 HTML 페이지에서 사용하는 공통 인증 관련 함수들

/**
 * 로그인 상태에 따라 헤더의 인증 버튼을 업데이트하는 함수
 */
function updateAuthButtons() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    console.log('현재 사용자:', currentUser); // 디버깅용
    
    if (currentUser) {
        // 로그인된 상태 - 아이디, 골드, 회원정보, 로그아웃 버튼 표시
        authButtons.innerHTML = `
            <span class="user-info">
                <strong>${currentUser.id}</strong>님 
                <span class="gold-info">(골드: ${currentUser.gold ? currentUser.gold.toLocaleString() : 0})</span>
            </span>
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
 * 현재 로그인 상태를 콘솔과 화면에 표시하는 디버깅 함수
 */
function showCurrentLoginStatus() {
    const currentUser = getCurrentUser();
    console.log('=== 현재 로그인 상태 ===');
    console.log('로그인 여부:', isLoggedIn());
    console.log('사용자 정보:', currentUser);
    console.log('localStorage currentUser:', localStorage.getItem('currentUser'));
    console.log('====================');
    
    // 페이지에 현재 상태 표시 (임시 디버깅용)
    const statusDiv = document.getElementById('debug-login-status');
    if (statusDiv) {
        statusDiv.innerHTML = currentUser 
            ? `로그인됨: <strong>${currentUser.id}</strong> (골드: ${currentUser.gold})`
            : '로그인되지 않음';
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
        
        console.log('로그아웃 완료');
        alert('로그아웃되었습니다.');
        
        // 헤더 업데이트
        updateAuthButtons();
        
        // 메인 페이지로 리다이렉트
        window.location.href = '/';
    }
}

/**
 * 현재 로그인된 사용자 정보를 반환하는 함수
 * @returns {Object|null} 사용자 정보 객체 또는 null
 */
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
        return null;
    }
}

/**
 * 로그인 여부를 확인하는 함수
 * @returns {boolean} 로그인 여부
 */
function isLoggedIn() {
    const user = getCurrentUser();
    return user !== null && user.id;
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
 * @param {Object} userData - 서버에서 받은 사용자 데이터 { id, gold, ownedSkins }
 */
function onLoginSuccess(userData) {
    console.log('로그인 성공 데이터:', userData);
    
    // 사용자 정보를 localStorage에 저장
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    console.log('localStorage 저장 완료');
    
    // 헤더 업데이트
    updateAuthButtons();
    
    alert(`${userData.id}님, 환영합니다!`);
    
    // 메인 페이지로 리다이렉트
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

/**
 * 사용자 정보를 업데이트하는 함수 (예: 골드 변경 시)
 * @param {Object} newUserData - 새로운 사용자 데이터
 */
function updateUserData(newUserData) {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const updatedUser = { ...currentUser, ...newUserData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        updateAuthButtons();
        console.log('사용자 정보 업데이트:', updatedUser);
    }
}

/**
 * 페이지 로드 시 자동으로 헤더를 업데이트하는 초기화 함수
 */
function initAuthSystem() {
    // DOM이 로드되면 헤더 업데이트
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            updateAuthButtons();
            showCurrentLoginStatus(); // 디버깅용
        });
    } else {
        updateAuthButtons();
        showCurrentLoginStatus(); // 디버깅용
    }
    
    // 스토리지 변경 시 다른 탭에서도 업데이트
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentUser') {
            updateAuthButtons();
            showCurrentLoginStatus();
        }
    });
    
    // 디버깅용 전역 함수 등록
    window.checkLoginStatus = showCurrentLoginStatus;
    window.debugLogout = function() {
        localStorage.removeItem('currentUser');
        updateAuthButtons();
        console.log('강제 로그아웃 완료');
    };
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