// admin.js - 무한루프 문제 및 필터 기능 오류 수정 완전 통합 버전

// 설정 상수들 중앙 관리
const ADMIN_CONFIG = {
   ENDPOINTS: {
       ADMIN_LOGIN: '/api/admin/login',
       ADMIN_STATS: '/api/admin/stats',
       ADMIN_USERS: '/api/admin/users',
       ADMIN_POSTS: '/api/admin/posts',
       ADMIN_COMMENTS: '/api/admin/comments',
       ADMIN_MEDIA: '/api/admin/media',
       ADMIN_NEWS: '/api/admin/news',
       ADMIN_INQUIRIES: '/api/admin/inquiries',
       ADMIN_FAQ: '/api/admin/faq',
       ADMIN_CHARACTERS: '/api/admin/characters',
       ADMIN_MONSTERS: '/api/admin/monsters',
       ADMIN_SKILLS: '/api/admin/skills'
   },
   CATEGORIES: {
       POST: ['자유', '공략', '질문', '이벤트', '버그신고'],
       NEWS: [
           { value: 1, text: '공지사항' },
           { value: 2, text: '업데이트' },
           { value: 3, text: '이벤트' },
           { value: 4, text: '점검' },
           { value: 5, text: '개발자노트' }
       ],
       MEDIA: [
           { value: 1, text: '스크린샷' },
           { value: 2, text: '동영상' },
           { value: 3, text: '아트워크' },
           { value: 4, text: '배경화면' }
       ],
       GAME: {
           SESSION: ['Fire', 'Water', 'Grass', 'None'],
           MONSTER_TYPE: ['Common', 'MiddleBoss', 'Boss', 'Unique'],
           ELEMENT: ['Fire', 'Water', 'Grass', 'None'],
           JOB: ['공용', '전사', '도적', '마법사'],
           SKILL_TYPE: ['BattleCard', 'SupportCard', 'DefenseCard'],
           RARITY: ['Common', 'Rare', 'Epic', 'Legendary', 'Test'],
           TARGET: ['Pick', 'All', 'Self'],
           STATUS_EFFECT: ['', 'Burn', 'Freeze', 'Poison', 'Stun'],
           CHARACTER: ['전사', '도적', '마법사'],
           GENDER: ['', '남성', '여성', '기타']
       }
   },
   RETRY: {
       MAX_ATTEMPTS: 3,
       DELAY: 1000
   }
};

// 유틸리티 함수들
class AdminUtils {
   static formatDate(dateString) {
       if (!dateString) return 'N/A';
       try {
           const date = new Date(dateString);
           if (isNaN(date.getTime())) return 'Invalid Date';
           return date.toLocaleDateString('ko-KR', {
               year: 'numeric',
               month: '2-digit',
               day: '2-digit',
               hour: '2-digit',
               minute: '2-digit'
           });
       } catch (error) {
           return 'Invalid Date';
       }
   }

   static truncateText(text, maxLength) {
       if (!text || typeof text !== 'string') return 'N/A';
       return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
   }

   static debounce(func, wait) {
       let timeout;
       return function executedFunction(...args) {
           const later = () => {
               clearTimeout(timeout);
               func(...args);
           };
           clearTimeout(timeout);
           timeout = setTimeout(later, wait);
       };
   }

   static validateFormData(data, rules) {
       const errors = [];
       Object.entries(rules).forEach(([field, rule]) => {
           const value = data[field];
           if (rule.required && (!value || value.toString().trim() === '')) {
               errors.push(`${rule.label}은(는) 필수 항목입니다.`);
           }
           if (value && rule.minLength && value.toString().length < rule.minLength) {
               errors.push(`${rule.label}은(는) ${rule.minLength}자 이상이어야 합니다.`);
           }
           if (value && rule.maxLength && value.toString().length > rule.maxLength) {
               errors.push(`${rule.label}은(는) ${rule.maxLength}자 이하여야 합니다.`);
           }
           if (value && rule.pattern && !rule.pattern.test(value)) {
               errors.push(`${rule.label} 형식이 올바르지 않습니다.`);
           }
       });
       return errors;
   }

   static sanitizeInput(input) {
       if (typeof input !== 'string') return input;
       return input
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&#x27;')
           .trim();
   }

   static deepClone(obj) {
       try {
           return JSON.parse(JSON.stringify(obj));
       } catch (error) {
           console.error('Deep clone 오류:', error);
           return obj;
       }
   }

   static safeParseInt(value, defaultValue = 0) {
       if (value === null || value === undefined || value === '') {
           return defaultValue;
       }
       const parsed = parseInt(value);
       return isNaN(parsed) ? defaultValue : parsed;
   }

   static getElementById(id) {
       const element = document.getElementById(id);
       if (!element) {
           console.warn(`Element with id '${id}' not found`);
       }
       return element;
   }

   static formatFileSize(bytes) {
       if (bytes === 0) return '0 Bytes';
       const k = 1024;
       const sizes = ['Bytes', 'KB', 'MB', 'GB'];
       const i = Math.floor(Math.log(bytes) / Math.log(k));
       return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
   }

   static isImageFile(fileName) {
       if (!fileName) return false;
       const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
       const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
       return imageExtensions.includes(extension);
   }

   static isVideoFile(fileName) {
       if (!fileName) return false;
       const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
       const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
       return videoExtensions.includes(extension);
   }
}

// API 클라이언트 클래스
class AdminAPI {
   static async request(url, options = {}) {
       const defaultOptions = {
           headers: {
               'Content-Type': 'application/json'
           }
       };

       const finalOptions = { ...defaultOptions, ...options };

       let attempt = 0;
       const maxAttempts = ADMIN_CONFIG.RETRY.MAX_ATTEMPTS;

       while (attempt < maxAttempts) {
           try {
               const response = await fetch(url, finalOptions);

               if (!response.ok) {
                   const errorData = await response.json().catch(() => ({ error: 'Network error' }));
                   throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
               }

               return await response.json();
           } catch (error) {
               attempt++;

               if (attempt >= maxAttempts) {
                   throw new Error(`서버 요청 실패 (${attempt}회 시도): ${error.message}`);
               }

               await new Promise(resolve => setTimeout(resolve, ADMIN_CONFIG.RETRY.DELAY * attempt));
           }
       }
   }

   static async get(url) {
       return this.request(url, { method: 'GET' });
   }

   static async post(url, data) {
       return this.request(url, {
           method: 'POST',
           body: JSON.stringify(data)
       });
   }

   static async put(url, data) {
       return this.request(url, {
           method: 'PUT',
           body: JSON.stringify(data)
       });
   }

   static async delete(url) {
       return this.request(url, { method: 'DELETE' });
   }
}

// 메인 관리자 매니저 클래스
class AdminManager {
   constructor() {
       this.isLoggedIn = false;
       this.currentSection = 'dashboard';
       this.currentGameTab = 'characters';
       this.data = {
           users: [],
           posts: [],
           comments: [],
           media: [],
           news: [],
           inquiries: [],
           faq: [],
           characters: [],
           monsters: [],
           skills: [],
           players: []
       };
       this.originalData = {};
       this.eventListeners = new Map();
       this.loadingStates = new Set();
       this.searchStates = new Map();
       this.initialized = false;
       this.currentEscapeHandler = null;
       this.searchProcessing = new Set(); // 검색 처리 중 플래그 추가
       this._isRendering = false; // 렌더링 중복 방지 플래그
   }

   async init() {
       if (this.initialized) return;

       try {
           this.checkLoginStatus();
           this.setupEventListeners();
           this.setupKeyboardShortcuts();
           this.initialized = true;
       } catch (error) {
           console.error('Admin Manager 초기화 오류:', error);
       }
   }

   checkLoginStatus() {
       const adminSession = sessionStorage.getItem('adminSession');
       if (adminSession) {
           try {
               const session = JSON.parse(adminSession);
               if (session && session.admin_id) {
                   this.isLoggedIn = true;
                   this.showMainPage();
               } else {
                   this.showLoginPage();
               }
           } catch (error) {
               console.error('세션 파싱 오류:', error);
               this.showLoginPage();
           }
       } else {
           this.showLoginPage();
       }
   }

   setupEventListeners() {
       this.cleanupEventListeners();

       const loginForm = AdminUtils.getElementById('adminLoginForm');
       if (loginForm) {
           const loginHandler = (e) => this.handleLogin(e);
           loginForm.addEventListener('submit', loginHandler);
           this.eventListeners.set('adminLoginForm', { element: loginForm, event: 'submit', handler: loginHandler });
       }

       const logoutBtn = AdminUtils.getElementById('adminLogoutBtn');
       if (logoutBtn) {
           const logoutHandler = () => this.handleLogout();
           logoutBtn.addEventListener('click', logoutHandler);
           this.eventListeners.set('adminLogoutBtn', { element: logoutBtn, event: 'click', handler: logoutHandler });
       }

       document.querySelectorAll('.admin-nav-btn').forEach((btn, index) => {
           if (!btn.dataset.section) return;

           const navHandler = (e) => {
               const section = e.target.dataset.section;
               if (section) {
                   this.switchSection(section);
               }
           };
           btn.addEventListener('click', navHandler);
           this.eventListeners.set(`nav-btn-${index}`, { element: btn, event: 'click', handler: navHandler });
       });

       document.querySelectorAll('[data-game-tab]').forEach((btn, index) => {
           const tabHandler = (e) => {
               const tab = e.target.dataset.gameTab;
               if (tab) {
                   this.switchGameTab(tab);
               }
           };
           btn.addEventListener('click', tabHandler);
           this.eventListeners.set(`game-tab-${index}`, { element: btn, event: 'click', handler: tabHandler });
       });

       this.setupRefreshButtons();
       this.setupSearchFunctions();
       this.setupModals();
       this.setupActionButtons();
   }

   setupKeyboardShortcuts() {
       const keyboardHandler = (e) => {
           try {
               if (e.ctrlKey && e.key === 'r') {
                   e.preventDefault();
                   this.refreshCurrentSection();
               }
               if (e.key === 'Escape') {
                   this.closeAllModals();
               }
           } catch (error) {
               console.error('키보드 단축키 처리 오류:', error);
           }
       };

       document.addEventListener('keydown', keyboardHandler);
       this.eventListeners.set('keyboard', { element: document, event: 'keydown', handler: keyboardHandler });
   }

   cleanupEventListeners() {
       this.eventListeners.forEach(({ element, event, handler }) => {
           try {
               if (element && typeof element.removeEventListener === 'function') {
                   element.removeEventListener(event, handler);
               }
           } catch (error) {
               console.error('이벤트 리스너 제거 오류:', error);
           }
       });
       this.eventListeners.clear();
   }

   async handleLogin(e) {
       e.preventDefault();

       const adminIdEl = AdminUtils.getElementById('adminId');
       const adminPasswordEl = AdminUtils.getElementById('adminPassword');
       const loading = AdminUtils.getElementById('adminLoginLoading');
       const errorEl = AdminUtils.getElementById('adminLoginError');

       if (!adminIdEl || !adminPasswordEl || !loading || !errorEl) {
           console.error('로그인 폼 요소를 찾을 수 없습니다.');
           return;
       }

       const adminId = AdminUtils.sanitizeInput(adminIdEl.value.trim());
       const adminPassword = adminPasswordEl.value;

       if (!adminId || !adminPassword) {
           errorEl.textContent = 'ID와 비밀번호를 모두 입력해주세요.';
           return;
       }

       this.setLoadingState('login', true);
       loading.style.display = 'block';
       errorEl.textContent = '';

       try {
           const result = await AdminAPI.post(ADMIN_CONFIG.ENDPOINTS.ADMIN_LOGIN, {
               admin_id: adminId,
               admin_password: adminPassword
           });

           sessionStorage.setItem('adminSession', JSON.stringify(result.admin));
           this.isLoggedIn = true;
           this.showMainPage();
           this.showMessage('로그인되었습니다.', 'success');
       } catch (error) {
           errorEl.textContent = this.getErrorMessage(error);
           console.error('로그인 오류:', error);
       } finally {
           this.setLoadingState('login', false);
           loading.style.display = 'none';
       }
   }

   handleLogout() {
       if (confirm('로그아웃하시겠습니까?')) {
           sessionStorage.removeItem('adminSession');
           this.isLoggedIn = false;
           this.cleanupEventListeners();
           this.showLoginPage();
           this.showMessage('로그아웃되었습니다.', 'info');
       }
   }

   showLoginPage() {
       const loginEl = AdminUtils.getElementById('adminLogin');
       const mainEl = AdminUtils.getElementById('adminMain');

       if (loginEl) loginEl.style.display = 'flex';
       if (mainEl) mainEl.style.display = 'none';
   }

   showMainPage() {
       const loginEl = AdminUtils.getElementById('adminLogin');
       const mainEl = AdminUtils.getElementById('adminMain');

       if (loginEl) loginEl.style.display = 'none';
       if (mainEl) mainEl.style.display = 'block';

       this.loadDashboardStats();
       this.loadAllData();
   }

   switchSection(sectionName) {
       try {
           // 열려있는 모달 모두 닫기
           this.closeAllModals();
           
           sessionStorage.setItem('currentAdminSection', sectionName);

           document.querySelectorAll('.admin-section').forEach(section => {
               section.classList.remove('active');
           });

           document.querySelectorAll('.admin-nav-btn').forEach(btn => {
               btn.classList.remove('active');
           });

           const targetSection = AdminUtils.getElementById(sectionName);
           const targetBtn = document.querySelector(`[data-section="${sectionName}"]`);

           if (targetSection && targetBtn) {
               targetSection.classList.add('active');
               targetBtn.classList.add('active');
               this.currentSection = sectionName;
               this.loadSectionData(sectionName);
           }
       } catch (error) {
           console.error('섹션 전환 오류:', error);
       }
   }

   switchGameTab(tabName) {
       try {
           sessionStorage.setItem('currentGameTab', tabName);

           document.querySelectorAll('.game-tab-content').forEach(tab => {
               tab.classList.remove('active');
           });

           document.querySelectorAll('[data-game-tab]').forEach(btn => {
               btn.classList.remove('active');
           });

           const targetTab = AdminUtils.getElementById(`${tabName}-tab`);
           const targetBtn = document.querySelector(`[data-game-tab="${tabName}"]`);

           if (targetTab && targetBtn) {
               targetTab.classList.add('active');
               targetBtn.classList.add('active');
               this.currentGameTab = tabName;
               this.loadGameData(tabName);
           }
       } catch (error) {
           console.error('게임 탭 전환 오류:', error);
       }
   }

   refreshCurrentSection() {
       this.loadSectionData(this.currentSection);
       this.showMessage('데이터를 새로고침했습니다.', 'info');
   }

   setLoadingState(key, isLoading) {
       if (isLoading) {
           this.loadingStates.add(key);
       } else {
           this.loadingStates.delete(key);
       }
   }

   isLoading(key) {
       return this.loadingStates.has(key);
   }

   async loadDashboardStats() {
       if (this.isLoading('stats')) return;
       this.setLoadingState('stats', true);

       try {
           const stats = await AdminAPI.get(ADMIN_CONFIG.ENDPOINTS.ADMIN_STATS);

           this.updateElementText('statUsers', stats.users || 0);
           this.updateElementText('statPosts', stats.posts || 0);
           this.updateElementText('statComments', stats.comments || 0);
           this.updateElementText('statMedia', stats.media || 0);
           this.updateElementText('statNews', stats.news || 0);
           this.updateElementText('statInquiries', stats.inquiries || 0);
           this.updateElementText('statPendingInquiries', stats.pending_inquiries || 0);
           this.updateElementText('statFaq', stats.faq || 0);
       } catch (error) {
           console.error('통계 로드 오류:', error);
           this.showMessage('통계 데이터를 불러올 수 없습니다.', 'error');
       } finally {
           this.setLoadingState('stats', false);
       }
   }

   updateElementText(elementId, text) {
       const element = AdminUtils.getElementById(elementId);
       if (element) {
           element.textContent = text;
       }
   }


   // 데이터 로드 대기 함수
   async waitForData(dataKey, maxWait = 3000) {
       const startTime = Date.now();
       while (!this.data[dataKey] || this.data[dataKey].length === 0) {
           if (Date.now() - startTime > maxWait) {
               console.warn(`데이터 로드 시간 초과: ${dataKey}`);
               break;
           }
           await new Promise(resolve => setTimeout(resolve, 100));
       }
   }

   async loadAllData() {
       const loadPromises = [
           this.loadUsers(),
           this.loadPosts(),
           this.loadComments(),
           this.loadMedia(),
           this.loadNews(),
           this.loadInquiries(),
           this.loadFAQ(),
           this.loadGameData('characters')
       ];

       try {
           await Promise.allSettled(loadPromises);
       } catch (error) {
           console.error('데이터 로드 중 오류 발생:', error);
       }
   }

   async loadSectionData(sectionName) {
       const loadingKey = `section-${sectionName}`;
       if (this.isLoading(loadingKey)) return;

       try {
           switch (sectionName) {
               case 'users':
                   await this.loadUsers();
                   break;
               case 'posts':
                   await this.loadPosts();
                   break;
               case 'comments':
                   await this.loadComments();
                   break;
               case 'media':
                   await this.loadMedia();
                   break;
               case 'news':
                   await this.loadNews();
                   break;
               case 'inquiries':
                   await this.loadInquiries();
                   break;
               case 'faq':
                   await this.loadFAQ();
                   break;
               case 'game':
                   await this.loadGameData(this.currentGameTab);
                   break;
               case 'dashboard':
                   await this.loadDashboardStats();
                   break;
           }
       } catch (error) {
           console.error(`섹션 ${sectionName} 로드 오류:`, error);
       }
   }

   async loadWithErrorHandling(key, endpoint, renderFunction) {
       if (this.isLoading(key)) return;
       this.setLoadingState(key, true);

       try {
           const data = await AdminAPI.get(endpoint);
           this.data[key] = Array.isArray(data) ? data : [];
           this.originalData[key] = AdminUtils.deepClone(this.data[key]);

           if (renderFunction) {
               renderFunction.call(this);
           }
       } catch (error) {
           console.error(`${key} 데이터 로드 오류:`, error);
           const tableBodyId = `${key}TableBody`;
           this.showError(tableBodyId, this.getErrorMessage(error));
       } finally {
           this.setLoadingState(key, false);
       }
   }

   async loadUsers() {
       await this.loadWithErrorHandling('users', ADMIN_CONFIG.ENDPOINTS.ADMIN_USERS, this.renderUsersTable);
   }

   async loadPosts(forceRefresh = false) {
       console.log('게시글 데이터 로드 시작' + (forceRefresh ? ' (강제 새로고침)' : ''));
       
       // 강제 새로고침 시 캐시 완전 무효화
       if (forceRefresh) {
           // 캐시 헤더 추가
           const timestamp = new Date().getTime();
           const endpoint = `${ADMIN_CONFIG.ENDPOINTS.ADMIN_POSTS}?nocache=${timestamp}&refresh=true`;
           
           try {
               const response = await fetch(endpoint, {
                   method: 'GET',
                   headers: {
                       'Cache-Control': 'no-cache, no-store, must-revalidate',
                       'Pragma': 'no-cache',
                       'Expires': '0'
                   },
                   credentials: 'include'
               });
               
               if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
               
               const data = await response.json();
               this.data.posts = Array.isArray(data) ? data : [];
               console.log('게시글 강제 로드 완료:', this.data.posts.length, '개');
               this.renderPostsTable();
           } catch (error) {
               console.error('게시글 강제 로드 실패:', error);
               // 실패 시 일반 로드 시도
               await this.loadWithErrorHandling('posts', ADMIN_CONFIG.ENDPOINTS.ADMIN_POSTS, () => {
                   this.renderPostsTable();
               });
           }
       } else {
           await this.loadWithErrorHandling('posts', ADMIN_CONFIG.ENDPOINTS.ADMIN_POSTS, () => {
               console.log('게시글 데이터 로드 완료:', this.data.posts.length, '개');
               this.renderPostsTable();
           });
       }
   }

   async loadComments() {
       await this.loadWithErrorHandling('comments', ADMIN_CONFIG.ENDPOINTS.ADMIN_COMMENTS, this.renderCommentsTable);
   }

   async loadMedia() {
       await this.loadWithErrorHandling('media', ADMIN_CONFIG.ENDPOINTS.ADMIN_MEDIA, this.renderMediaTable);
   }

   async loadNews() {
       await this.loadWithErrorHandling('news', ADMIN_CONFIG.ENDPOINTS.ADMIN_NEWS, this.renderNewsTable);
   }

   async loadInquiries() {
       await this.loadWithErrorHandling('inquiries', ADMIN_CONFIG.ENDPOINTS.ADMIN_INQUIRIES, this.renderInquiriesTable);
   }

   async loadFAQ() {
       await this.loadWithErrorHandling('faq', ADMIN_CONFIG.ENDPOINTS.ADMIN_FAQ, this.renderFAQTable);
   }

   async loadGameData(tabName) {
       let endpoint = '';
       let dataKey = tabName;

       switch (tabName) {
           case 'characters':
               endpoint = ADMIN_CONFIG.ENDPOINTS.ADMIN_CHARACTERS;
               break;
           case 'monsters':
               endpoint = ADMIN_CONFIG.ENDPOINTS.ADMIN_MONSTERS;
               break;
           case 'skills':
               endpoint = ADMIN_CONFIG.ENDPOINTS.ADMIN_SKILLS;
               break;
           case 'players':
               endpoint = ADMIN_CONFIG.ENDPOINTS.ADMIN_USERS;
               dataKey = 'users';
               break;
           default:
               console.warn(`알 수 없는 게임 탭: ${tabName}`);
               return;
       }

       await this.loadWithErrorHandling(dataKey, endpoint, () => this.renderGameTable(tabName));
   }

   // 테이블 렌더링 함수들
   renderUsersTable() {
       this.renderTable('usersTableBody', this.data.users, [
           { key: 'ID', label: 'ID' },
           { key: 'nickname', label: '닉네임', fallback: 'N/A' },
           { key: 'email', label: '이메일', fallback: 'N/A' },
           { key: 'gold', label: '골드', fallback: 0 },
           { key: 'Using_Character', label: '캐릭터', fallback: 'N/A' },
           { key: 'join_date', label: '가입일', formatter: AdminUtils.formatDate }
       ], (user) => `
          <button class="admin-btn admin-btn-primary" onclick="window.adminManagerActions?.viewUser('${AdminUtils.sanitizeInput(user.ID)}')">상세</button>
          <button class="admin-btn admin-btn-warning" onclick="window.adminManagerActions?.editUser('${AdminUtils.sanitizeInput(user.ID)}')">수정</button>
          <button class="admin-btn admin-btn-danger" onclick="window.adminManagerActions?.deleteUser('${AdminUtils.sanitizeInput(user.ID)}')">삭제</button>
      `);
   }

   renderPostsTable() {
       console.log('게시글 테이블 렌더링, 데이터 개수:', this.data.posts ? this.data.posts.length : 0);
       this.renderTable('postsTableBody', this.data.posts, [
           { key: 'post_id', label: 'ID' },
           { key: 'title', label: '제목', formatter: (text) => AdminUtils.truncateText(text, 30) },
           { key: 'nickname', label: '작성자', fallback: (item) => item.user_id },
           { key: 'category', label: '카테고리' },
           { key: 'views', label: '조회수', fallback: 0 },
           { key: 'likes', label: '좋아요', fallback: 0 },
           { key: 'comment_count', label: '댓글수', fallback: 0 },
           { key: 'created_at', label: '작성일', formatter: AdminUtils.formatDate }
       ], (post) => `
          <button class="admin-btn admin-btn-primary" onclick="window.adminManagerActions?.viewPost(${AdminUtils.safeParseInt(post.post_id)})">상세</button>
          <button class="admin-btn admin-btn-warning" onclick="window.adminManagerActions?.editPost(${AdminUtils.safeParseInt(post.post_id)})">수정</button>
          <button class="admin-btn admin-btn-danger" onclick="window.adminManagerActions?.deletePost(${AdminUtils.safeParseInt(post.post_id)})">삭제</button>
      `);
   }

   renderCommentsTable() {
       this.renderTable('commentsTableBody', this.data.comments, [
           { key: 'comment_id', label: 'ID' },
           { key: 'content', label: '내용', formatter: (text) => AdminUtils.truncateText(text, 50) },
           { key: 'nickname', label: '작성자', fallback: (item) => item.user_id },
           { key: 'post_title', label: '게시글', formatter: (text) => AdminUtils.truncateText(text, 30) },
           { key: 'likes', label: '좋아요', fallback: 0 },
           { key: 'created_at', label: '작성일', formatter: AdminUtils.formatDate }
       ], (comment) => `
          <button class="admin-btn admin-btn-primary" onclick="window.adminManagerActions?.viewComment(${AdminUtils.safeParseInt(comment.comment_id)})">상세</button>
          <button class="admin-btn admin-btn-danger" onclick="window.adminManagerActions?.deleteComment(${AdminUtils.safeParseInt(comment.comment_id)})">삭제</button>
      `);
   }

   renderMediaTable() {
       this.renderTable('mediaTableBody', this.data.media, [
           { key: 'media_id', label: 'ID' },
           { key: 'title', label: '제목', formatter: (text) => AdminUtils.truncateText(text, 30) },
           { key: 'category_name', label: '카테고리', fallback: 'N/A' },
           { key: 'file_type', label: '파일타입' },
           { key: 'file_size', label: '크기', formatter: (size) => AdminUtils.formatFileSize(size || 0) },
           { key: 'views', label: '조회수', fallback: 0 },
           { key: 'likes', label: '좋아요', fallback: 0 },
           { key: 'downloads', label: '다운로드', fallback: 0 },
           { key: 'upload_date', label: '업로드일', formatter: AdminUtils.formatDate },
           {
               key: 'is_published',
               label: '상태',
               formatter: (value) => `<span class="status-badge ${value ? 'status-published' : 'status-draft'}">${value ? '게시됨' : '비공개'}</span>`
           }
       ], (media) => `
          <button class="admin-btn admin-btn-primary" onclick="window.adminManagerActions?.viewMedia(${AdminUtils.safeParseInt(media.media_id)})">상세</button>
          <button class="admin-btn admin-btn-warning" onclick="window.adminManagerActions?.editMedia(${AdminUtils.safeParseInt(media.media_id)})">수정</button>
          <button class="admin-btn admin-btn-danger" onclick="window.adminManagerActions?.deleteMedia(${AdminUtils.safeParseInt(media.media_id)})">삭제</button>
      `);
   }

   renderNewsTable() {
       this.renderTable('newsTableBody', this.data.news, [
           { key: 'news_id', label: 'ID' },
           { key: 'title', label: '제목', formatter: (text) => AdminUtils.truncateText(text, 40) },
           { key: 'category_name', label: '카테고리', fallback: 'N/A' },
           { key: 'views', label: '조회수', fallback: 0 },
           { key: 'is_important', label: '중요', formatter: (value) => value ? '⭐' : '' },
           {
               key: 'is_published',
               label: '상태',
               formatter: (value) => `<span class="status-badge ${value ? 'status-published' : 'status-draft'}">${value ? '게시됨' : '비공개'}</span>`
           },
           { key: 'created_at', label: '작성일', formatter: AdminUtils.formatDate }
       ], (news) => `
          <button class="admin-btn admin-btn-primary" onclick="window.adminManagerActions?.viewNews(${AdminUtils.safeParseInt(news.news_id)})">상세</button>
          <button class="admin-btn admin-btn-warning" onclick="window.adminManagerActions?.editNews(${AdminUtils.safeParseInt(news.news_id)})">수정</button>
          <button class="admin-btn admin-btn-danger" onclick="window.adminManagerActions?.deleteNews(${AdminUtils.safeParseInt(news.news_id)})">삭제</button>
      `);
   }

   renderInquiriesTable() {
       this.renderTable('inquiriesTableBody', this.data.inquiries, [
           { key: 'inquiry_id', label: 'ID' },
           { key: 'title', label: '제목', formatter: (text) => AdminUtils.truncateText(text, 30) },
           { key: 'inquiry_type', label: '유형' },
           { key: 'user_id', label: '사용자ID', fallback: 'Guest' },
           { key: 'user_email', label: '이메일' },
           {
               key: 'status',
               label: '상태',
               formatter: (value) => {
                   const statusMap = {
                       'pending': '대기중',
                       'processing': '처리중',
                       'resolved': '해결완료',
                       'closed': '종료'
                   };
                   const statusText = statusMap[value] || value;
                   return `<span class="status-badge status-${value}">${statusText}</span>`;
               }
           },
           { key: 'created_at', label: '접수일', formatter: AdminUtils.formatDate }
       ], (inquiry) => `
          <button class="admin-btn admin-btn-primary" onclick="window.adminManagerActions?.viewInquiry(${AdminUtils.safeParseInt(inquiry.inquiry_id)})">상세</button>
          <button class="admin-btn admin-btn-warning" onclick="window.adminManagerActions?.editInquiry(${AdminUtils.safeParseInt(inquiry.inquiry_id)})">처리</button>
          <button class="admin-btn admin-btn-danger" onclick="window.adminManagerActions?.deleteInquiry(${AdminUtils.safeParseInt(inquiry.inquiry_id)})">삭제</button>
      `);
   }

   renderFAQTable() {
       this.renderTable('faqTableBody', this.data.faq, [
           { key: 'faq_id', label: 'ID' },
           { key: 'question', label: '질문', formatter: (text) => AdminUtils.truncateText(text, 50) },
           { key: 'category', label: '카테고리' },
           { key: 'views', label: '조회수', fallback: 0 },
           {
               key: 'is_active',
               label: '상태',
               formatter: (value) => `<span class="status-badge ${value ? 'status-published' : 'status-draft'}">${value ? '활성' : '비활성'}</span>`
           },
           { key: 'created_at', label: '등록일', formatter: AdminUtils.formatDate }
       ], (faq) => `
          <button class="admin-btn admin-btn-primary" onclick="window.adminManagerActions?.viewFAQ(${AdminUtils.safeParseInt(faq.faq_id)})">상세</button>
          <button class="admin-btn admin-btn-warning" onclick="window.adminManagerActions?.editFAQ(${AdminUtils.safeParseInt(faq.faq_id)})">수정</button>
          <button class="admin-btn admin-btn-danger" onclick="window.adminManagerActions?.deleteFAQ(${AdminUtils.safeParseInt(faq.faq_id)})">삭제</button>
      `);
   }

   renderGameTable(tabName) {
       const tbody = AdminUtils.getElementById(`${tabName}TableBody`);
       if (!tbody) {
           console.warn(`테이블 바디를 찾을 수 없습니다: ${tabName}TableBody`);
           return;
       }

       switch (tabName) {
           case 'characters':
               this.renderCharactersTable();
               break;
           case 'monsters':
               this.renderMonstersTable();
               break;
           case 'skills':
               this.renderSkillsTable();
               break;
           case 'players':
               this.renderPlayersTable();
               break;
       }
   }

   renderCharactersTable() {
       this.renderTable('charactersTableBody', this.data.characters, [
           { key: 'name', label: '이름' },
           { key: 'hp', label: 'HP' },
           { key: 'atk', label: '공격력' },
           { key: 'luck', label: '운' }
       ], (char) => `
          <button class="admin-btn admin-btn-primary" onclick="window.adminManagerActions?.viewCharacter('${AdminUtils.sanitizeInput(char.name)}')">상세</button>
          <button class="admin-btn admin-btn-warning" onclick="window.adminManagerActions?.editCharacter('${AdminUtils.sanitizeInput(char.name)}')">수정</button>
      `);
   }

   renderMonstersTable() {
       this.renderTable('monstersTableBody', this.data.monsters, [
           { key: 'MonsterID', label: 'ID' },
           { key: 'Name', label: '이름' },
           { key: 'Session', label: '세션' },
           { key: 'Type', label: '타입' },
           { key: 'Element', label: '속성' },
           { key: 'hp_range', label: '체력', formatter: (_, item) => `${item.min_hp || 0}-${item.max_hp || 0}` },
           { key: 'atk_range', label: '공격력', formatter: (_, item) => `${item.min_atk || 0}-${item.max_atk || 0}` },
           { key: 'Special', label: '특수능력', fallback: 'N/A' }
       ], (monster) => `
          <button class="admin-btn admin-btn-primary" onclick="window.adminManagerActions?.viewMonster(${AdminUtils.safeParseInt(monster.MonsterID)})">상세</button>
          <button class="admin-btn admin-btn-warning" onclick="window.adminManagerActions?.editMonster(${AdminUtils.safeParseInt(monster.MonsterID)})">수정</button>
          <button class="admin-btn admin-btn-danger" onclick="window.adminManagerActions?.deleteMonster(${AdminUtils.safeParseInt(monster.MonsterID)})">삭제</button>
      `);
   }

   renderSkillsTable() {
       this.renderTable('skillsTableBody', this.data.skills, [
           { key: 'SkillID', label: '스킬ID' },
           { key: 'skill_Job', label: '직업' },
           { key: 'skill_Type', label: '타입' },
           { key: 'rarity', label: '등급' },
           { key: 'element', label: '속성' },
           { key: 'damage_range', label: '데미지', formatter: (_, item) => `${item.min_damage || 0}-${item.max_damage || 0}` },
           { key: 'statusEffectName', label: '상태이상', fallback: 'N/A' }
       ], (skill) => `
          <button class="admin-btn admin-btn-primary" onclick="window.adminManagerActions?.viewSkill('${AdminUtils.sanitizeInput(skill.SkillID)}')">상세</button>
          <button class="admin-btn admin-btn-warning" onclick="window.adminManagerActions?.editSkill('${AdminUtils.sanitizeInput(skill.SkillID)}')">수정</button>
      `);
   }

   renderPlayersTable() {
       const players = this.data.users.filter(user => user.Using_Character);

       this.renderTable('playersTableBody', players, [
           { key: 'ID', label: '플레이어ID' },
           { key: 'Using_Character', label: '사용캐릭터' },
           { key: 'curr_hp', label: '현재HP', fallback: 0 },
           { key: 'max_hp', label: '최대HP', fallback: 0 },
           { key: 'atk', label: '공격력', fallback: 0 },
           { key: 'WhereSession', label: '위치', fallback: 'N/A' },
           { key: 'WhereStage', label: '스테이지', fallback: 1 }
       ], (player) => `
          <button class="admin-btn admin-btn-primary" onclick="window.adminManagerActions?.viewPlayer('${AdminUtils.sanitizeInput(player.ID)}')">상세</button>
          <button class="admin-btn admin-btn-warning" onclick="window.adminManagerActions?.editPlayer('${AdminUtils.sanitizeInput(player.ID)}')">수정</button>
      `);
   }

   // 수정된 renderTable 함수 - 무한루프 방지
   renderTable(tableBodyId, data, columns, actionRenderer) {
       // 렌더링 중복 방지를 위한 플래그
       if (this._isRendering) {
           console.warn('이미 렌더링 중입니다. 중복 호출을 방지합니다.');
           return;
       }
       
       this._isRendering = true;
       
       try {
           const tbody = AdminUtils.getElementById(tableBodyId);
           if (!tbody) return;

           if (!Array.isArray(data) || data.length === 0) {
               tbody.innerHTML = `<tr><td colspan="${columns.length + (actionRenderer ? 1 : 0)}" class="loading">등록된 데이터가 없습니다.</td></tr>`;
               return;
           }

           tbody.innerHTML = data.map(item => {
               const cells = columns.map((column, columnIndex) => {
                   let value = item[column.key];

                   if (value === null || value === undefined || value === '') {
                       if (typeof column.fallback === 'function') {
                           value = column.fallback(item);
                       } else {
                           value = column.fallback || 'N/A';
                       }
                   }

                   if (column.formatter) {
                       try {
                           value = column.formatter(value, item);
                       } catch (error) {
                           console.error('Formatter 오류:', error);
                           value = 'Error';
                       }
                   }

                   return `<td>${value}</td>`;
               }).join('');

               const actions = actionRenderer ? `<td>${actionRenderer(item)}</td>` : '';
               return `<tr>${cells}${actions}</tr>`;
           }).join('');
           
       } catch (error) {
           console.error(`테이블 렌더링 오류 (${tableBodyId}):`, error);
           const tbody = AdminUtils.getElementById(tableBodyId);
           if (tbody) {
               tbody.innerHTML = `<tr><td colspan="${columns.length + (actionRenderer ? 1 : 0)}" class="loading" style="color: #e74c3c;">테이블 렌더링 중 오류가 발생했습니다.</td></tr>`;
           }
       } finally {
           this._isRendering = false;
       }
   }

   // 상세보기 함수들
   showDetailView(type, data) {
       let modal = document.getElementById('detailViewModal');

       if (!modal) {
           modal = document.createElement('div');
           modal.id = 'detailViewModal';
           modal.className = 'detail-view-modal';
           document.body.appendChild(modal);
       }

       modal.innerHTML = `
          <div class="detail-view-container">
              <div class="detail-view-header">
                  <h2>${this.getDetailTitle(type, data)}</h2>
                  <button class="detail-close-btn" onclick="window.adminManagerActions?.closeDetailView()">✕</button>
              </div>
              <div class="detail-view-content">
                  ${this.renderDetailContent(type, data)}
              </div>
              <div class="detail-view-footer">
                  <button class="admin-btn admin-btn-warning" onclick="window.adminManagerActions?.editFromDetail('${type}', '${this.getItemId(type, data)}')">수정</button>
                  <button class="admin-btn admin-btn-danger" onclick="window.adminManagerActions?.deleteFromDetail('${type}', '${this.getItemId(type, data)}')">삭제</button>
                  <button class="admin-btn admin-btn-secondary" onclick="window.adminManagerActions?.closeDetailView()">닫기</button>
              </div>
          </div>
      `;

       modal.style.display = 'flex';
   }

   getDetailTitle(type, data) {
       switch (type) {
           case 'user': return `사용자 정보: ${data.nickname || data.ID}`;
           case 'post': return `게시글: ${data.title}`;
           case 'comment': return `댓글 정보`;
           case 'media': return `미디어: ${data.title}`;
           case 'news': return `뉴스: ${data.title}`;
           case 'inquiry': return `문의사항: ${data.title}`;
           case 'faq': return `FAQ: ${data.question}`;
           case 'character': return `캐릭터: ${data.name}`;
           case 'monster': return `몬스터: ${data.Name}`;
           case 'skill': return `스킬: ${data.SkillID}`;
           case 'player': return `플레이어: ${data.ID}`;
           default: return '상세 정보';
       }
   }

   getItemId(type, data) {
       switch (type) {
           case 'user': return data.ID;
           case 'post': return data.post_id;
           case 'comment': return data.comment_id;
           case 'media': return data.media_id;
           case 'news': return data.news_id;
           case 'inquiry': return data.inquiry_id;
           case 'faq': return data.faq_id;
           case 'character': return data.name;
           case 'monster': return data.MonsterID;
           case 'skill': return data.SkillID;
           case 'player': return data.ID;
           default: return '';
       }
   }

   renderDetailContent(type, data) {
       switch (type) {
           case 'user': return this.renderUserDetail(data);
           case 'post': return this.renderPostDetail(data);
           case 'comment': return this.renderCommentDetail(data);
           case 'media': return this.renderMediaDetail(data);
           case 'news': return this.renderNewsDetail(data);
           case 'inquiry': return this.renderInquiryDetail(data);
           case 'faq': return this.renderFAQDetail(data);
           case 'character': return this.renderCharacterDetail(data);
           case 'monster': return this.renderMonsterDetail(data);
           case 'skill': return this.renderSkillDetail(data);
           case 'player': return this.renderPlayerDetail(data);
           default: return '<p>데이터를 표시할 수 없습니다.</p>';
       }
   }

   renderUserDetail(user) {
       return `
          <div class="detail-grid">
              <div class="detail-section">
                  <h3>기본 정보</h3>
                  <div class="detail-item">
                      <span class="detail-label">ID:</span>
                      <span class="detail-value">${user.ID}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">닉네임:</span>
                      <span class="detail-value">${user.nickname || 'N/A'}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">이메일:</span>
                      <span class="detail-value">${user.email || 'N/A'}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">성별:</span>
                      <span class="detail-value">${user.gender || 'N/A'}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">생년월일:</span>
                      <span class="detail-value">${user.birth_date ? AdminUtils.formatDate(user.birth_date) : 'N/A'}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">가입일:</span>
                      <span class="detail-value">${AdminUtils.formatDate(user.join_date)}</span>
                  </div>
              </div>
              
              <div class="detail-section">
                  <h3>게임 정보</h3>
                  <div class="detail-item">
                      <span class="detail-label">골드:</span>
                      <span class="detail-value">${user.gold || 0}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">사용 캐릭터:</span>
                      <span class="detail-value">${user.Using_Character || 'N/A'}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">현재 HP:</span>
                      <span class="detail-value">${user.curr_hp || 0} / ${user.max_hp || 0}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">공격력:</span>
                      <span class="detail-value">${user.atk || 0}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">운:</span>
                      <span class="detail-value">${user.luck || 0}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">위치:</span>
                      <span class="detail-value">${user.WhereSession || 'N/A'} - Stage ${user.WhereStage || 1}</span>
                  </div>
              </div>
          </div>
      `;
   }

   renderPostDetail(post) {
       return `
          <div class="detail-post">
              <div class="post-header">
                  <h2 class="post-title">${post.title}</h2>
                  <div class="post-meta">
                      <span class="meta-item"><strong>작성자:</strong> ${post.nickname || post.user_id}</span>
                      <span class="meta-item"><strong>카테고리:</strong> ${post.category}</span>
                      <span class="meta-item"><strong>작성일:</strong> ${AdminUtils.formatDate(post.created_at)}</span>
                  </div>
              </div>
              
              <div class="post-content">
                  ${post.content || 'N/A'}
              </div>
              
              <div class="post-stats">
                  <div class="stat-item">
                      <span class="stat-icon">👁️</span>
                      <span class="stat-value">${post.views || 0}</span>
                      <span class="stat-label">조회수</span>
                  </div>
                  <div class="stat-item">
                      <span class="stat-icon">❤️</span>
                      <span class="stat-value">${post.likes || 0}</span>
                      <span class="stat-label">좋아요</span>
                  </div>
                  <div class="stat-item">
                      <span class="stat-icon">💬</span>
                      <span class="stat-value">${post.comment_count || 0}</span>
                      <span class="stat-label">댓글</span>
                  </div>
              </div>
          </div>
      `;
   }

   renderCommentDetail(comment) {
       return `
          <div class="detail-comment">
              <div class="comment-info">
                  <h3>댓글 정보</h3>
                  <div class="detail-item">
                      <span class="detail-label">댓글 ID:</span>
                      <span class="detail-value">${comment.comment_id}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">작성자:</span>
                      <span class="detail-value">${comment.nickname || comment.user_id}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">원글:</span>
                      <span class="detail-value">${comment.post_title || 'N/A'}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">작성일:</span>
                      <span class="detail-value">${AdminUtils.formatDate(comment.created_at)}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">좋아요:</span>
                      <span class="detail-value">${comment.likes || 0}</span>
                  </div>
              </div>
              
              <div class="comment-content-box">
                  <h3>댓글 내용</h3>
                  <div class="comment-text">${comment.content}</div>
              </div>
          </div>
      `;
   }

   renderMediaDetail(media) {
       const mediaUrl = media.file_url || `/uploads/media/${media.file_name}`;
       const isImage = AdminUtils.isImageFile(media.file_name || '');
       const isVideo = AdminUtils.isVideoFile(media.file_name || '') || (media.mime_type && media.mime_type.includes('video'));

       return `
          <div class="detail-media">
              <div class="media-preview-section">
                  ${isImage ? `
                      <img src="${mediaUrl}" alt="${media.title}" style="max-width: 100%; height: auto; border-radius: 8px;">
                  ` : isVideo ? `
                      <video controls style="max-width: 100%; height: auto; border-radius: 8px;">
                          <source src="${mediaUrl}" type="${media.mime_type || 'video/mp4'}">
                          브라우저가 비디오를 지원하지 않습니다.
                      </video>
                  ` : `
                      <div class="file-preview">
                          <div class="file-icon">📄</div>
                          <div class="file-info">
                              <p>${media.file_name || 'Unknown File'}</p>
                              <p>${AdminUtils.formatFileSize(media.file_size || 0)}</p>
                              <a href="${mediaUrl}" target="_blank" class="admin-btn admin-btn-primary">파일 다운로드</a>
                          </div>
                      </div>
                  `}
              </div>
              
              <div class="media-info">
                  <h3>미디어 정보</h3>
                  <div class="detail-grid">
                      <div class="detail-item">
                          <span class="detail-label">제목:</span>
                          <span class="detail-value">${media.title}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">카테고리:</span>
                          <span class="detail-value">${media.category_name || 'N/A'}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">파일 타입:</span>
                          <span class="detail-value">${media.file_type || 'N/A'}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">파일 크기:</span>
                          <span class="detail-value">${AdminUtils.formatFileSize(media.file_size || 0)}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">업로드 날짜:</span>
                          <span class="detail-value">${AdminUtils.formatDate(media.upload_date)}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">상태:</span>
                          <span class="detail-value">
                              <span class="status-badge ${media.is_published ? 'status-published' : 'status-draft'}">
                                  ${media.is_published ? '게시됨' : '비공개'}
                              </span>
                          </span>
                      </div>
                  </div>
                  
                  <div class="media-stats">
                      <div class="stat-card">
                          <div class="stat-number">${media.views || 0}</div>
                          <div class="stat-label">조회수</div>
                      </div>
                      <div class="stat-card">
                          <div class="stat-number">${media.likes || 0}</div>
                          <div class="stat-label">좋아요</div>
                      </div>
                      <div class="stat-card">
                          <div class="stat-number">${media.downloads || 0}</div>
                          <div class="stat-label">다운로드</div>
                      </div>
                  </div>
                  
                  ${media.description ? `
                      <div class="media-description">
                          <h3>설명</h3>
                          <p>${media.description}</p>
                      </div>
                  ` : ''}
              </div>
          </div>
      `;
   }

   renderNewsDetail(news) {
       return `
          <div class="detail-news">
              <div class="news-header">
                  ${news.is_important ? '<span class="important-badge">⭐ 중요 공지</span>' : ''}
                  <h2>${news.title}</h2>
                  <div class="news-meta">
                      <span>카테고리: ${news.category_name || 'N/A'}</span>
                      <span>작성일: ${AdminUtils.formatDate(news.created_at)}</span>
                      <span>조회수: ${news.views || 0}</span>
                  </div>
              </div>
              
              <div class="news-content">
                  ${news.content || 'N/A'}
              </div>
              
              <div class="news-status">
                  <span class="status-badge ${news.is_published ? 'status-published' : 'status-draft'}">
                      ${news.is_published ? '게시됨' : '비공개'}
                  </span>
              </div>
          </div>
      `;
   }

   renderInquiryDetail(inquiry) {
       const statusMap = {
           'pending': '대기중',
           'processing': '처리중',
           'resolved': '해결완료',
           'closed': '종료'
       };

       return `
          <div class="detail-inquiry">
              <div class="inquiry-header">
                  <h2>${inquiry.title}</h2>
                  <span class="status-badge status-${inquiry.status}">
                      ${statusMap[inquiry.status] || inquiry.status}
                  </span>
              </div>
              
              <div class="inquiry-info">
                  <div class="detail-item">
                      <span class="detail-label">문의 유형:</span>
                      <span class="detail-value">${inquiry.inquiry_type}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">사용자:</span>
                      <span class="detail-value">${inquiry.user_id || 'Guest'}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">이메일:</span>
                      <span class="detail-value">${inquiry.user_email}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">접수일:</span>
                      <span class="detail-value">${AdminUtils.formatDate(inquiry.created_at)}</span>
                  </div>
              </div>
              
              <div class="inquiry-content-section">
                  <h3>문의 내용</h3>
                  <div class="content-box">
                      ${inquiry.content}
                  </div>
              </div>
              
              ${inquiry.response ? `
                  <div class="inquiry-response-section">
                      <h3>답변</h3>
                      <div class="content-box">
                          ${inquiry.response}
                      </div>
                      <div class="response-date">
                          답변일: ${AdminUtils.formatDate(inquiry.response_date)}
                      </div>
                  </div>
              ` : ''}
          </div>
      `;
   }

   renderFAQDetail(faq) {
       return `
          <div class="detail-faq">
              <div class="faq-header">
                  <h2>FAQ #${faq.faq_id}</h2>
                  <span class="status-badge ${faq.is_active ? 'status-published' : 'status-draft'}">
                      ${faq.is_active ? '활성' : '비활성'}
                  </span>
              </div>
              
              <div class="faq-info">
                  <div class="detail-item">
                      <span class="detail-label">카테고리:</span>
                      <span class="detail-value">${faq.category}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">조회수:</span>
                      <span class="detail-value">${faq.views || 0}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">등록일:</span>
                      <span class="detail-value">${AdminUtils.formatDate(faq.created_at)}</span>
                  </div>
                  <div class="detail-item">
                      <span class="detail-label">수정일:</span>
                      <span class="detail-value">${AdminUtils.formatDate(faq.updated_at)}</span>
                  </div>
              </div>
              
              <div class="faq-qa">
                   <div class="faq-question">
                       <h3>질문</h3>
                       <div class="content-box">${faq.question}</div>
                   </div>
                   
                   <div class="faq-answer">
                       <h3>답변</h3>
                       <div class="content-box">${faq.answer}</div>
                   </div>
               </div>
           </div>
       `;
   }

   renderCharacterDetail(character) {
       return `
          <div class="detail-character">
              <h3>캐릭터 정보</h3>
              <div class="character-stats">
                  <div class="stat-card">
                      <div class="stat-label">이름</div>
                      <div class="stat-number">${character.name}</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-label">체력 (HP)</div>
                      <div class="stat-number">${character.hp}</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-label">공격력 (ATK)</div>
                      <div class="stat-number">${character.atk}</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-label">운 (LUCK)</div>
                      <div class="stat-number">${character.luck}</div>
                  </div>
              </div>
          </div>
      `;
   }

   renderMonsterDetail(monster) {
       return `
          <div class="detail-monster">
              <h2>몬스터: ${monster.Name}</h2>
              
              <div class="monster-info">
                  <div class="info-section">
                      <h3>기본 정보</h3>
                      <div class="detail-item">
                          <span class="detail-label">ID:</span>
                          <span class="detail-value">${monster.MonsterID}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">세션:</span>
                          <span class="detail-value">${monster.Session}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">타입:</span>
                          <span class="detail-value">${monster.Type}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">속성:</span>
                          <span class="detail-value">${monster.Element}</span>
                      </div>
                  </div>
                  
                  <div class="info-section">
                      <h3>전투 스탯</h3>
                      <div class="detail-item">
                          <span class="detail-label">체력 범위:</span>
                          <span class="detail-value">${monster.min_hp || 0} ~ ${monster.max_hp || 0}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">공격력 범위:</span>
                          <span class="detail-value">${monster.min_atk || 0} ~ ${monster.max_atk || 0}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">운:</span>
                          <span class="detail-value">${monster.luck || 0}</span>
                      </div>
                  </div>
              </div>
              
              ${monster.Special ? `
                  <div class="monster-special">
                      <h3>특수 능력</h3>
                      <div class="content-box">${monster.Special}</div>
                  </div>
              ` : ''}
              
              ${monster.Description ? `
                  <div class="monster-description">
                      <h3>설명</h3>
                      <div class="content-box">${monster.Description}</div>
                  </div>
              ` : ''}
          </div>
      `;
   }

   renderSkillDetail(skill) {
       return `
          <div class="detail-skill">
              <h2>스킬: ${skill.SkillID}</h2>
              
              <div class="skill-info">
                  <div class="info-grid">
                      <div class="detail-item">
                          <span class="detail-label">직업:</span>
                          <span class="detail-value">${skill.skill_Job}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">타입:</span>
                          <span class="detail-value">${skill.skill_Type}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">등급:</span>
                          <span class="detail-value">${skill.rarity}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">속성:</span>
                          <span class="detail-value">${skill.element}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">대상:</span>
                          <span class="detail-value">${skill.target}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">데미지 범위:</span>
                          <span class="detail-value">${skill.min_damage || 0} ~ ${skill.max_damage || 0}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">히트 횟수:</span>
                          <span class="detail-value">${skill.hit_time || 1}</span>
                      </div>
                  </div>
                  
                  ${skill.statusEffectName ? `
                      <div class="skill-status">
                          <h3>상태이상 효과</h3>
                          <div class="detail-item">
                              <span class="detail-label">효과:</span>
                              <span class="detail-value">${skill.statusEffectName}</span>
                          </div>
                          <div class="detail-item">
                              <span class="detail-label">확률:</span>
                              <span class="detail-value">${skill.statusEffectRate || 0}%</span>
                          </div>
                          <div class="detail-item">
                              <span class="detail-label">지속 턴:</span>
                              <span class="detail-value">${skill.statusEffectTurn || 0}</span>
                          </div>
                      </div>
                  ` : ''}
              </div>
          </div>
      `;
   }

   renderPlayerDetail(player) {
       return `
          <div class="detail-player">
              <h2>플레이어: ${player.ID}</h2>
              
              <div class="player-info">
                  <div class="info-section">
                      <h3>계정 정보</h3>
                      <div class="detail-item">
                          <span class="detail-label">닉네임:</span>
                          <span class="detail-value">${player.nickname || 'N/A'}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">이메일:</span>
                          <span class="detail-value">${player.email || 'N/A'}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">골드:</span>
                          <span class="detail-value">${player.gold || 0}</span>
                      </div>
                  </div>
                  
                  <div class="info-section">
                      <h3>캐릭터 정보</h3>
                      <div class="detail-item">
                          <span class="detail-label">사용 캐릭터:</span>
                          <span class="detail-value">${player.Using_Character || 'N/A'}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">현재 HP:</span>
                          <span class="detail-value">${player.curr_hp || 0} / ${player.max_hp || 0}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">공격력:</span>
                          <span class="detail-value">${player.atk || 0}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">운:</span>
                          <span class="detail-value">${player.luck || 0}</span>
                      </div>
                  </div>
                  
                  <div class="info-section">
                      <h3>게임 진행도</h3>
                      <div class="detail-item">
                          <span class="detail-label">현재 위치:</span>
                          <span class="detail-value">${player.WhereSession || 'N/A'}</span>
                      </div>
                      <div class="detail-item">
                          <span class="detail-label">스테이지:</span>
                          <span class="detail-value">${player.WhereStage || 1}</span>
                      </div>
                  </div>
              </div>
          </div>
      `;
   }

   // 상세보기 액션 함수들
   async viewUser(userId) {
       // 데이터 로드 대기
       await this.waitForData('users');
       
       const user = this.data.users.find(u => u.ID === userId);
       if (!user) {
           this.showMessage('사용자를 찾을 수 없습니다.', 'error');
           return;
       }
       this.showDetailView('user', user);
   }

   async viewPost(postId) {
       // 데이터 로드 대기
       await this.waitForData('posts');
       
       const post = this.data.posts.find(p => p.post_id === postId);
       if (!post) {
           this.showMessage('게시글을 찾을 수 없습니다.', 'error');
           return;
       }
       this.showDetailView('post', post);
   }

   async viewComment(commentId) {
       const comment = this.data.comments.find(c => c.comment_id === commentId);
       if (!comment) {
           this.showMessage('댓글을 찾을 수 없습니다.', 'error');
           return;
       }
       this.showDetailView('comment', comment);
   }

   async viewMedia(mediaId) {
       const media = this.data.media.find(m => m.media_id === mediaId);
       if (!media) {
           this.showMessage('미디어를 찾을 수 없습니다.', 'error');
           return;
       }
       this.showDetailView('media', media);
   }

   async viewNews(newsId) {
       const news = this.data.news.find(n => n.news_id === newsId);
       if (!news) {
           this.showMessage('뉴스를 찾을 수 없습니다.', 'error');
           return;
       }
       this.showDetailView('news', news);
   }

   async viewInquiry(inquiryId) {
       const inquiry = this.data.inquiries.find(i => i.inquiry_id === inquiryId);
       if (!inquiry) {
           this.showMessage('문의사항을 찾을 수 없습니다.', 'error');
           return;
       }
       this.showDetailView('inquiry', inquiry);
   }

   async viewFAQ(faqId) {
       const faq = this.data.faq.find(f => f.faq_id === faqId);
       if (!faq) {
           this.showMessage('FAQ를 찾을 수 없습니다.', 'error');
           return;
       }
       this.showDetailView('faq', faq);
   }

   async viewCharacter(charName) {
       const character = this.data.characters.find(c => c.name === charName);
       if (!character) {
           this.showMessage('캐릭터를 찾을 수 없습니다.', 'error');
           return;
       }
       this.showDetailView('character', character);
   }

   async viewMonster(monsterId) {
       const monster = this.data.monsters.find(m => m.MonsterID === monsterId);
       if (!monster) {
           this.showMessage('몬스터를 찾을 수 없습니다.', 'error');
           return;
       }
       this.showDetailView('monster', monster);
   }

   async viewSkill(skillId) {
       const skill = this.data.skills.find(s => s.SkillID === skillId);
       if (!skill) {
           this.showMessage('스킬을 찾을 수 없습니다.', 'error');
           return;
       }
       this.showDetailView('skill', skill);
   }

   async viewPlayer(playerId) {
       const player = this.data.users.find(u => u.ID === playerId);
       if (!player) {
           this.showMessage('플레이어를 찾을 수 없습니다.', 'error');
           return;
       }
       this.showDetailView('player', player);
   }

   closeDetailView() {
       const modal = document.getElementById('detailViewModal');
       if (modal) {
           modal.style.display = 'none';
       }
   }

   async editFromDetail(type, id) {
       this.closeDetailView();
       
       // 타입에 따라 올바른 섹션으로 전환
       const sectionMap = {
           'user': 'users',
           'post': 'posts',
           'media': 'media',
           'news': 'news',
           'inquiry': 'inquiries',
           'faq': 'faq',
           'character': 'game',
           'monster': 'game',
           'skill': 'game',
           'player': 'game'
       };
       
       const targetSection = sectionMap[type];
       if (targetSection && this.currentSection !== targetSection) {
           this.switchSection(targetSection);
           
           // 게임 데이터의 경우 탭도 전환
           if (targetSection === 'game') {
               const tabMap = {
                   'character': 'characters',
                   'monster': 'monsters',
                   'skill': 'skills',
                   'player': 'players'
               };
               const targetTab = tabMap[type];
               if (targetTab) {
                   await new Promise(resolve => setTimeout(resolve, 100));
                   this.switchGameTab(targetTab);
               }
           }
           
           await new Promise(resolve => setTimeout(resolve, 200));
       }
       
       switch (type) {
           case 'user': await this.editUser(id); break;
           case 'post': await this.editPost(parseInt(id)); break;
           case 'media': await this.editMedia(parseInt(id)); break;
           case 'news': await this.editNews(parseInt(id)); break;
           case 'inquiry': await this.editInquiry(parseInt(id)); break;
           case 'faq': await this.editFAQ(parseInt(id)); break;
           case 'character': await this.editCharacter(id); break;
           case 'monster': await this.editMonster(parseInt(id)); break;
           case 'skill': await this.editSkill(id); break;
           case 'player': await this.editPlayer(id); break;
       }
   }

   async deleteFromDetail(type, id) {
       this.closeDetailView();
       switch (type) {
           case 'user': await this.deleteUser(id); break;
           case 'post': await this.deletePost(parseInt(id)); break;
           case 'comment': await this.deleteComment(parseInt(id)); break;
           case 'media': await this.deleteMedia(parseInt(id)); break;
           case 'news': await this.deleteNews(parseInt(id)); break;
           case 'inquiry': await this.deleteInquiry(parseInt(id)); break;
           case 'faq': await this.deleteFAQ(parseInt(id)); break;
           case 'monster': await this.deleteMonster(parseInt(id)); break;
       }
   }

   // CRUD 작업 공통 함수
   async performCRUDOperation(operation, endpoint, data, successMessage, onSuccess) {
       try {
           let result;

           switch (operation) {
               case 'CREATE':
                   result = await AdminAPI.post(endpoint, data);
                   break;
               case 'UPDATE':
                   result = await AdminAPI.put(endpoint, data);
                   break;
               case 'DELETE':
                   result = await AdminAPI.delete(endpoint);
                   console.log('DELETE 작업 완료:', endpoint);
                   break;
               default:
                   throw new Error('지원하지 않는 작업입니다.');
           }

           this.showMessage(successMessage, 'success');

           if (onSuccess) {
               await onSuccess();
           }

           await this.loadDashboardStats();

           return result;
       } catch (error) {
           const errorMessage = this.getErrorMessage(error);
           this.showMessage(errorMessage, 'error');
           console.error(`${operation} 작업 오류:`, error);
           throw error;
       }
   }

   // 사용자 관리 CRUD
   async editUser(userId) {
       console.log('editUser 호출됨:', userId);
       
       // 현재 섹션이 users가 아니면 전환
       if (this.currentSection !== 'users') {
           console.log('users 섹션으로 전환');
           this.switchSection('users');
           await new Promise(resolve => setTimeout(resolve, 100));
       }
       
       if (!this.initialized) {
           console.error('AdminManager가 초기화되지 않음');
           return;
       }

       // 데이터 로드 대기
       console.log('사용자 데이터 로드 대기');
       await this.waitForData('users');
       
       const user = this.data.users.find(u => u.ID === userId);
       if (!user) {
           this.showMessage('사용자를 찾을 수 없습니다.', 'error');
           return;
       }

       const validationRules = {
           nickname: { required: true, label: '닉네임', minLength: 2, maxLength: 20 },
           email: { required: true, label: '이메일', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
           gold: { required: true, label: '골드' }
       };

       this.showEditModal('사용자 정보 수정', {
           nickname: { type: 'text', value: user.nickname || '', label: '닉네임' },
           email: { type: 'email', value: user.email || '', label: '이메일' },
           gold: { type: 'number', value: user.gold || 0, label: '골드', min: 0 }
       }, async (formData) => {
           const errors = AdminUtils.validateFormData(formData, validationRules);
           if (errors.length > 0) {
               this.showMessage(errors[0], 'error');
               return;
           }

           await this.performCRUDOperation(
               'UPDATE',
               `${ADMIN_CONFIG.ENDPOINTS.ADMIN_USERS}/${userId}`,
               formData,
               '사용자 정보가 수정되었습니다.',
               async () => {
                   await this.loadUsers();
                   this.closeModal('editModal');
               }
           );
       });
   }

   async deleteUser(userId) {
       if (!this.initialized) return;

       if (!confirm(`사용자 ${userId}를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

       await this.performCRUDOperation(
           'DELETE',
           `${ADMIN_CONFIG.ENDPOINTS.ADMIN_USERS}/${userId}`,
           null,
           '사용자가 삭제되었습니다.',
           async () => {
               // 로컬 데이터에서 즉시 제거
               this.data.users = this.data.users.filter(u => u.ID !== userId);
               this.renderUsersTable();
               
               // 서버에서 최신 데이터 다시 로드
               setTimeout(async () => {
                   await this.loadUsers();
               }, 500);
           }
       );
   }

   // 게시글 관리 CRUD
   async editPost(postId) {
       // 현재 섹션이 posts가 아니면 전환
       if (this.currentSection !== 'posts') {
           this.switchSection('posts');
           await new Promise(resolve => setTimeout(resolve, 100));
       }
       if (!this.initialized) return;

       // 데이터 로드 대기
       await this.waitForData('posts');
       
       const post = this.data.posts.find(p => p.post_id === postId);
       if (!post) {
           this.showMessage('게시글을 찾을 수 없습니다.', 'error');
           return;
       }

       const validationRules = {
           title: { required: true, label: '제목', minLength: 1, maxLength: 200 },
           content: { required: true, label: '내용', minLength: 1 },
           category: { required: true, label: '카테고리' }
       };

       this.showEditModal('게시글 수정', {
           title: { type: 'text', value: post.title, label: '제목', required: true },
           content: { type: 'textarea', value: post.content, label: '내용', required: true },
           category: { type: 'select', value: post.category, label: '카테고리', options: ADMIN_CONFIG.CATEGORIES.POST }
       }, async (formData) => {
           const errors = AdminUtils.validateFormData(formData, validationRules);
           if (errors.length > 0) {
               this.showMessage(errors[0], 'error');
               return;
           }

           await this.performCRUDOperation(
               'UPDATE',
               `${ADMIN_CONFIG.ENDPOINTS.ADMIN_POSTS}/${postId}`,
               formData,
               '게시글이 수정되었습니다.',
               async () => {
                   await this.loadPosts();
                   this.closeModal('editModal');
               }
           );
       });
   }

   async deletePost(postId) {
       if (!this.initialized) return;

       if (!confirm('이 게시글을 삭제하시겠습니까?')) return;

       console.log('게시글 삭제 시작:', postId);
       
       try {
           // 삭제 전 게시글 수 저장
           const beforeCount = this.data.posts.length;
           
           await this.performCRUDOperation(
               'DELETE',
               `${ADMIN_CONFIG.ENDPOINTS.ADMIN_POSTS}/${postId}`,
               null,
               '게시글이 삭제되었습니다.',
               async () => {
                   console.log('게시글 삭제 API 호출 성공');
                   
                   // 로컬 데이터에서 즉시 제거
                   this.data.posts = this.data.posts.filter(p => p.post_id !== postId);
                   console.log(`로컬 데이터 업데이트: ${beforeCount}개 -> ${this.data.posts.length}개`);
                   
                   // 테이블 즉시 갱신
                   this.renderPostsTable();
                   
                   // 1초 후 서버에서 강제 새로고침
                   setTimeout(async () => {
                       console.log('서버 데이터 동기화 시작');
                       await this.loadPosts(true); // 강제 새로고침
                       
                       // 삭제 확인
                       const afterDelete = this.data.posts.find(p => p.post_id === postId);
                       if (afterDelete) {
                           console.error('경고: 삭제된 게시글이 여전히 서버에 존재합니다!', postId);
                           this.showMessage('게시글 삭제가 서버에 반영되지 않았습니다. 페이지를 새로고침해주세요.', 'warning');
                       } else {
                           console.log('게시글 삭제 확인 완료');
                       }
                   }, 1000);
               }
           );
       } catch (error) {
           console.error('게시글 삭제 실패:', error);
           this.showMessage('게시글 삭제 중 오류가 발생했습니다.', 'error');
           // 실패 시 데이터 다시 로드
           await this.loadPosts(true);
       }
   }

   // 댓글 관리 CRUD
   async deleteComment(commentId) {
       if (!this.initialized) return;

       if (!confirm('이 댓글을 삭제하시겠습니까?')) return;

       await this.performCRUDOperation(
           'DELETE',
           `${ADMIN_CONFIG.ENDPOINTS.ADMIN_COMMENTS}/${commentId}`,
           null,
           '댓글이 삭제되었습니다.',
           () => this.loadComments()
       );
   }

   // 미디어 관리 CRUD
   async editMedia(mediaId) {
       // 현재 섹션이 media가 아니면 전환
       if (this.currentSection !== 'media') {
           this.switchSection('media');
           await new Promise(resolve => setTimeout(resolve, 100));
       }
       if (!this.initialized) return;

       const media = this.data.media.find(m => m.media_id === mediaId);
       if (!media) {
           this.showMessage('미디어를 찾을 수 없습니다.', 'error');
           return;
       }

       const validationRules = {
           title: { required: true, label: '제목', minLength: 1, maxLength: 200 }
       };

       this.showEditModal('미디어 정보 수정', {
           title: { type: 'text', value: media.title, label: '제목', required: true },
           description: { type: 'textarea', value: media.description || '', label: '설명' },
           category_id: {
               type: 'select',
               value: media.category_id,
               label: '카테고리',
               options: ADMIN_CONFIG.CATEGORIES.MEDIA
           },
           is_featured: { type: 'checkbox', value: media.is_featured, label: '추천 미디어' },
           is_published: { type: 'checkbox', value: media.is_published, label: '공개 여부' }
       }, async (formData) => {
           const errors = AdminUtils.validateFormData(formData, validationRules);
           if (errors.length > 0) {
               this.showMessage(errors[0], 'error');
               return;
           }

           await this.performCRUDOperation(
               'UPDATE',
               `${ADMIN_CONFIG.ENDPOINTS.ADMIN_MEDIA}/${mediaId}`,
               formData,
               '미디어 정보가 수정되었습니다.',
               async () => {
                   await this.loadMedia();
                   this.closeModal('editModal');
               }
           );
       });
   }

   async deleteMedia(mediaId) {
       if (!this.initialized) return;

       if (!confirm('이 미디어를 삭제하시겠습니까?')) return;

       await this.performCRUDOperation(
           'DELETE',
           `${ADMIN_CONFIG.ENDPOINTS.ADMIN_MEDIA}/${mediaId}`,
           null,
           '미디어가 삭제되었습니다.',
           () => this.loadMedia()
       );
   }

   // 뉴스 관리 CRUD
   async editNews(newsId) {
       // 현재 섹션이 news가 아니면 전환
       if (this.currentSection !== 'news') {
           this.switchSection('news');
           await new Promise(resolve => setTimeout(resolve, 100));
       }
       if (!this.initialized) return;

       const news = this.data.news.find(n => n.news_id === newsId);
       if (!news) {
           this.showMessage('뉴스를 찾을 수 없습니다.', 'error');
           return;
       }

       const validationRules = {
           title: { required: true, label: '제목', minLength: 1, maxLength: 200 },
           content: { required: true, label: '내용', minLength: 1 }
       };

       this.showEditModal('뉴스 수정', {
           title: { type: 'text', value: news.title, label: '제목', required: true },
           content: { type: 'textarea', value: news.content, label: '내용', required: true },
           category_id: {
               type: 'select',
               value: news.category_id,
               label: '카테고리',
               options: ADMIN_CONFIG.CATEGORIES.NEWS
           },
           is_important: { type: 'checkbox', value: news.is_important, label: '중요 공지' },
           is_published: { type: 'checkbox', value: news.is_published, label: '공개 여부' }
       }, async (formData) => {
           const errors = AdminUtils.validateFormData(formData, validationRules);
           if (errors.length > 0) {
               this.showMessage(errors[0], 'error');
               return;
           }

           await this.performCRUDOperation(
               'UPDATE',
               `${ADMIN_CONFIG.ENDPOINTS.ADMIN_NEWS}/${newsId}`,
               formData,
               '뉴스가 수정되었습니다.',
               async () => {
                   await this.loadNews();
                   this.closeModal('editModal');
               }
           );
       });
   }

   async deleteNews(newsId) {
       if (!this.initialized) return;

       if (!confirm('이 뉴스를 삭제하시겠습니까?')) return;

       await this.performCRUDOperation(
           'DELETE',
           `${ADMIN_CONFIG.ENDPOINTS.ADMIN_NEWS}/${newsId}`,
           null,
           '뉴스가 삭제되었습니다.',
           () => this.loadNews()
       );
   }

   // 문의사항 관리 CRUD
   async editInquiry(inquiryId) {
       // 현재 섹션이 inquiries가 아니면 전환
       if (this.currentSection !== 'inquiries') {
           this.switchSection('inquiries');
           await new Promise(resolve => setTimeout(resolve, 100));
       }
       if (!this.initialized) return;

       const inquiry = this.data.inquiries.find(i => i.inquiry_id === inquiryId);
       if (!inquiry) {
           this.showMessage('문의사항을 찾을 수 없습니다.', 'error');
           return;
       }

       const validationRules = {
           status: { required: true, label: '상태' }
       };

       this.showEditModal('문의사항 처리', {
           status: {
               type: 'select',
               value: inquiry.status,
               label: '처리 상태',
               options: [
                   { value: 'pending', text: '대기중' },
                   { value: 'processing', text: '처리중' },
                   { value: 'resolved', text: '해결완료' },
                   { value: 'closed', text: '종료' }
               ],
               required: true
           },
           response: { type: 'textarea', value: inquiry.response || '', label: '답변 내용', rows: 6 }
       }, async (formData) => {
           const errors = AdminUtils.validateFormData(formData, validationRules);
           if (errors.length > 0) {
               this.showMessage(errors[0], 'error');
               return;
           }

           await this.performCRUDOperation(
               'UPDATE',
               `${ADMIN_CONFIG.ENDPOINTS.ADMIN_INQUIRIES}/${inquiryId}`,
               formData,
               '문의사항이 처리되었습니다.',
               async () => {
                   await this.loadInquiries();
                   this.closeModal('editModal');
               }
           );
       });
   }

   async deleteInquiry(inquiryId) {
       if (!this.initialized) return;

       if (!confirm('이 문의사항을 삭제하시겠습니까?')) return;

       await this.performCRUDOperation(
           'DELETE',
           `${ADMIN_CONFIG.ENDPOINTS.ADMIN_INQUIRIES}/${inquiryId}`,
           null,
           '문의사항이 삭제되었습니다.',
           () => this.loadInquiries()
       );
   }

   // FAQ 관리 CRUD
   async editFAQ(faqId) {
       // 현재 섹션이 faq가 아니면 전환
       if (this.currentSection !== 'faq') {
           this.switchSection('faq');
           await new Promise(resolve => setTimeout(resolve, 100));
       }
       if (!this.initialized) return;

       const faq = this.data.faq.find(f => f.faq_id === faqId);
       if (!faq) {
           this.showMessage('FAQ를 찾을 수 없습니다.', 'error');
           return;
       }

       const validationRules = {
           question: { required: true, label: '질문', minLength: 5, maxLength: 500 },
           answer: { required: true, label: '답변', minLength: 10 },
           category: { required: true, label: '카테고리' }
       };

       this.showEditModal('FAQ 수정', {
           question: { type: 'textarea', value: faq.question, label: '질문', required: true, rows: 3 },
           answer: { type: 'textarea', value: faq.answer, label: '답변', required: true, rows: 6 },
           category: {
               type: 'select',
               value: faq.category,
               label: '카테고리',
               options: [
                   { value: 'general', text: '일반' },
                   { value: 'account', text: '계정' },
                   { value: 'game', text: '게임' },
                   { value: 'technical', text: '기술' },
                   { value: 'billing', text: '결제' }
               ],
               required: true
           },
           is_active: { type: 'checkbox', value: faq.is_active, label: '활성 상태' }
       }, async (formData) => {
           const errors = AdminUtils.validateFormData(formData, validationRules);
           if (errors.length > 0) {
               this.showMessage(errors[0], 'error');
               return;
           }

           await this.performCRUDOperation(
               'UPDATE',
               `${ADMIN_CONFIG.ENDPOINTS.ADMIN_FAQ}/${faqId}`,
               formData,
               'FAQ가 수정되었습니다.',
               async () => {
                   await this.loadFAQ();
                   this.closeModal('editModal');
               }
           );
       });
   }

   async deleteFAQ(faqId) {
       if (!this.initialized) return;

       if (!confirm('이 FAQ를 삭제하시겠습니까?')) return;

       await this.performCRUDOperation(
           'DELETE',
           `${ADMIN_CONFIG.ENDPOINTS.ADMIN_FAQ}/${faqId}`,
           null,
           'FAQ가 삭제되었습니다.',
           () => this.loadFAQ()
       );
   }

   // 게임 데이터 관리 CRUD
   async editCharacter(charName) {
       // 현재 섹션이 game이 아니면 전환
       if (this.currentSection !== 'game') {
           this.switchSection('game');
           await new Promise(resolve => setTimeout(resolve, 100));
           this.switchGameTab('characters');
           await new Promise(resolve => setTimeout(resolve, 100));
       }
       
       if (!this.initialized) return;

       const character = this.data.characters.find(c => c.name === charName);
       if (!character) {
           this.showMessage('캐릭터를 찾을 수 없습니다.', 'error');
           return;
       }

       const validationRules = {
           hp: { required: true, label: '체력' },
           atk: { required: true, label: '공격력' },
           luck: { required: true, label: '운' }
       };

       this.showEditModal('캐릭터 정보 수정', {
           hp: { type: 'number', value: character.hp, label: '체력', min: 1 },
           atk: { type: 'number', value: character.atk, label: '공격력', min: 1 },
           luck: { type: 'number', value: character.luck, label: '운', min: 1 }
       }, async (formData) => {
           const errors = AdminUtils.validateFormData(formData, validationRules);
           if (errors.length > 0) {
               this.showMessage(errors[0], 'error');
               return;
           }

           await this.performCRUDOperation(
               'UPDATE',
               `${ADMIN_CONFIG.ENDPOINTS.ADMIN_CHARACTERS}/${encodeURIComponent(charName)}`,
               formData,
               '캐릭터 정보가 수정되었습니다.',
               async () => {
                   await this.loadGameData('characters');
                   this.closeModal('editModal');
               }
           );
       });
   }

   async editMonster(monsterId) {
       // 현재 섹션이 game이 아니면 전환
       if (this.currentSection !== 'game') {
           this.switchSection('game');
           await new Promise(resolve => setTimeout(resolve, 100));
           this.switchGameTab('monsters');
           await new Promise(resolve => setTimeout(resolve, 100));
       }
       
       if (!this.initialized) return;

       const monster = this.data.monsters.find(m => m.MonsterID === monsterId);
       if (!monster) {
           this.showMessage('몬스터를 찾을 수 없습니다.', 'error');
           return;
       }

       const validationRules = {
           Name: { required: true, label: '이름', minLength: 1, maxLength: 50 },
           min_hp: { required: true, label: '최소 HP' },
           max_hp: { required: true, label: '최대 HP' },
           min_atk: { required: true, label: '최소 공격력' },
           max_atk: { required: true, label: '최대 공격력' }
       };

       this.showEditModal('몬스터 정보 수정', {
           Name: { type: 'text', value: monster.Name, label: '이름', required: true },
           Session: { type: 'select', value: monster.Session, label: '세션', options: ADMIN_CONFIG.CATEGORIES.GAME.SESSION },
           Type: { type: 'select', value: monster.Type, label: '타입', options: ADMIN_CONFIG.CATEGORIES.GAME.MONSTER_TYPE },
           Element: { type: 'select', value: monster.Element, label: '속성', options: ADMIN_CONFIG.CATEGORIES.GAME.ELEMENT },
           min_hp: { type: 'number', value: monster.min_hp, label: '최소 HP', min: 1 },
           max_hp: { type: 'number', value: monster.max_hp, label: '최대 HP', min: 1 },
           min_atk: { type: 'number', value: monster.min_atk, label: '최소 공격력', min: 0 },
           max_atk: { type: 'number', value: monster.max_atk, label: '최대 공격력', min: 0 },
           luck: { type: 'number', value: monster.luck, label: '운', min: 0 },
           Special: { type: 'text', value: monster.Special || '', label: '특수능력' },
           Description: { type: 'textarea', value: monster.Description || '', label: '설명' }
       }, async (formData) => {
           const errors = AdminUtils.validateFormData(formData, validationRules);
           if (errors.length > 0) {
               this.showMessage(errors[0], 'error');
               return;
           }

           if (parseInt(formData.min_hp) > parseInt(formData.max_hp)) {
               this.showMessage('최소 HP는 최대 HP보다 클 수 없습니다.', 'error');
               return;
           }
           if (parseInt(formData.min_atk) > parseInt(formData.max_atk)) {
               this.showMessage('최소 공격력은 최대 공격력보다 클 수 없습니다.', 'error');
               return;
           }

           await this.performCRUDOperation(
               'UPDATE',
               `${ADMIN_CONFIG.ENDPOINTS.ADMIN_MONSTERS}/${monsterId}`,
               formData,
               '몬스터 정보가 수정되었습니다.',
               async () => {
                   await this.loadGameData('monsters');
                   this.closeModal('editModal');
               }
           );
       });
   }

   async deleteMonster(monsterId) {
       if (!this.initialized) return;

       if (!confirm('이 몬스터를 삭제하시겠습니까?')) return;

       await this.performCRUDOperation(
           'DELETE',
           `${ADMIN_CONFIG.ENDPOINTS.ADMIN_MONSTERS}/${monsterId}`,
           null,
           '몬스터가 삭제되었습니다.',
           () => this.loadGameData('monsters')
       );
   }

   async editSkill(skillId) {
       // 현재 섹션이 game이 아니면 전환
       if (this.currentSection !== 'game') {
           this.switchSection('game');
           await new Promise(resolve => setTimeout(resolve, 100));
           this.switchGameTab('skills');
           await new Promise(resolve => setTimeout(resolve, 100));
       }
       
       if (!this.initialized) return;

       const skill = this.data.skills.find(s => s.SkillID === skillId);
       if (!skill) {
           this.showMessage('스킬을 찾을 수 없습니다.', 'error');
           return;
       }

       const validationRules = {
           min_damage: { required: true, label: '최소 데미지' },
           max_damage: { required: true, label: '최대 데미지' },
           hit_time: { required: true, label: '명중 횟수' }
       };

       this.showEditModal('스킬 정보 수정', {
           skill_Job: { type: 'select', value: skill.skill_Job, label: '직업', options: ADMIN_CONFIG.CATEGORIES.GAME.JOB },
           skill_Type: { type: 'select', value: skill.skill_Type, label: '타입', options: ADMIN_CONFIG.CATEGORIES.GAME.SKILL_TYPE },
           rarity: { type: 'select', value: skill.rarity, label: '등급', options: ADMIN_CONFIG.CATEGORIES.GAME.RARITY },
           element: { type: 'select', value: skill.element, label: '속성', options: ADMIN_CONFIG.CATEGORIES.GAME.ELEMENT },
           min_damage: { type: 'number', value: skill.min_damage, label: '최소 데미지', min: 0 },
           max_damage: { type: 'number', value: skill.max_damage, label: '최대 데미지', min: 0 },
           hit_time: { type: 'number', value: skill.hit_time, label: '명중 횟수', min: 1 },
           target: { type: 'select', value: skill.target, label: '대상', options: ADMIN_CONFIG.CATEGORIES.GAME.TARGET },
           statusEffectName: { type: 'select', value: skill.statusEffectName || '', label: '상태이상', options: ADMIN_CONFIG.CATEGORIES.GAME.STATUS_EFFECT },
           statusEffectRate: { type: 'number', value: skill.statusEffectRate || 0, label: '상태이상 확률 (%)', min: 0, max: 100 },
           statusEffectTurn: { type: 'number', value: skill.statusEffectTurn || 0, label: '지속 턴', min: 0 }
       }, async (formData) => {
           const errors = AdminUtils.validateFormData(formData, validationRules);
           if (errors.length > 0) {
               this.showMessage(errors[0], 'error');
               return;
           }

           if (parseInt(formData.min_damage) > parseInt(formData.max_damage)) {
               this.showMessage('최소 데미지는 최대 데미지보다 클 수 없습니다.', 'error');
               return;
           }

           await this.performCRUDOperation(
               'UPDATE',
               `${ADMIN_CONFIG.ENDPOINTS.ADMIN_SKILLS}/${skillId}`,
               formData,
               '스킬 정보가 수정되었습니다.',
               async () => {
                   await this.loadGameData('skills');
                   this.closeModal('editModal');
               }
           );
       });
   }

   async editPlayer(playerId) {
       // 현재 섹션이 game이 아니면 전환
       if (this.currentSection !== 'game') {
           this.switchSection('game');
           await new Promise(resolve => setTimeout(resolve, 100));
           this.switchGameTab('players');
           await new Promise(resolve => setTimeout(resolve, 100));
       }
       
       if (!this.initialized) return;

       const player = this.data.users.find(u => u.ID === playerId);
       if (!player) {
           this.showMessage('플레이어를 찾을 수 없습니다.', 'error');
           return;
       }

       const validationRules = {
           curr_hp: { required: true, label: '현재 HP' },
           max_hp: { required: true, label: '최대 HP' },
           atk: { required: true, label: '공격력' },
           luck: { required: true, label: '운' }
       };

       this.showEditModal('플레이어 정보 수정', {
           Using_Character: { type: 'select', value: player.Using_Character || '전사', label: '사용 캐릭터', options: ADMIN_CONFIG.CATEGORIES.GAME.CHARACTER },
           curr_hp: { type: 'number', value: player.curr_hp || 100, label: '현재 HP', min: 0 },
           max_hp: { type: 'number', value: player.max_hp || 100, label: '최대 HP', min: 1 },
           atk: { type: 'number', value: player.atk || 20, label: '공격력', min: 0 },
           luck: { type: 'number', value: player.luck || 8, label: '운', min: 0 },
           WhereSession: { type: 'select', value: player.WhereSession || 'Fire', label: '현재 세션', options: ADMIN_CONFIG.CATEGORIES.GAME.SESSION },
           WhereStage: { type: 'number', value: player.WhereStage || 1, label: '현재 스테이지', min: 1 }
       }, async (formData) => {
           const errors = AdminUtils.validateFormData(formData, validationRules);
           if (errors.length > 0) {
               this.showMessage(errors[0], 'error');
               return;
           }

           if (parseInt(formData.curr_hp) > parseInt(formData.max_hp)) {
               this.showMessage('현재 HP는 최대 HP를 초과할 수 없습니다.', 'error');
               return;
           }

           await this.performCRUDOperation(
               'UPDATE',
               `${ADMIN_CONFIG.ENDPOINTS.ADMIN_USERS}/${playerId}`,
               formData,
               '플레이어 정보가 수정되었습니다.',
               async () => {
                   await this.loadGameData('players');
                   this.closeModal('editModal');
               }
           );
       });
   }

   // 모달 관련 함수들
   showEditModal(title, fields, onSubmit) {
       console.log('showEditModal 호출됨:', title);
       console.log('모달 필드:', fields);
       
       // 디버깅용 스타일 추가
       const debugStyle = document.createElement('style');
       debugStyle.id = 'debug-modal-style';
       debugStyle.textContent = `
           #editModal {
               display: none;
               position: fixed !important;
               top: 0 !important;
               left: 0 !important;
               width: 100% !important;
               height: 100% !important;
               background-color: rgba(0, 0, 0, 0.5) !important;
               z-index: 99999 !important;
               justify-content: center !important;
               align-items: center !important;
           }
           
           #editModal.show {
               display: flex !important;
           }
           
           .admin-modal-content {
               background: white !important;
               border-radius: 10px !important;
               padding: 2rem !important;
               width: 90% !important;
               max-width: 600px !important;
               max-height: 90vh !important;
               overflow-y: auto !important;
               position: relative !important;
               z-index: 100000 !important;
           }
       `;
       
       // 기존 디버그 스타일이 있으면 제거
       const existingDebugStyle = document.getElementById('debug-modal-style');
       if (existingDebugStyle) {
           existingDebugStyle.remove();
       }
       document.head.appendChild(debugStyle);

       
       const modal = AdminUtils.getElementById('editModal');
       const modalTitle = AdminUtils.getElementById('editModalTitle');
       const fieldsContainer = AdminUtils.getElementById('editFormFields');
       const form = AdminUtils.getElementById('editForm');

       if (!modal || !modalTitle || !fieldsContainer || !form) {
           console.error('모달 요소를 찾을 수 없습니다:', {
               modal: !!modal,
               modalTitle: !!modalTitle,
               fieldsContainer: !!fieldsContainer,
               form: !!form
           });
           this.showMessage('모달 창을 열 수 없습니다. 페이지를 새로고침해주세요.', 'error');
           return;
       }

       modalTitle.textContent = title;
       console.log('모달 제목 설정:', title);

       fieldsContainer.innerHTML = Object.entries(fields).map(([key, field]) => {
           let inputHtml = '';

           if (field.type === 'select') {
               const options = Array.isArray(field.options)
                   ? field.options.map(opt => typeof opt === 'object' ? opt : { value: opt, text: opt })
                   : [];

               inputHtml = `
                  <select id="edit_${key}" name="${key}" class="form-input" ${field.required ? 'required' : ''}>
                      ${options.map(option =>
                   `<option value="${option.value}" ${option.value == field.value ? 'selected' : ''}>${option.text}</option>`
               ).join('')}
                  </select>
              `;
           } else if (field.type === 'textarea') {
               const rows = field.rows || 4;
               inputHtml = `
                  <textarea id="edit_${key}" name="${key}" class="form-input" rows="${rows}" ${field.required ? 'required' : ''}>${field.value || ''}</textarea>
              `;
           } else if (field.type === 'checkbox') {
               inputHtml = `
                  <input type="checkbox" id="edit_${key}" name="${key}" value="true" ${field.value ? 'checked' : ''} class="form-checkbox">
              `;
           } else {
               const attributes = [];
               if (field.required) attributes.push('required');
               if (field.min !== undefined) attributes.push(`min="${field.min}"`);
               if (field.max !== undefined) attributes.push(`max="${field.max}"`);
               if (field.minLength) attributes.push(`minlength="${field.minLength}"`);
               if (field.maxLength) attributes.push(`maxlength="${field.maxLength}"`);

               inputHtml = `
                  <input type="${field.type}" id="edit_${key}" name="${key}" value="${AdminUtils.sanitizeInput(field.value || '')}" class="form-input" ${attributes.join(' ')}>
              `;
           }

           return `
              <div class="form-group">
                  <label for="edit_${key}" class="form-label">${field.label}</label>
                  ${inputHtml}
              </div>
          `;
       }).join('');

       // DOM 조작 최소화 - cloneNode 제거
       // form 직접 사용

       const submitHandler = async (e) => {
           e.preventDefault();

           const submitBtn = e.target.querySelector('button[type="submit"]');
           const originalText = submitBtn ? submitBtn.textContent : '';

           if (submitBtn) {
               submitBtn.disabled = true;
               submitBtn.textContent = '처리중...';
           }

           try {
               const formElement = e.target;
               const data = {};

               Object.entries(fields).forEach(([key, field]) => {
                   const element = formElement.querySelector(`#edit_${key}`);
                   if (!element) return;

                   if (field.type === 'number') {
                       data[key] = parseInt(element.value) || 0;
                   } else if (field.type === 'checkbox') {
                       data[key] = element.checked;
                   } else if (field.type === 'select') {
                       // select의 경우 숫자 값일 수 있음
                       const value = element.value;
                       data[key] = isNaN(value) ? value : parseInt(value);
                   } else if (field.type === 'textarea') {
                       // textarea는 원본 텍스트 그대로 사용
                       data[key] = element.value || '';
                   } else {
                       data[key] = element.value || '';
                   }
               });

               await onSubmit(data);
           } catch (error) {
               console.error('폼 제출 오류:', error);
           } finally {
               if (submitBtn) {
                   submitBtn.disabled = false;
                   submitBtn.textContent = originalText;
               }
           }
       };

       form.addEventListener('submit', submitHandler);
       this.eventListeners.set('edit-form-submit', { element: form, event: 'submit', handler: submitHandler });

       modal.style.display = 'flex';

       const firstInput = fieldsContainer.querySelector('input:not([type="checkbox"]), select, textarea');
       if (firstInput) {
           setTimeout(() => firstInput.focus(), 100);
       }
   }

   showAddNewsModal() {
       const modal = AdminUtils.getElementById('addModal');
       const modalTitle = AdminUtils.getElementById('addModalTitle');
       const fieldsContainer = AdminUtils.getElementById('addFormFields');
       const form = AdminUtils.getElementById('addForm');

       if (!modal || !modalTitle || !fieldsContainer || !form) {
           console.error('모달 요소를 찾을 수 없습니다:', {
               modal: !!modal,
               modalTitle: !!modalTitle,
               fieldsContainer: !!fieldsContainer,
               form: !!form
           });
           this.showMessage('모달 창을 열 수 없습니다. 페이지를 새로고침해주세요.', 'error');
           return;
       }

       modalTitle.textContent = '새 뉴스 작성';

       fieldsContainer.innerHTML = `
          <div class="form-group">
              <label for="add_category_id" class="form-label">카테고리</label>
              <select id="add_category_id" name="category_id" class="form-input" required>
                  ${ADMIN_CONFIG.CATEGORIES.NEWS.map(cat =>
           `<option value="${cat.value}">${cat.text}</option>`
       ).join('')}
              </select>
          </div>
          <div class="form-group">
              <label for="add_title" class="form-label">제목</label>
              <input type="text" id="add_title" name="title" class="form-input" required maxlength="200">
          </div>
          <div class="form-group">
              <label for="add_content" class="form-label">내용</label>
              <textarea id="add_content" name="content" class="form-input" rows="10" required></textarea>
          </div>
          <div class="form-group">
              <label class="form-label">
                  <input type="checkbox" id="add_is_important" name="is_important" class="form-checkbox"> 중요 공지
              </label>
          </div>
      `;

       // DOM 조작 최소화 - cloneNode 제거
       // form 직접 사용

       const submitHandler = async (e) => {
           e.preventDefault();

           const formData = new FormData(newForm);
           const data = {
               category_id: AdminUtils.safeParseInt(formData.get('category_id')),
               title: AdminUtils.sanitizeInput(formData.get('title')),
               content: AdminUtils.sanitizeInput(formData.get('content')),
               is_important: formData.get('is_important') === 'on'
           };

           if (!data.title.trim() || !data.content.trim()) {
               this.showMessage('제목과 내용을 모두 입력해주세요.', 'error');
               return;
           }

           const submitBtn = e.target.querySelector('button[type="submit"]');
           const originalText = submitBtn ? submitBtn.textContent : '';

           if (submitBtn) {
               submitBtn.disabled = true;
               submitBtn.textContent = '작성중...';
           }

           try {
               await this.performCRUDOperation(
                   'CREATE',
                   ADMIN_CONFIG.ENDPOINTS.ADMIN_NEWS,
                   data,
                   '뉴스가 작성되었습니다.',
                   async () => {
                       await this.loadNews();
                       this.closeModal('addModal');
                   }
               );
           } finally {
               if (submitBtn) {
                   submitBtn.disabled = false;
                   submitBtn.textContent = originalText;
               }
           }
       };

       form.addEventListener('submit', submitHandler);
       this.eventListeners.set('add-form-submit', { element: newForm, event: 'submit', handler: submitHandler });

       modal.style.display = 'flex';
   }

   showAddFAQModal() {
       const modal = AdminUtils.getElementById('addModal');
       const modalTitle = AdminUtils.getElementById('addModalTitle');
       const fieldsContainer = AdminUtils.getElementById('addFormFields');
       const form = AdminUtils.getElementById('addForm');

       if (!modal || !modalTitle || !fieldsContainer || !form) {
           console.error('모달 요소를 찾을 수 없습니다:', {
               modal: !!modal,
               modalTitle: !!modalTitle,
               fieldsContainer: !!fieldsContainer,
               form: !!form
           });
           this.showMessage('모달 창을 열 수 없습니다. 페이지를 새로고침해주세요.', 'error');
           return;
       }

       modalTitle.textContent = '새 FAQ 작성';

       fieldsContainer.innerHTML = `
          <div class="form-group">
              <label for="add_category" class="form-label">카테고리</label>
              <select id="add_category" name="category" class="form-input" required>
                  <option value="general">일반</option>
                  <option value="account">계정</option>
                  <option value="game">게임</option>
                  <option value="technical">기술</option>
                  <option value="billing">결제</option>
              </select>
          </div>
          <div class="form-group">
              <label for="add_question" class="form-label">질문</label>
              <textarea id="add_question" name="question" class="form-input" rows="3" required maxlength="500"></textarea>
          </div>
          <div class="form-group">
              <label for="add_answer" class="form-label">답변</label>
              <textarea id="add_answer" name="answer" class="form-input" rows="6" required></textarea>
          </div>
          <div class="form-group">
              <label class="form-label">
                  <input type="checkbox" id="add_is_active" name="is_active" class="form-checkbox" checked> 활성 상태
              </label>
          </div>
      `;

       // DOM 조작 최소화 - cloneNode 제거
       // form 직접 사용

       const submitHandler = async (e) => {
           e.preventDefault();

           const formData = new FormData(newForm);
           const data = {
               category: formData.get('category'),
               question: AdminUtils.sanitizeInput(formData.get('question')),
               answer: AdminUtils.sanitizeInput(formData.get('answer')),
               is_active: formData.get('is_active') === 'on'
           };

           await this.performCRUDOperation(
               'CREATE',
               ADMIN_CONFIG.ENDPOINTS.ADMIN_FAQ,
               data,
               'FAQ가 작성되었습니다.',
               async () => {
                   await this.loadFAQ();
                   this.closeModal('addModal');
               }
           );
       };

       form.addEventListener('submit', submitHandler);
       this.eventListeners.set('add-faq-form-submit', { element: newForm, event: 'submit', handler: submitHandler });

       modal.style.display = 'flex';
   }

   closeModal(modalId) {
       const modal = AdminUtils.getElementById(modalId);
       if (modal) {
           modal.classList.remove('show');
           modal.style.display = 'none';
           // body 스크롤 복원
           document.body.style.overflow = '';
           console.log('모달 닫힘:', modalId);
       }
   }

   closeAllModals() {
       const modals = document.querySelectorAll('.admin-modal, .detail-view-modal');
       modals.forEach(modal => {
           if (modal) {
               modal.style.display = 'none';
           }
       });
   }

   // 수정된 검색 및 필터 관련 함수들 - 무한루프 방지
   setupRefreshButtons() {
       const buttons = [
           { id: 'userRefreshBtn', action: () => this.loadUsers() },
           { id: 'postRefreshBtn', action: () => this.loadPosts() },
           { id: 'commentRefreshBtn', action: () => this.loadComments() },
           { id: 'mediaRefreshBtn', action: () => this.loadMedia() },
           { id: 'newsRefreshBtn', action: () => this.loadNews() },
           { id: 'inquiryRefreshBtn', action: () => this.loadInquiries() },
           { id: 'faqRefreshBtn', action: () => this.loadFAQ() },
           { id: 'characterRefreshBtn', action: () => this.loadGameData('characters') },
           { id: 'monsterRefreshBtn', action: () => this.loadGameData('monsters') },
           { id: 'skillRefreshBtn', action: () => this.loadGameData('skills') },
           { id: 'playerRefreshBtn', action: () => this.loadGameData('players') }
       ];

       buttons.forEach(({ id, action }) => {
           const btn = AdminUtils.getElementById(id);
           if (btn) {
               const handler = async () => {
                   const originalText = btn.textContent;
                   btn.disabled = true;
                   btn.textContent = '새로고침 중...';
                   try {
                       await action();
                       this.showMessage('데이터를 새로고침했습니다.', 'success');
                   } catch (error) {
                       this.showMessage('새로고침 중 오류가 발생했습니다.', 'error');
                   } finally {
                       btn.disabled = false;
                       btn.textContent = originalText;
                   }
               };
               btn.addEventListener('click', handler);
               this.eventListeners.set(id, { element: btn, event: 'click', handler });
           }
       });
   }

   // 수정된 setupSearchFunctions - 무한루프 방지
   setupSearchFunctions() {
       const searchInputs = [
           { id: 'userSearch', table: 'users' },
           { id: 'postSearch', table: 'posts' },
           { id: 'commentSearch', table: 'comments' },
           { id: 'mediaSearch', table: 'media' },
           { id: 'newsSearch', table: 'news' },
           { id: 'inquirySearch', table: 'inquiries' },
           { id: 'faqSearch', table: 'faq' },
           { id: 'characterSearch', table: 'characters' },
           { id: 'monsterSearch', table: 'monsters' },
           { id: 'skillSearch', table: 'skills' },
           { id: 'playerSearch', table: 'players' }
       ];

       searchInputs.forEach(({ id, table }) => {
           const input = AdminUtils.getElementById(id);
           if (input) {
               // 기존 이벤트 리스너가 있다면 제거
               const existingListener = this.eventListeners.get(id);
               if (existingListener) {
                   existingListener.element.removeEventListener(existingListener.event, existingListener.handler);
               }

               const debouncedSearch = AdminUtils.debounce((value) => {
                   this.searchTable(table, value);
               }, 300);

               const searchHandler = (e) => {
                   // 이벤트가 프로그래매틱하게 발생한 것인지 확인
                   if (e.isTrusted === false) return;
                   debouncedSearch(e.target.value);
               };
               
               input.addEventListener('input', searchHandler);
               this.eventListeners.set(id, { element: input, event: 'input', handler: searchHandler });
           }
       });

       // 필터 기능 설정
       this.setupFilterFunctions();
   }

   // 수정된 필터 기능 설정 - HTML의 실제 ID에 맞게 수정 및 필터 ID 확장
   setupFilterFunctions() {
       const filterSelects = [
           { id: 'userFilter', table: 'users', type: 'user' },
           { id: 'postCategoryFilter', table: 'posts', type: 'post-category' },
           { id: 'mediaCategoryFilter', table: 'media', type: 'media-category' },
           { id: 'newsCategoryFilter', table: 'news', type: 'news-category' },
           { id: 'inquiryStatusFilter', table: 'inquiries', type: 'inquiry-status' },
           { id: 'inquiryTypeFilter', table: 'inquiries', type: 'inquiry-type' },
           { id: 'faqCategoryFilter', table: 'faq', type: 'faq-category' },
           { id: 'faqStatusFilter', table: 'faq', type: 'faq-status' },
           { id: 'monsterSessionFilter', table: 'monsters', type: 'monster-session' },
           { id: 'playerCharacterFilter', table: 'players', type: 'player-character' },
           { id: 'playerSessionFilter', table: 'players', type: 'player-session' }
       ];

       filterSelects.forEach(({ id, table, type }) => {
           const select = AdminUtils.getElementById(id);
           if (select) {
               // 기존 이벤트 리스너가 있다면 제거
               const existingListener = this.eventListeners.get(`${id}-filter`);
               if (existingListener) {
                   existingListener.element.removeEventListener(existingListener.event, existingListener.handler);
               }

               const filterHandler = (e) => {
                   if (e.isTrusted === false) return;
                   this.filterTable(table, type, e.target.value);
               };
               
               select.addEventListener('change', filterHandler);
               this.eventListeners.set(`${id}-filter`, { element: select, event: 'change', handler: filterHandler });
               
               console.log(`필터 이벤트 설정 완료: ${id} -> ${table}/${type}`);
           } else {
               console.warn(`필터 셀렉트를 찾을 수 없습니다: ${id}`);
           }
       });
   }

   // 새로운 테이블 필터링 함수
   filterTable(tableName, filterType, filterValue) {
       try {
           console.log(`필터 적용: ${tableName}, 타입: ${filterType}, 값: ${filterValue}`);
           
           const tableBodyId = `${tableName}TableBody`;
           const tableBody = AdminUtils.getElementById(tableBodyId);
           if (!tableBody) return;

           // 검색 결과 없음 메시지 제거
           this.removeSearchNoResults(tableBodyId);

           const rows = tableBody.querySelectorAll('tr:not(.search-no-results)');
           let visibleCount = 0;

           rows.forEach(row => {
               if (row.querySelector('.loading')) {
                   return;
               }

               try {
                   let shouldShow = true;

                   // 전체 선택이 아닌 경우 필터링 적용
                   if (filterValue && filterValue !== 'all' && filterValue !== '전체') {
                       shouldShow = this.applyFilter(row, filterType, filterValue);
                   }

                   row.style.display = shouldShow ? '' : 'none';
                   if (shouldShow) visibleCount++;
               } catch (error) {
                   console.error('필터 처리 오류:', error);
               }
           });

           // 필터 결과가 없을 때 메시지 표시
           if (filterValue && filterValue !== 'all' && filterValue !== '전체' && visibleCount === 0 && rows.length > 0) {
               this.showFilterNoResults(tableBodyId, filterValue);
           }

           console.log(`필터 적용 완료: ${tableName}, 표시된 행 수: ${visibleCount}`);
       } catch (error) {
           console.error('테이블 필터링 오류:', error);
       }
   }

   // 개별 행에 필터 적용 - 모든 필터 타입 지원
   applyFilter(row, filterType, filterValue) {
       const cells = row.querySelectorAll('td');
       if (cells.length === 0) return false;

       switch (filterType) {
           case 'user':
               return this.applyUserFilter(cells, filterValue);
           case 'post':
               return this.applyPostFilter(cells, filterValue);
           case 'post-category':
               return this.applyPostCategoryFilter(cells, filterValue);
           case 'comment':
               return this.applyCommentFilter(cells, filterValue);
           case 'media':
               return this.applyMediaFilter(cells, filterValue);
           case 'media-category':
               return this.applyMediaCategoryFilter(cells, filterValue);
           case 'news':
               return this.applyNewsFilter(cells, filterValue);
           case 'news-category':
               return this.applyNewsCategoryFilter(cells, filterValue);
           case 'inquiry':
               return this.applyInquiryFilter(cells, filterValue);
           case 'inquiry-status':
               return this.applyInquiryStatusFilter(cells, filterValue);
           case 'inquiry-type':
               return this.applyInquiryTypeFilter(cells, filterValue);
           case 'faq':
               return this.applyFAQFilter(cells, filterValue);
           case 'faq-category':
               return this.applyFAQCategoryFilter(cells, filterValue);
           case 'faq-status':
               return this.applyFAQStatusFilter(cells, filterValue);
           case 'character':
               return this.applyCharacterFilter(cells, filterValue);
           case 'monster':
               return this.applyMonsterFilter(cells, filterValue);
           case 'monster-session':
               return this.applyMonsterSessionFilter(cells, filterValue);
           case 'skill':
               return this.applySkillFilter(cells, filterValue);
           case 'player':
               return this.applyPlayerFilter(cells, filterValue);
           case 'player-character':
               return this.applyPlayerCharacterFilter(cells, filterValue);
           case 'player-session':
               return this.applyPlayerSessionFilter(cells, filterValue);
           default:
               return true;
       }
   }

   // 사용자 필터 적용
   applyUserFilter(cells, filterValue) {
       switch (filterValue) {
           case '최근 가입':
               // 가입일이 최근 7일 이내인 사용자
               const joinDateText = cells[5]?.textContent || ''; // 가입일 컬럼
               if (joinDateText && joinDateText !== 'N/A') {
                   const joinDate = new Date(joinDateText.replace(/\./g, '-'));
                   const weekAgo = new Date();
                   weekAgo.setDate(weekAgo.getDate() - 7);
                   return joinDate >= weekAgo;
               }
               return false;
           case '탈퇴 회원':
               // 실제로는 탈퇴 회원 데이터가 별도로 관리되어야 하지만, 
               // 여기서는 이메일이 비어있거나 특정 패턴을 가진 경우로 가정
               const emailText = cells[2]?.textContent || '';
               return emailText === 'N/A' || emailText.includes('탈퇴');
           case '활성 회원':
               // 골드가 0보다 큰 회원
               const goldText = cells[3]?.textContent || '0';
               const gold = parseInt(goldText) || 0;
               return gold > 0;
           case '게임 플레이':
               // 캐릭터를 사용 중인 회원
               const characterText = cells[4]?.textContent || '';
               return characterText !== 'N/A' && characterText.trim() !== '';
           default:
               return true;
       }
   }

   // 게시글 필터 적용
   applyPostFilter(cells, filterValue) {
       switch (filterValue) {
           case '최근 게시글':
               const createdAtText = cells[7]?.textContent || '';
               if (createdAtText && createdAtText !== 'N/A') {
                   const createdDate = new Date(createdAtText.replace(/\./g, '-'));
                   const weekAgo = new Date();
                   weekAgo.setDate(weekAgo.getDate() - 7);
                   return createdDate >= weekAgo;
               }
               return false;
           case '인기 게시글':
               const viewsText = cells[4]?.textContent || '0';
               const views = parseInt(viewsText) || 0;
               return views >= 100; // 100 이상 조회수
           case '댓글 많은 글':
               const commentCountText = cells[6]?.textContent || '0';
               const commentCount = parseInt(commentCountText) || 0;
               return commentCount >= 5;
           default:
               return true;
       }
   }

   // 게시글 카테고리 필터 적용
   applyPostCategoryFilter(cells, filterValue) {
       const categoryText = cells[3]?.textContent || ''; // 카테고리 컬럼
       return categoryText === filterValue;
   }

   // 댓글 필터 적용
   applyCommentFilter(cells, filterValue) {
       switch (filterValue) {
           case '최근 댓글':
               const createdAtText = cells[5]?.textContent || '';
               if (createdAtText && createdAtText !== 'N/A') {
                   const createdDate = new Date(createdAtText.replace(/\./g, '-'));
                   const weekAgo = new Date();
                   weekAgo.setDate(weekAgo.getDate() - 7);
                   return createdDate >= weekAgo;
               }
               return false;
           case '인기 댓글':
               const likesText = cells[4]?.textContent || '0';
               const likes = parseInt(likesText) || 0;
               return likes >= 5;
           default:
               return true;
       }
   }

   // 미디어 필터 적용
   applyMediaFilter(cells, filterValue) {
       switch (filterValue) {
           case '최근 업로드':
               const uploadDateText = cells[8]?.textContent || '';
               if (uploadDateText && uploadDateText !== 'N/A') {
                   const uploadDate = new Date(uploadDateText.replace(/\./g, '-'));
                   const weekAgo = new Date();
                   weekAgo.setDate(weekAgo.getDate() - 7);
                   return uploadDate >= weekAgo;
               }
               return false;
           case '게시됨':
               const statusText = cells[9]?.textContent || '';
               return statusText.includes('게시됨');
           case '비공개':
               const statusText2 = cells[9]?.textContent || '';
               return statusText2.includes('비공개');
           case '인기 미디어':
               const viewsText = cells[5]?.textContent || '0';
               const views = parseInt(viewsText) || 0;
               return views >= 50;
           default:
               return true;
       }
   }

   // 미디어 카테고리 필터 적용
   applyMediaCategoryFilter(cells, filterValue) {
       const categoryText = cells[2]?.textContent || ''; // 카테고리 컬럼
       
       // HTML의 option value와 실제 표시되는 텍스트 매핑
       const categoryMap = {
           'screenshots': '스크린샷',
           'videos': '동영상',
           'artwork': '아트워크',
           'wallpapers': '배경화면'
       };
       
       const expectedCategory = categoryMap[filterValue] || filterValue;
       return categoryText === expectedCategory;
   }

   // 뉴스 필터 적용
   applyNewsFilter(cells, filterValue) {
       switch (filterValue) {
           case '최근 뉴스':
               const createdAtText = cells[6]?.textContent || '';
               if (createdAtText && createdAtText !== 'N/A') {
                   const createdDate = new Date(createdAtText.replace(/\./g, '-'));
                   const weekAgo = new Date();
                   weekAgo.setDate(weekAgo.getDate() - 7);
                   return createdDate >= weekAgo;
               }
               return false;
           case '중요 공지':
               const importantText = cells[4]?.textContent || '';
               return importantText.includes('⭐');
           case '게시됨':
               const statusText = cells[5]?.textContent || '';
               return statusText.includes('게시됨');
           case '비공개':
               const statusText2 = cells[5]?.textContent || '';
               return statusText2.includes('비공개');
           default:
               return true;
       }
   }

   // 뉴스 카테고리 필터 적용
   applyNewsCategoryFilter(cells, filterValue) {
       const categoryText = cells[2]?.textContent || ''; // 카테고리 컬럼
       
       // 숫자 값을 카테고리 이름으로 매핑
       const categoryMap = {
           '1': '공지사항',
           '2': '업데이트',
           '3': '이벤트',
           '4': '점검',
           '5': '개발자노트'
       };
       
       const expectedCategory = categoryMap[filterValue] || filterValue;
       return categoryText === expectedCategory;
   }

   // 문의사항 필터 적용
   applyInquiryFilter(cells, filterValue) {
       switch (filterValue) {
           case '최근 문의':
               const createdAtText = cells[6]?.textContent || '';
               if (createdAtText && createdAtText !== 'N/A') {
                   const createdDate = new Date(createdAtText.replace(/\./g, '-'));
                   const weekAgo = new Date();
                   weekAgo.setDate(weekAgo.getDate() - 7);
                   return createdDate >= weekAgo;
               }
               return false;
           case '대기중':
               const statusText = cells[5]?.textContent || '';
               return statusText.includes('대기중');
           case '처리중':
               const statusText2 = cells[5]?.textContent || '';
               return statusText2.includes('처리중');
           case '해결완료':
               const statusText3 = cells[5]?.textContent || '';
               return statusText3.includes('해결완료');
           case '종료':
               const statusText4 = cells[5]?.textContent || '';
               return statusText4.includes('종료');
           default:
               return true;
       }
   }

   // 문의 상태 필터 적용
   applyInquiryStatusFilter(cells, filterValue) {
       const statusText = cells[5]?.textContent || '';
       
       const statusMap = {
           'pending': '대기중',
           'processing': '처리중',
           'resolved': '해결완료',
           'closed': '종료'
       };
       
       const expectedStatus = statusMap[filterValue] || filterValue;
       return statusText.includes(expectedStatus);
   }

   // 문의 유형 필터 적용
   applyInquiryTypeFilter(cells, filterValue) {
       const typeText = cells[2]?.textContent || ''; // 유형 컬럼
       return typeText === filterValue;
   }

   // FAQ 필터 적용
   applyFAQFilter(cells, filterValue) {
       switch (filterValue) {
           case '최근 등록':
               const createdAtText = cells[5]?.textContent || '';
               if (createdAtText && createdAtText !== 'N/A') {
                   const createdDate = new Date(createdAtText.replace(/\./g, '-'));
                   const weekAgo = new Date();
                   weekAgo.setDate(weekAgo.getDate() - 7);
                   return createdDate >= weekAgo;
               }
               return false;
           case '활성':
               const statusText = cells[4]?.textContent || '';
               return statusText.includes('활성');
           case '비활성':
               const statusText2 = cells[4]?.textContent || '';
               return statusText2.includes('비활성');
           case '인기 FAQ':
               const viewsText = cells[3]?.textContent || '0';
               const views = parseInt(viewsText) || 0;
               return views >= 100;
           default:
               return true;
       }
   }

   // FAQ 카테고리 필터 적용
   applyFAQCategoryFilter(cells, filterValue) {
       const categoryText = cells[2]?.textContent || ''; // 카테고리 컬럼
       return categoryText === filterValue;
   }

   // FAQ 상태 필터 적용
   applyFAQStatusFilter(cells, filterValue) {
       const statusText = cells[4]?.textContent || '';
       
       switch (filterValue) {
           case 'active':
               return statusText.includes('활성');
           case 'inactive':
               return statusText.includes('비활성');
           default:
               return true;
       }
   }

   // 캐릭터 필터 적용
   applyCharacterFilter(cells, filterValue) {
       switch (filterValue) {
           case '고체력':
               const hpText = cells[1]?.textContent || '0';
               const hp = parseInt(hpText) || 0;
               return hp >= 150;
           case '고공격':
               const atkText = cells[2]?.textContent || '0';
               const atk = parseInt(atkText) || 0;
               return atk >= 30;
           case '고운':
               const luckText = cells[3]?.textContent || '0';
               const luck = parseInt(luckText) || 0;
               return luck >= 10;
           default:
               return true;
       }
   }

   // 몬스터 필터 적용
   applyMonsterFilter(cells, filterValue) {
       const sessionText = cells[2]?.textContent || '';
       const typeText = cells[3]?.textContent || '';
       const elementText = cells[4]?.textContent || '';

       if (['Fire', 'Water', 'Grass', 'None'].includes(filterValue)) {
           return sessionText === filterValue || elementText === filterValue;
       }
       if (['Common', 'MiddleBoss', 'Boss', 'Unique'].includes(filterValue)) {
           return typeText === filterValue;
       }
       return true;
   }

   // 몬스터 세션 필터 적용
   applyMonsterSessionFilter(cells, filterValue) {
       const sessionText = cells[2]?.textContent || ''; // 세션 컬럼
       return sessionText === filterValue;
   }

   // 스킬 필터 적용
   applySkillFilter(cells, filterValue) {
       const jobText = cells[1]?.textContent || '';
       const typeText = cells[2]?.textContent || '';
       const rarityText = cells[3]?.textContent || '';
       const elementText = cells[4]?.textContent || '';

       if (['공용', '전사', '도적', '마법사'].includes(filterValue)) {
           return jobText === filterValue;
       }
       if (['BattleCard', 'SupportCard', 'DefenseCard'].includes(filterValue)) {
           return typeText === filterValue;
       }
       if (['Common', 'Rare', 'Epic', 'Legendary', 'Test'].includes(filterValue)) {
           return rarityText === filterValue;
       }
       if (['Fire', 'Water', 'Grass', 'None'].includes(filterValue)) {
           return elementText === filterValue;
       }
       return true;
   }

   // 플레이어 필터 적용
   applyPlayerFilter(cells, filterValue) {
       const characterText = cells[1]?.textContent || '';
       const sessionText = cells[5]?.textContent || '';

       if (['전사', '도적', '마법사'].includes(filterValue)) {
           return characterText === filterValue;
       }
       if (['Fire', 'Water', 'Grass', 'None'].includes(filterValue)) {
           return sessionText === filterValue;
       }
       switch (filterValue) {
           case '저체력':
               const currHpText = cells[2]?.textContent || '0';
               const maxHpText = cells[3]?.textContent || '1';
               const currHp = parseInt(currHpText) || 0;
               const maxHp = parseInt(maxHpText) || 1;
               return (currHp / maxHp) < 0.3; // 30% 미만
           case '고레벨':
               const stageText = cells[6]?.textContent || '1';
               const stage = parseInt(stageText) || 1;
               return stage >= 10;
           default:
               return true;
       }
   }

   // 플레이어 캐릭터 필터 적용
   applyPlayerCharacterFilter(cells, filterValue) {
       const characterText = cells[1]?.textContent || ''; // 사용캐릭터 컬럼
       return characterText === filterValue;
   }

   // 플레이어 세션 필터 적용
   applyPlayerSessionFilter(cells, filterValue) {
       const sessionText = cells[5]?.textContent || ''; // 위치 컬럼
       return sessionText === filterValue;
   }

   // 필터 결과 없음 메시지 표시
   showFilterNoResults(tableBodyId, filterValue) {
       const tableBody = AdminUtils.getElementById(tableBodyId);
       if (!tableBody) return;

       // 이미 "필터 결과 없음" 메시지가 있는지 확인
       const existingNoResults = tableBody.querySelector('.filter-no-results');
       if (existingNoResults) return;

       const colCount = tableBody.closest('table')?.querySelector('thead tr')?.children.length || 5;
       const noResultsRow = document.createElement('tr');
       noResultsRow.className = 'filter-no-results search-no-results';

       const filterSelectId = tableBodyId.replace('TableBody', 'Filter');
       const tableNameForReset = tableBodyId.replace('TableBody', '');

       // 필터 초기화 버튼 생성
       const resetButton = document.createElement('button');
       resetButton.textContent = '필터 초기화';
       resetButton.style.cssText = 'margin-left: 10px; padding: 5px 12px; background: #e67e22; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;';
       
       resetButton.addEventListener('click', (e) => {
           e.preventDefault();
           e.stopPropagation();
           
           try {
               console.log(`필터 초기화 버튼 클릭: ${tableNameForReset}`);
               
               // 필터 셀렉트 초기화
               const filterSelect = AdminUtils.getElementById(filterSelectId);
               if (filterSelect) {
                   filterSelect.value = 'all';
                   console.log(`필터 셀렉트 초기화 완료: ${filterSelectId}`);
               }

               // 모든 행 다시 표시
               const allRows = tableBody.querySelectorAll('tr');
               let restoredCount = 0;
               allRows.forEach(row => {
                   if (!row.classList.contains('search-no-results') && 
                       !row.classList.contains('filter-no-results') &&
                       !row.querySelector('.loading')) {
                       row.style.display = '';
                       restoredCount++;
                   }
               });

               // "필터 결과 없음" 메시지 제거
               const noResultsRows = tableBody.querySelectorAll('.filter-no-results');
               noResultsRows.forEach(row => row.remove());

               console.log(`필터 초기화 완료 - 테이블: ${tableNameForReset}, 복원된 행: ${restoredCount}`);

           } catch (error) {
               console.error('필터 초기화 오류:', error);
           }
       });

       const cell = document.createElement('td');
       cell.colSpan = colCount;
       cell.className = 'loading';
       cell.style.color = '#666';
       cell.style.textAlign = 'center';
       cell.style.padding = '20px';
       cell.innerHTML = `'${AdminUtils.sanitizeInput(filterValue)}' 필터 결과가 없습니다. `;
       cell.appendChild(resetButton);

       noResultsRow.appendChild(cell);
       tableBody.appendChild(noResultsRow);
   }

   setupModals() {
       const modals = ['editModal', 'addModal'];

       modals.forEach(modalId => {
           const modal = AdminUtils.getElementById(modalId);
           const closeBtn = AdminUtils.getElementById(`${modalId.replace('Modal', 'ModalClose')}`);
           const cancelBtn = AdminUtils.getElementById(`${modalId.replace('Modal', 'CancelBtn')}`);

           if (closeBtn) {
               const closeHandler = () => this.closeModal(modalId);
               closeBtn.addEventListener('click', closeHandler);
               this.eventListeners.set(`${modalId}-close`, { element: closeBtn, event: 'click', handler: closeHandler });
           }

           if (cancelBtn) {
               const cancelHandler = () => this.closeModal(modalId);
               cancelBtn.addEventListener('click', cancelHandler);
               this.eventListeners.set(`${modalId}-cancel`, { element: cancelBtn, event: 'click', handler: cancelHandler });
           }
       });

       const windowClickHandler = (e) => {
           if (e.target.classList.contains('admin-modal')) {
               this.closeModal(e.target.id);
           }
       };
       window.addEventListener('click', windowClickHandler);
       this.eventListeners.set('window-modal-click', { element: window, event: 'click', handler: windowClickHandler });
   }

   setupActionButtons() {
       const actionButtons = [
           { id: 'addNewsBtn', action: () => this.showAddNewsModal() },
           { id: 'addUserBtn', action: () => this.showAddUserModal() },
           { id: 'addMediaBtn', action: () => this.showAddMediaModal() },
           { id: 'addFaqBtn', action: () => this.showAddFAQModal() }
       ];

       actionButtons.forEach(({ id, action }) => {
           const btn = AdminUtils.getElementById(id);
           if (btn) {
               btn.addEventListener('click', action);
               this.eventListeners.set(id, { element: btn, event: 'click', handler: action });
           }
       });
   }

   showAddUserModal() {
       this.showMessage('사용자 추가 기능은 현재 개발 중입니다.', 'info');
   }

   showAddMediaModal() {
       this.showMessage('미디어 업로드 기능은 현재 개발 중입니다.', 'info');
   }

   // 수정된 searchTable 함수 - 재진입 방지
   searchTable(tableName, searchTerm) {
       // 이미 해당 테이블에 대해 검색이 처리 중인지 확인
       const searchKey = `${tableName}-${searchTerm}`;
       if (this.searchProcessing.has(searchKey)) {
           return;
       }

       this.searchProcessing.add(searchKey);

       try {
           const tableBodyId = `${tableName}TableBody`;
           const tableBody = AdminUtils.getElementById(tableBodyId);
           if (!tableBody) return;

           this.searchStates.set(tableName, searchTerm);

           // 기존 "검색 결과 없음" 메시지 제거
           this.removeSearchNoResults(tableBodyId);

           const rows = tableBody.querySelectorAll('tr:not(.search-no-results)');
           let visibleCount = 0;

           rows.forEach(row => {
               if (row.querySelector('.loading')) {
                   return;
               }

               try {
                   const text = row.textContent.toLowerCase();
                   const isMatch = searchTerm === '' || text.includes(searchTerm.toLowerCase());

                   row.style.display = isMatch ? '' : 'none';
                   if (isMatch) visibleCount++;
               } catch (error) {
                   console.error('검색 처리 오류:', error);
               }
           });

           // 검색 결과가 없을 때만 메시지 표시
           if (searchTerm && visibleCount === 0 && rows.length > 0) {
               this.showSearchNoResults(tableBodyId, searchTerm);
           }
       } finally {
           // 처리 완료 후 플래그 제거
           setTimeout(() => {
               this.searchProcessing.delete(searchKey);
           }, 100);
       }
   }

   // 수정된 showSearchNoResults - DOM 조작 최소화 및 완전히 새로운 검색 및 필터 초기화 기능
   showSearchNoResults(tableBodyId, searchTerm) {
       const tableBody = AdminUtils.getElementById(tableBodyId);
       if (!tableBody) return;

       // 이미 "검색 결과 없음" 메시지가 있는지 확인
       const existingNoResults = tableBody.querySelector('.search-no-results');
       if (existingNoResults) return;

       const colCount = tableBody.closest('table')?.querySelector('thead tr')?.children.length || 5;
       const noResultsRow = document.createElement('tr');
       noResultsRow.className = 'search-no-results';

       const searchInputId = tableBodyId.replace('TableBody', 'Search');
       const filterSelectId = tableBodyId.replace('TableBody', 'Filter');
       const tableNameForReset = tableBodyId.replace('TableBody', '');

       // 검색 및 필터 초기화 버튼 생성
       const resetButton = document.createElement('button');
       resetButton.textContent = '검색 및 필터 초기화';
       resetButton.style.cssText = 'margin-left: 10px; padding: 5px 12px; background: #3498db; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;';
       
       // 완전히 새로운 검색 및 필터 초기화 로직
       resetButton.addEventListener('click', (e) => {
           e.preventDefault();
           e.stopPropagation();
           
           try {
               console.log(`검색 및 필터 초기화 버튼 클릭: ${tableNameForReset}`);
               
               // 1. 검색 입력 필드 초기화
               const searchInput = AdminUtils.getElementById(searchInputId);
               if (searchInput) {
                   searchInput.value = '';
                   console.log(`검색 입력 필드 초기화 완료: ${searchInputId}`);
               }

               // 2. 필터 셀렉트도 초기화
               const filterSelect = AdminUtils.getElementById(filterSelectId);
               if (filterSelect) {
                   filterSelect.value = 'all';
                   console.log(`필터 셀렉트 초기화 완료: ${filterSelectId}`);
               }

               // 3. 검색 상태 및 처리 중 플래그 정리
               this.searchStates.delete(tableNameForReset);
               const keysToDelete = [];
               this.searchProcessing.forEach((value, key) => {
                   if (key.startsWith(`${tableNameForReset}-`)) {
                       keysToDelete.push(key);
                   }
               });
               keysToDelete.forEach(key => this.searchProcessing.delete(key));

               // 4. 모든 행 다시 표시
               const allRows = tableBody.querySelectorAll('tr');
               let restoredCount = 0;
               allRows.forEach(row => {
                   if (!row.classList.contains('search-no-results') && 
                       !row.classList.contains('filter-no-results') &&
                       !row.querySelector('.loading')) {
                       row.style.display = '';
                       restoredCount++;
                   }
               });

               // 5. "검색 결과 없음" 및 "필터 결과 없음" 메시지 제거
               const noResultsRows = tableBody.querySelectorAll('.search-no-results, .filter-no-results');
               noResultsRows.forEach(row => row.remove());

               console.log(`검색 및 필터 초기화 완료 - 테이블: ${tableNameForReset}, 복원된 행: ${restoredCount}`);

           } catch (error) {
               console.error('검색 및 필터 초기화 오류:', error);
               this.showMessage('검색 및 필터 초기화 중 오류가 발생했습니다.', 'error');
           }
       });

       const cell = document.createElement('td');
       cell.colSpan = colCount;
       cell.className = 'loading';
       cell.style.color = '#666';
       cell.style.textAlign = 'center';
       cell.style.padding = '20px';
       cell.innerHTML = `'${AdminUtils.sanitizeInput(searchTerm)}' 검색 결과가 없습니다. `;
       cell.appendChild(resetButton);

       noResultsRow.appendChild(cell);
       tableBody.appendChild(noResultsRow);
   }

   // 새로운 도우미 함수들
   removeSearchNoResults(tableBodyId) {
       const tableBody = AdminUtils.getElementById(tableBodyId);
       if (tableBody) {
           const noResultsRows = tableBody.querySelectorAll('.search-no-results');
           noResultsRows.forEach(row => row.remove());
       }
   }

   // 완전히 수정된 검색 초기화 함수
   clearSearchDirectly(inputId, tableName) {
       try {
           console.log(`검색 초기화 시작: ${tableName}, inputId: ${inputId}`);
           
           // 1. 검색 입력 필드 초기화
           const input = AdminUtils.getElementById(inputId);
           if (input) {
               input.value = '';
               console.log(`검색 입력 필드 초기화 완료: ${inputId}`);
           }

           // 2. 필터 셀렉트도 초기화
           const filterSelectId = inputId.replace('Search', 'Filter');
           const filterSelect = AdminUtils.getElementById(filterSelectId);
           if (filterSelect) {
               filterSelect.value = 'all';
               console.log(`필터 셀렉트 초기화 완료: ${filterSelectId}`);
           }

           // 3. 테이블 본체 찾기
           const tableBodyId = `${tableName}TableBody`;
           const tableBody = AdminUtils.getElementById(tableBodyId);
           if (!tableBody) {
               console.warn(`테이블 본체를 찾을 수 없습니다: ${tableBodyId}`);
               return;
           }

           // 4. "검색 결과 없음" 및 "필터 결과 없음" 메시지 제거
           const noResultsRows = tableBody.querySelectorAll('.search-no-results, .filter-no-results');
           noResultsRows.forEach(row => row.remove());

           // 5. 모든 데이터 행을 다시 표시
           const allRows = tableBody.querySelectorAll('tr');
           let visibleRowCount = 0;
           
           allRows.forEach(row => {
               // 로딩 메시지나 기타 시스템 행은 건드리지 않음
               if (!row.classList.contains('search-no-results') && 
                   !row.classList.contains('filter-no-results') &&
                   !row.querySelector('.loading')) {
                   row.style.display = '';
                   visibleRowCount++;
               }
           });

           // 6. 검색 상태 초기화
           this.searchStates.delete(tableName);
           
           // 7. 검색 처리 중 플래그 정리
           const keysToDelete = [];
           this.searchProcessing.forEach((value, key) => {
               if (key.startsWith(`${tableName}-`)) {
                   keysToDelete.push(key);
               }
           });
           keysToDelete.forEach(key => this.searchProcessing.delete(key));

           console.log(`검색 및 필터 초기화 완료: ${tableName}, 표시된 행 수: ${visibleRowCount}`);
           
       } catch (error) {
           console.error('검색 초기화 오류:', error);
       }
   }

   clearSearch(inputId, tableName) {
       // 기존 함수 유지 (호환성을 위해)
       this.clearSearchDirectly(inputId, tableName);
   }

   // 필터만 초기화하는 함수
   clearFilterDirectly(selectId, tableName) {
       try {
           console.log(`필터 초기화 시작: ${tableName}, selectId: ${selectId}`);
           
           // 1. 필터 셀렉트 초기화
           const select = AdminUtils.getElementById(selectId);
           if (select) {
               select.value = 'all';
               console.log(`필터 셀렉트 초기화 완료: ${selectId}`);
           }

           // 2. 테이블 본체 찾기
           const tableBodyId = `${tableName}TableBody`;
           const tableBody = AdminUtils.getElementById(tableBodyId);
           if (!tableBody) {
               console.warn(`테이블 본체를 찾을 수 없습니다: ${tableBodyId}`);
               return;
           }

           // 3. "필터 결과 없음" 메시지 제거
           const noResultsRows = tableBody.querySelectorAll('.filter-no-results');
           noResultsRows.forEach(row => row.remove());

           // 4. 모든 데이터 행을 다시 표시 (검색 필터는 유지)
           const searchInputId = selectId.replace('Filter', 'Search');
           const searchInput = AdminUtils.getElementById(searchInputId);
           const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

           const allRows = tableBody.querySelectorAll('tr');
           let visibleRowCount = 0;
           
           allRows.forEach(row => {
               if (!row.classList.contains('search-no-results') && 
                   !row.classList.contains('filter-no-results') &&
                   !row.querySelector('.loading')) {
                   
                   // 검색어가 있으면 검색 필터만 적용
                   if (searchTerm) {
                       const text = row.textContent.toLowerCase();
                       const isMatch = text.includes(searchTerm);
                       row.style.display = isMatch ? '' : 'none';
                       if (isMatch) visibleRowCount++;
                   } else {
                       row.style.display = '';
                       visibleRowCount++;
                   }
               }
           });

           console.log(`필터 초기화 완료: ${tableName}, 표시된 행 수: ${visibleRowCount}`);
           
       } catch (error) {
           console.error('필터 초기화 오류:', error);
       }
   }

   // 모든 필터와 검색 초기화
   clearAllFilters(tableName) {
       try {
           console.log(`전체 초기화 시작: ${tableName}`);
           
           // 1. 검색 입력 필드 초기화
           const searchInputId = `${tableName}Search`;
           const searchInput = AdminUtils.getElementById(searchInputId);
           if (searchInput) {
               searchInput.value = '';
           }

           // 2. 필터 셀렉트 초기화
           const filterSelectId = `${tableName}Filter`;
           const filterSelect = AdminUtils.getElementById(filterSelectId);
           if (filterSelect) {
               filterSelect.value = 'all';
           }

           // 3. 테이블 초기화
           const tableBodyId = `${tableName}TableBody`;
           const tableBody = AdminUtils.getElementById(tableBodyId);
           if (!tableBody) {
               console.warn(`테이블 본체를 찾을 수 없습니다: ${tableBodyId}`);
               return;
           }

           // 4. 모든 결과 없음 메시지 제거
           const noResultsRows = tableBody.querySelectorAll('.search-no-results, .filter-no-results');
           noResultsRows.forEach(row => row.remove());

           // 5. 모든 데이터 행을 다시 표시
           const allRows = tableBody.querySelectorAll('tr');
           let visibleRowCount = 0;
           
           allRows.forEach(row => {
               if (!row.classList.contains('search-no-results') && 
                   !row.classList.contains('filter-no-results') &&
                   !row.querySelector('.loading')) {
                   row.style.display = '';
                   visibleRowCount++;
               }
           });

           // 6. 상태 초기화
           this.searchStates.delete(tableName);
           const keysToDelete = [];
           this.searchProcessing.forEach((value, key) => {
               if (key.startsWith(`${tableName}-`)) {
                   keysToDelete.push(key);
               }
           });
           keysToDelete.forEach(key => this.searchProcessing.delete(key));

           console.log(`전체 초기화 완료: ${tableName}, 표시된 행 수: ${visibleRowCount}`);
           
       } catch (error) {
           console.error('전체 초기화 오류:', error);
       }
   }

   // 유틸리티 함수들
   showMessage(message, type = 'info') {
       const existingMessages = document.querySelectorAll('.admin-message');
       existingMessages.forEach(msg => {
           try {
               msg.remove();
           } catch (error) {
               console.error('메시지 제거 오류:', error);
           }
       });

       const messageEl = document.createElement('div');
       messageEl.className = `admin-message admin-message-${type}`;
       messageEl.textContent = message;

       const bgColors = {
           success: '#27ae60',
           error: '#e74c3c',
           warning: '#f39c12',
           info: '#3498db'
       };

       messageEl.style.cssText = `
           position: fixed;
           top: 20px;
           right: 20px;
           padding: 1rem 1.5rem;
           border-radius: 5px;
           color: white;
           font-weight: 600;
           z-index: 10001;
           max-width: 400px;
           word-wrap: break-word;
           animation: slideIn 0.3s ease;
           background: ${bgColors[type] || bgColors.info};
           box-shadow: 0 4px 12px rgba(0,0,0,0.15);
           cursor: pointer;
       `;

       document.body.appendChild(messageEl);

       const duration = type === 'error' ? 5000 : 3000;
       const timeoutId = setTimeout(() => {
           if (messageEl.parentNode) {
               messageEl.style.animation = 'slideOut 0.3s ease';
               setTimeout(() => {
                   if (messageEl.parentNode) {
                       messageEl.parentNode.removeChild(messageEl);
                   }
               }, 300);
           }
       }, duration);

       messageEl.addEventListener('click', () => {
           clearTimeout(timeoutId);
           if (messageEl.parentNode) {
               messageEl.parentNode.removeChild(messageEl);
           }
       });
   }

   showError(tableBodyId, message) {
       const tbody = AdminUtils.getElementById(tableBodyId);
       if (tbody) {
           const colCount = tbody.closest('table')?.querySelector('thead tr')?.children.length || 5;
           tbody.innerHTML = `
               <tr>
                   <td colspan="${colCount}" class="loading" style="color: #e74c3c;">
                       <i>⚠️</i> ${AdminUtils.sanitizeInput(message)}
                       <br>
                       <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 15px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;">페이지 새로고침</button>
                   </td>
               </tr>
           `;
       }
   }

   getErrorMessage(error) {
       if (!error) return '알 수 없는 오류가 발생했습니다.';

       const message = error.message || error.toString();

       if (message.includes('duplicate') || message.includes('중복')) {
           return '이미 존재하는 데이터입니다. 다른 값을 시도해주세요.';
       }
       if (message.includes('not found') || message.includes('찾을 수 없')) {
           return '요청한 데이터를 찾을 수 없습니다.';
       }
       if (message.includes('permission') || message.includes('권한')) {
           return '작업을 수행할 권한이 없습니다.';
       }
       if (message.includes('network') || message.includes('fetch')) {
           return '네트워크 연결을 확인해주세요.';
       }

       return message;
   }

   restorePageState() {
       try {
           const savedSection = sessionStorage.getItem('currentAdminSection');
           const savedGameTab = sessionStorage.getItem('currentGameTab');

           if (savedSection && savedSection !== 'dashboard') {
               this.switchSection(savedSection);
           }

           if (savedGameTab && savedGameTab !== 'characters') {
               this.switchGameTab(savedGameTab);
           }
       } catch (error) {
           console.error('페이지 상태 복원 오류:', error);
       }
   }

   destroy() {
       try {
           this.cleanupEventListeners();

           const detailModal = document.getElementById('detailViewModal');
           if (detailModal) {
               detailModal.remove();
           }

           this.loadingStates.clear();
           this.searchStates.clear();
           this.searchProcessing.clear(); // 추가된 정리

           const messages = document.querySelectorAll('.admin-message');
           messages.forEach(msg => {
               try {
                   msg.remove();
               } catch (error) {
                   console.error('메시지 정리 오류:', error);
               }
           });

           this.initialized = false;
           this._isRendering = false; // 렌더링 플래그 초기화
       } catch (error) {
           console.error('AdminManager 소멸자 오류:', error);
       }
   }
}

// CSS 스타일 삽입
const style = document.createElement('style');
style.textContent = `
   @keyframes slideIn {
       from { transform: translateX(100%); opacity: 0; }
       to { transform: translateX(0); opacity: 1; }
   }
   
   @keyframes slideOut {
       from { transform: translateX(0); opacity: 1; }
       to { transform: translateX(100%); opacity: 0; }
   }

   @keyframes fadeIn {
       from { opacity: 0; }
       to { opacity: 1; }
   }

   .detail-view-modal {
       position: fixed;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background: rgba(0, 0, 0, 0.9);
       display: none;
       justify-content: center;
       align-items: flex-start;
       z-index: 30000;
       overflow-y: auto;
       animation: fadeIn 0.3s ease;
   }

   .detail-view-container {
       background: white;
       width: 90%;
       max-width: 1200px;
       margin: 2rem auto;
       border-radius: 15px;
       box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
       overflow: hidden;
   }

   .detail-view-header {
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       color: white;
       padding: 2rem;
       display: flex;
       justify-content: space-between;
       align-items: center;
   }

   .detail-view-header h2 {
       margin: 0;
       font-size: 1.8rem;
   }

   .detail-close-btn {
       background: rgba(255, 255, 255, 0.2);
       border: none;
       color: white;
       font-size: 1.5rem;
       width: 40px;
       height: 40px;
       border-radius: 50%;
       cursor: pointer;
       transition: all 0.3s ease;
   }

   .detail-close-btn:hover {
       background: rgba(255, 255, 255, 0.3);
       transform: rotate(90deg);
   }

   .detail-view-content {
       padding: 2rem;
       max-height: 70vh;
       overflow-y: auto;
   }

   .detail-view-footer {
       background: #f8f9fa;
       padding: 1.5rem 2rem;
       border-top: 1px solid #dee2e6;
       display: flex;
       justify-content: flex-end;
       gap: 1rem;
   }

   .detail-grid {
       display: grid;
       grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
       gap: 2rem;
   }

   .detail-section {
       background: #f8f9fa;
       padding: 1.5rem;
       border-radius: 10px;
   }

   .detail-section.full-width {
       grid-column: 1 / -1;
   }

   .detail-section h3 {
       margin: 0 0 1rem 0;
       color: #2c3e50;
       border-bottom: 2px solid #3498db;
       padding-bottom: 0.5rem;
   }

   .detail-item {
       display: flex;
       padding: 0.75rem 0;
       border-bottom: 1px solid #e9ecef;
   }

   .detail-label {
       font-weight: 600;
       color: #495057;
       min-width: 120px;
       margin-right: 1rem;
   }

   .detail-value {
       color: #212529;
       flex: 1;
   }

   .stat-card {
       background: white;
       padding: 1.5rem;
       border-radius: 10px;
       box-shadow: 0 2px 10px rgba(0,0,0,0.1);
       text-align: center;
   }

   .stat-number {
       font-size: 2rem;
       font-weight: bold;
       color: #2c3e50;
       margin-bottom: 0.5rem;
   }

   .stat-label {
       color: #6c757d;
       font-size: 0.9rem;
   }

   .content-box {
       background: white;
       padding: 1.5rem;
       border: 1px solid #dee2e6;
       border-radius: 8px;
       margin-top: 0.5rem;
       line-height: 1.6;
       white-space: pre-wrap;
   }

   .game-data-tabs {
       display: flex;
       gap: 1rem;
       margin-bottom: 2rem;
       border-bottom: 2px solid #eee;
       padding-bottom: 1rem;
   }

   .game-tab-content {
       display: none;
   }

   .game-tab-content.active {
       display: block;
   }

   .form-group {
       margin-bottom: 1rem;
   }

   .form-label {
       display: block;
       margin-bottom: 0.5rem;
       font-weight: 600;
       color: #2c3e50;
   }

   .form-input {
       width: 100%;
       padding: 0.75rem;
       border: 1px solid #ddd;
       border-radius: 5px;
       font-size: 1rem;
       transition: border-color 0.3s ease, box-shadow 0.3s ease;
   }

   .form-input:focus {
       outline: none;
       border-color: #3498db;
       box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
   }

   .status-badge {
       display: inline-block;
       padding: 0.3rem 0.8rem;
       border-radius: 15px;
       font-size: 0.8rem;
       font-weight: 600;
   }

   .status-published { background: #d4edda; color: #155724; }
   .status-draft { background: #fff3cd; color: #856404; }
   .status-pending { background: #fff3cd; color: #856404; }
   .status-processing { background: #d1ecf1; color: #0c5460; }
   .status-resolved { background: #d4edda; color: #155724; }
   .status-closed { background: #f8d7da; color: #721c24; }

   @media (max-width: 768px) {
       .detail-view-container {
           width: 95%;
           margin: 1rem auto;
       }
       
       .detail-grid {
           grid-template-columns: 1fr;
       }
   }
`;

document.head.appendChild(style);

// 전역 변수 및 초기화
let adminManager;

document.addEventListener('DOMContentLoaded', async () => {
   try {
       adminManager = new AdminManager();
       await adminManager.init();

       if (adminManager.isLoggedIn) {
           adminManager.restorePageState();
       }

       // 전역 액션 함수들 정의
       window.adminManagerActions = {
           // 상세보기
           viewUser: (userId) => adminManager?.viewUser?.(userId),
           viewPost: (postId) => adminManager?.viewPost?.(postId),
           viewComment: (commentId) => adminManager?.viewComment?.(commentId),
           viewMedia: (mediaId) => adminManager?.viewMedia?.(mediaId),
           viewNews: (newsId) => adminManager?.viewNews?.(newsId),
           viewInquiry: (inquiryId) => adminManager?.viewInquiry?.(inquiryId),
           viewFAQ: (faqId) => adminManager?.viewFAQ?.(faqId),
           viewCharacter: (charName) => adminManager?.viewCharacter?.(charName),
           viewMonster: (monsterId) => adminManager?.viewMonster?.(monsterId),
           viewSkill: (skillId) => adminManager?.viewSkill?.(skillId),
           viewPlayer: (playerId) => adminManager?.viewPlayer?.(playerId),

           // 상세보기 관련
           closeDetailView: () => adminManager?.closeDetailView?.(),
           editFromDetail: (type, id) => adminManager?.editFromDetail?.(type, id),
           deleteFromDetail: (type, id) => adminManager?.deleteFromDetail?.(type, id),

           // 수정
           editUser: (userId) => adminManager?.editUser?.(userId),
           editPost: (postId) => adminManager?.editPost?.(postId),
           editMedia: (mediaId) => adminManager?.editMedia?.(mediaId),
           editNews: (newsId) => adminManager?.editNews?.(newsId),
           editInquiry: (inquiryId) => adminManager?.editInquiry?.(inquiryId),
           editFAQ: (faqId) => adminManager?.editFAQ?.(faqId),
           editCharacter: (charName) => adminManager?.editCharacter?.(charName),
           editMonster: (monsterId) => adminManager?.editMonster?.(monsterId),
           editSkill: (skillId) => adminManager?.editSkill?.(skillId),
           editPlayer: (playerId) => adminManager?.editPlayer?.(playerId),

           // 삭제
           deleteUser: (userId) => adminManager?.deleteUser?.(userId),
           deletePost: (postId) => adminManager?.deletePost?.(postId),
           deleteComment: (commentId) => adminManager?.deleteComment?.(commentId),
           deleteMedia: (mediaId) => adminManager?.deleteMedia?.(mediaId),
           deleteNews: (newsId) => adminManager?.deleteNews?.(newsId),
           deleteInquiry: (inquiryId) => adminManager?.deleteInquiry?.(inquiryId),
           deleteFAQ: (faqId) => adminManager?.deleteFAQ?.(faqId),
           deleteMonster: (monsterId) => adminManager?.deleteMonster?.(monsterId),

           // 플레이어 전용 기능
           resetPlayer: (playerId) => adminManager?.resetPlayer?.(playerId),
           addPlayer: () => adminManager?.addPlayer?.(),

           // 유틸리티 - 검색 및 필터 초기화
           clearSearch: (inputId, tableName) => adminManager?.clearSearchDirectly?.(inputId, tableName),
           clearFilter: (selectId, tableName) => adminManager?.clearFilterDirectly?.(selectId, tableName),
           clearAll: (tableName) => adminManager?.clearAllFilters?.(tableName)
       };

   } catch (error) {
       console.error('Admin Manager 초기화 실패:', error);
   }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
   if (adminManager) {
       adminManager.destroy();
   }
});