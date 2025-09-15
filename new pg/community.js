// community.js - 커뮤니티 페이지 전용 JavaScript

// 전역 변수
let currentUser = null;
let currentPage = 1;
let currentCategory = '전체';
let currentPostId = null;
let totalPages = 1;
let totalPosts = 0;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// 페이지 초기화
async function initializePage() {
    try {
        // 사용자 정보 확인
        currentUser = getCurrentUser();
        
        // 기본 이벤트 리스너 설정
        setupEventListeners();
        
        // 데이터 로드
        await loadCategoryStats();
        await loadPosts();
        await loadPopularPosts();
        
        // 채팅 활성화
        if (currentUser) {
            enableChat();
        }
    } catch (error) {
        console.error('페이지 초기화 오류:', error);
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 모바일 메뉴
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // 글쓰기 버튼
    const writeBtn = document.getElementById('writeBtn');
    if (writeBtn) {
        writeBtn.addEventListener('click', openWriteModal);
    }
    
    // 카테고리 필터
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentCategory = this.value;
            currentPage = 1;
            loadPosts();
        });
    }

    // 모달 관련
    setupModals();

    // 스크롤 효과
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}

// 모달 설정
function setupModals() {
    // 글쓰기 모달
    const writeModal = document.getElementById('writeModal');
    const writeModalClose = document.getElementById('writeModalClose');
    const writeCancelBtn = document.getElementById('writeCancelBtn');
    const writeForm = document.getElementById('writeForm');

    if (writeModalClose) {
        writeModalClose.addEventListener('click', closeWriteModal);
    }
    if (writeCancelBtn) {
        writeCancelBtn.addEventListener('click', closeWriteModal);
    }
    if (writeForm) {
        writeForm.addEventListener('submit', submitPost);
    }

    // 게시글 상세 모달
    const postDetailModal = document.getElementById('postDetailModal');
    const postDetailClose = document.getElementById('postDetailClose');
    
    if (postDetailClose) {
        postDetailClose.addEventListener('click', closePostDetailModal);
    }

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(e) {
        if (writeModal && e.target === writeModal) {
            closeWriteModal();
        }
        if (postDetailModal && e.target === postDetailModal) {
            closePostDetailModal();
        }
    });

    // 좋아요 버튼
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', toggleLike);
    }
    
    // 댓글 작성
    const commentSubmitBtn = document.getElementById('commentSubmitBtn');
    if (commentSubmitBtn) {
        commentSubmitBtn.addEventListener('click', submitComment);
    }
}

// 카테고리 통계 로드
async function loadCategoryStats() {
    try {
        const response = await fetch('/api/posts/stats/categories');
        const stats = await response.json();
        
        const categoryGrid = document.getElementById('categoryGrid');
        if (!categoryGrid) return;
        
        const categories = [
            { name: '인기', icon: '🔥', desc: '많은 관심을 받는 인기 글들' },
            { name: '자유', icon: '💬', desc: '자유롭게 이야기를 나누세요' },
            { name: '질문', icon: '❓', desc: '궁금한 점을 물어보세요' },
            { name: '공략', icon: '🎯', desc: '게임 공략과 팁을 공유하세요' },
            { name: '창작', icon: '🎨', desc: '팬아트와 창작물을 공유하세요' },
            { name: '건의', icon: '⚠️', desc: '게임 개선 사항을 제안해주세요' }
        ];

        categoryGrid.innerHTML = categories.map(category => {
            const stat = stats.find(s => s.category === category.name) || { post_count: 0, new_posts: 0 };
            const isPopular = category.name === '인기';
            
            return `
                <div class="category-card ${isPopular ? 'popular' : ''}" data-category="${category.name}">
                    <div class="category-icon">${category.icon}</div>
                    <div class="category-info">
                        <h4>${category.name} 게시판</h4>
                        <p class="category-desc">${category.desc}</p>
                        <div class="category-stats">
                            <span class="post-count">${stat.post_count}개 글</span>
                            <span class="new-posts">+${stat.new_posts} 새글</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // 카테고리 클릭 이벤트
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', function() {
                const category = this.dataset.category;
                const categoryFilter = document.getElementById('categoryFilter');
                if (category === '인기') {
                    // 인기 게시글 필터링 로직
                    currentCategory = '전체';
                    if (categoryFilter) categoryFilter.value = '전체';
                } else {
                    currentCategory = category;
                    if (categoryFilter) categoryFilter.value = category;
                }
                currentPage = 1;
                loadPosts();
            });
        });

    } catch (error) {
        console.error('카테고리 통계 로드 실패:', error);
        // 기본 카테고리 표시
        const categoryGrid = document.getElementById('categoryGrid');
        if (categoryGrid) {
            const categories = [
                { name: '인기', icon: '🔥', desc: '많은 관심을 받는 인기 글들' },
                { name: '자유', icon: '💬', desc: '자유롭게 이야기를 나누세요' },
                { name: '질문', icon: '❓', desc: '궁금한 점을 물어보세요' },
                { name: '공략', icon: '🎯', desc: '게임 공략과 팁을 공유하세요' },
                { name: '창작', icon: '🎨', desc: '팬아트와 창작물을 공유하세요' },
                { name: '건의', icon: '⚠️', desc: '게임 개선 사항을 제안해주세요' }
            ];

            categoryGrid.innerHTML = categories.map(category => `
                <div class="category-card ${category.name === '인기' ? 'popular' : ''}" data-category="${category.name}">
                    <div class="category-icon">${category.icon}</div>
                    <div class="category-info">
                        <h4>${category.name} 게시판</h4>
                        <p class="category-desc">${category.desc}</p>
                        <div class="category-stats">
                            <span class="post-count">0개 글</span>
                            <span class="new-posts">+0 새글</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// 게시글 목록 로드
async function loadPosts() {
    try {
        const response = await fetch(`/api/posts?category=${currentCategory}&page=${currentPage}&limit=10`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const posts = result.posts || result; // 배열 또는 객체 형태 모두 처리
        totalPages = result.totalPages || 1;
        totalPosts = result.totalPosts || posts.length;
        
        const postList = document.getElementById('postList');
        if (!postList) return;
        
        if (!posts || posts.length === 0) {
            postList.innerHTML = '<div class="no-posts">게시글이 없습니다.</div>';
            generatePagination();
            return;
        }

        postList.innerHTML = posts.map(post => {
            const isHot = (post.likes || 0) > 10 || (post.views || 0) > 100;
            const timeAgo = getTimeAgo(new Date(post.created_at));
            const commentCount = post.comment_count || 0;
            
            return `
                <div class="post-item ${isHot ? 'hot' : ''}" data-post-id="${post.post_id}">
                    ${isHot ? '<div class="post-badge">HOT</div>' : ''}
                    <div class="post-category">${post.category || '일반'}</div>
                    <div class="post-content">
                        <h4 class="post-title">${escapeHtml(post.title || '')}</h4>
                        <div class="post-meta">
                            <span class="author">${escapeHtml(post.nickname || '익명')}</span>
                            <span class="date">${timeAgo}</span>
                            <span class="views">◉ ${post.views || 0}</span>
                            <span class="comments">💬 ${commentCount}</span>
                            <span class="likes">❤️ ${post.likes || 0}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // 게시글 클릭 이벤트
        document.querySelectorAll('.post-item').forEach(item => {
            item.addEventListener('click', function() {
                const postId = this.dataset.postId;
                if (postId) {
                    openPostDetail(postId);
                }
            });
        });

        // 페이지네이션 생성
        generatePagination();

    } catch (error) {
        console.error('게시글 로드 실패:', error);
        const postList = document.getElementById('postList');
        if (postList) {
            postList.innerHTML = '<div class="error">게시글을 불러오는데 실패했습니다.</div>';
        }
    }
}

// 인기 게시글 로드
async function loadPopularPosts() {
    try {
        const response = await fetch('/api/posts/popular?limit=5');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        
        const popularPosts = document.getElementById('popularPosts');
        if (!popularPosts) return;
        
        if (!posts || posts.length === 0) {
            popularPosts.innerHTML = '<div class="no-popular-posts">인기 게시글이 없습니다.</div>';
            return;
        }
        
        popularPosts.innerHTML = posts.map(post => `
            <div class="popular-post" data-post-id="${post.post_id}">
                <div class="popular-post-title">${escapeHtml(post.title || '')}</div>
                <div class="popular-post-meta">
                    <span class="popular-post-likes">❤️ ${post.likes || 0}</span>
                    <span class="popular-post-views">◉ ${post.views || 0}</span>
                </div>
            </div>
        `).join('');

        // 인기 게시글 클릭 이벤트
        document.querySelectorAll('.popular-post').forEach(post => {
            post.addEventListener('click', function() {
                const postId = this.dataset.postId;
                if (postId) {
                    openPostDetail(postId);
                }
            });
        });

    } catch (error) {
        console.error('인기 게시글 로드 실패:', error);
        const popularPosts = document.getElementById('popularPosts');
        if (popularPosts) {
            popularPosts.innerHTML = '<div class="error">인기 게시글을 불러올 수 없습니다.</div>';
        }
    }
}

// 글쓰기 모달 열기
function openWriteModal() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
    }
    
    const writeModal = document.getElementById('writeModal');
    if (writeModal) {
        writeModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// 글쓰기 모달 닫기
function closeWriteModal() {
    const writeModal = document.getElementById('writeModal');
    if (writeModal) {
        writeModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        const writeForm = document.getElementById('writeForm');
        if (writeForm) {
            writeForm.reset();
        }
    }
}

// 게시글 작성 제출
async function submitPost(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }

    const writeCategory = document.getElementById('writeCategory');
    const writeTitle = document.getElementById('writeTitle');
    const writeContent = document.getElementById('writeContent');
    
    if (!writeCategory || !writeTitle || !writeContent) {
        alert('폼 요소를 찾을 수 없습니다.');
        return;
    }

    const category = writeCategory.value;
    const title = writeTitle.value.trim();
    const content = writeContent.value.trim();

    if (!category || !title || !content) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                category: category,
                title: title,
                content: content
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert('게시글이 작성되었습니다.');
            closeWriteModal();
            loadPosts();
            loadCategoryStats();
        } else {
            alert(result.error || '게시글 작성에 실패했습니다.');
        }

    } catch (error) {
        console.error('게시글 작성 오류:', error);
        alert('게시글 작성 중 오류가 발생했습니다.');
    }
}

// 게시글 상세 보기
async function openPostDetail(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const post = await response.json();

        currentPostId = postId;
        
        // 게시글 정보 표시
        const postDetailTitle = document.getElementById('postDetailTitle');
        const postDetailAuthor = document.getElementById('postDetailAuthor');
        const postDetailDate = document.getElementById('postDetailDate');
        const postDetailViews = document.getElementById('postDetailViews');
        const postDetailLikes = document.getElementById('postDetailLikes');
        const postDetailContent = document.getElementById('postDetailContent');
        
        if (postDetailTitle) postDetailTitle.textContent = post.title || '제목 없음';
        if (postDetailAuthor) postDetailAuthor.textContent = post.nickname || '익명';
        if (postDetailDate) postDetailDate.textContent = formatDate(new Date(post.created_at));
        if (postDetailViews) postDetailViews.textContent = `조회수: ${post.views || 0}`;
        if (postDetailLikes) postDetailLikes.textContent = `좋아요: ${post.likes || 0}`;
        if (postDetailContent) postDetailContent.innerHTML = formatContent(post.content || '');
        
        // 좋아요 상태 확인
        await checkLikeStatus(postId);
        
        // 댓글 로드
        await loadComments(postId);
        
        const postDetailModal = document.getElementById('postDetailModal');
        if (postDetailModal) {
            postDetailModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

    } catch (error) {
        console.error('게시글 상세 로드 실패:', error);
        alert('게시글을 불러오는데 실패했습니다.');
    }
}

// 게시글 상세 모달 닫기
function closePostDetailModal() {
    const postDetailModal = document.getElementById('postDetailModal');
    if (postDetailModal) {
        postDetailModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentPostId = null;
    }
}

// 좋아요 상태 확인
async function checkLikeStatus(postId) {
    if (!currentUser) return;

    try {
        const response = await fetch(`/api/posts/${postId}/like/status?user_id=${currentUser.id}`);
        const result = await response.json();
        
        const likeIcon = document.getElementById('likeIcon');
        const likeText = document.getElementById('likeText');
        
        if (response.ok && result.liked) {
            if (likeIcon) likeIcon.textContent = '💖';
            if (likeText) likeText.textContent = '좋아요 취소';
        } else {
            if (likeIcon) likeIcon.textContent = '❤️';
            if (likeText) likeText.textContent = '좋아요';
        }
    } catch (error) {
        console.error('좋아요 상태 확인 실패:', error);
    }
}

// 좋아요 토글
async function toggleLike() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }

    if (!currentPostId) return;

    try {
        const response = await fetch(`/api/posts/${currentPostId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: currentUser.id
            })
        });

        const result = await response.json();

        if (response.ok) {
            const likeIcon = document.getElementById('likeIcon');
            const likeText = document.getElementById('likeText');
            
            if (result.liked) {
                if (likeIcon) likeIcon.textContent = '💖';
                if (likeText) likeText.textContent = '좋아요 취소';
            } else {
                if (likeIcon) likeIcon.textContent = '❤️';
                if (likeText) likeText.textContent = '좋아요';
            }
            
            // 좋아요 수 업데이트
            const postDetailLikes = document.getElementById('postDetailLikes');
            if (postDetailLikes) {
                const currentLikes = parseInt(postDetailLikes.textContent.match(/\d+/) || [0])[0];
                const newLikes = result.liked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
                postDetailLikes.textContent = `좋아요: ${newLikes}`;
            }
            
            // 게시글 목록 새로고침
            loadPosts();
            loadPopularPosts();
        } else {
            alert(result.error || '좋아요 처리에 실패했습니다.');
        }

    } catch (error) {
        console.error('좋아요 처리 오류:', error);
        alert('좋아요 처리 중 오류가 발생했습니다.');
    }
}

// 댓글 로드
async function loadComments(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/comments`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const comments = await response.json();

        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;
        
        if (!comments || comments.length === 0) {
            commentsList.innerHTML = '<div class="no-comments">댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</div>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(comment.nickname || '익명')}</span>
                    <span class="comment-date">${getTimeAgo(new Date(comment.created_at))}</span>
                </div>
                <div class="comment-content">${formatContent(comment.content || '')}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('댓글 로드 실패:', error);
        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            commentsList.innerHTML = '<div class="error">댓글을 불러올 수 없습니다.</div>';
        }
    }
}

// 댓글 작성
async function submitComment() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }

    if (!currentPostId) return;

    const commentContent = document.getElementById('commentContent');
    if (!commentContent) {
        alert('댓글 입력 필드를 찾을 수 없습니다.');
        return;
    }

    const content = commentContent.value.trim();
    
    if (!content) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    try {
        const response = await fetch(`/api/posts/${currentPostId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: currentUser.id,
                content: content
            })
        });

        const result = await response.json();

        if (response.ok) {
            commentContent.value = '';
            loadComments(currentPostId);
        } else {
            alert(result.error || '댓글 작성에 실패했습니다.');
        }

    } catch (error) {
        console.error('댓글 작성 오류:', error);
        alert('댓글 작성 중 오류가 발생했습니다.');
    }
}

// 채팅 기능 활성화
function enableChat() {
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    
    if (chatInput && chatSendBtn) {
        chatInput.disabled = false;
        chatSendBtn.disabled = false;
        
        chatInput.placeholder = '메시지를 입력하세요...';
        
        // 엔터키로 전송
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
        
        chatSendBtn.addEventListener('click', sendChatMessage);
    }
}

// 채팅 메시지 전송
function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `
        <span class="chat-user">${currentUser.nickname}:</span>
        <span class="chat-text">${escapeHtml(message)}</span>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    chatInput.value = '';
}

// 페이지네이션 생성
function generatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // 이전 버튼
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage - 1})">‹ 이전</button>`;
    } else {
        paginationHTML += `<button class="page-btn disabled">‹ 이전</button>`;
    }
    
    // 페이지 번호들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-btn active">${i}</button>`;
        } else {
            paginationHTML += `<button class="page-btn" onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    // 다음 버튼
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage + 1})">다음 ›</button>`;
    } else {
        paginationHTML += `<button class="page-btn disabled">다음 ›</button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

// 페이지 변경
function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    loadPosts();
}

// 유틸리티 함수들
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTimeAgo(date) {
    if (!date) return '알 수 없음';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
}

function formatDate(date) {
    if (!date) return '날짜 없음';
    
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatContent(content) {
    if (!content) return '';
    return escapeHtml(content).replace(/\n/g, '<br>');
}