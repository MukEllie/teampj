// media.js - 미디어 페이지 완전 구현 (수정된 버전)

class MediaManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.currentCategory = 'screenshots';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.mediaItems = [];
        this.userMediaItems = []; // 사용자 미디어 별도 관리
        this.categories = [];
        this.isLoading = false;
        this.hasMoreItems = true;
        this.lastScrollY = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCategories();
        this.loadMediaItems();
        this.loadUserMediaItems(); // 사용자 미디어 로드 추가
        this.initializeAuth();
    }

    // 수정된 getCurrentUser 함수
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            console.log('localStorage에서 읽은 데이터:', userData);
            const user = userData ? JSON.parse(userData) : null;
            console.log('파싱된 사용자 정보:', user);
            return user;
        } catch (error) {
            console.error('사용자 데이터 파싱 오류:', error);
            return null;
        }
    }

    // 고객센터와 동일한 스타일로 수정
initializeAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const authButtons = document.querySelector('.auth-buttons');

    console.log('인증 초기화 - 현재 사용자:', this.currentUser);

    if (this.currentUser && authButtons) {
        authButtons.innerHTML = `
            <button class="auth-btn" onclick="alert('회원정보 기능')">회원정보</button>
            <button class="auth-btn" onclick="mediaManager.logout()">로그아웃</button>
        `;
    } else if (loginBtn && signupBtn) {
        console.log('사용자 없음 - 로그인/회원가입 버튼 표시');
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'login.html';
        });

        signupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'signup.html';
        });
    }
}

    // 수정된 logout 함수
    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('rememberUser');
        alert('로그아웃되었습니다.');
        window.location.reload();
    }

    setupEventListeners() {
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');

        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', function() {
                this.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        const mediaTabs = document.querySelectorAll('.media-tab');
        mediaTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('.play-btn') || e.target.closest('.play-btn')) {
                e.stopPropagation();
                this.playVideo(e.target.closest('.media-item'));
            }
        });

        document.addEventListener('click', (e) => {
            const mediaItem = e.target.closest('.media-item');
            if (mediaItem && !e.target.closest('.play-btn') && !e.target.closest('.media-controls')) {
                this.openMediaDetail(mediaItem);
            }
        });

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

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 100);
        });
    }

    handleScroll() {
        if (this.isLoading || !this.hasMoreItems) {
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 1000) {
            console.log('스크롤 트리거:', scrollTop + windowHeight, '>=', documentHeight - 1000);
            this.loadMoreItems();
        }
    }

    switchTab(tabName) {
        const tabs = document.querySelectorAll('.media-tab');
        const sections = document.querySelectorAll('.media-section');

        tabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        sections.forEach(section => {
            if (section.id === tabName) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        this.currentCategory = tabName;
        this.currentPage = 1;
        this.hasMoreItems = true;
        this.loadMediaItems(true);
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/media/categories');
            if (response.ok) {
                this.categories = await response.json();
                console.log('카테고리 로드 완료:', this.categories.length);
            }
        } catch (error) {
            console.error('카테고리 로드 오류:', error);
        }
    }

    async loadMediaItems(reset = false) {
        if (this.isLoading) {
            console.log('이미 로딩 중이므로 중단');
            return;
        }

        try {
            this.isLoading = true;
            
            if (reset) {
                this.mediaItems = [];
                this.currentPage = 1;
                this.hasMoreItems = true;
            }

            const params = new URLSearchParams({
                category: this.currentCategory,
                limit: this.itemsPerPage,
                offset: (this.currentPage - 1) * this.itemsPerPage
            });

            console.log(`미디어 로드 시작 - 카테고리: ${this.currentCategory}, 페이지: ${this.currentPage}`);

            const response = await fetch(`/api/media/items?${params}`);
            if (response.ok) {
                const newItems = await response.json();
                
                console.log(`미디어 아이템 조회 성공: ${newItems.length}개`);
                
                if (newItems.length < this.itemsPerPage) {
                    this.hasMoreItems = false;
                    console.log('더 이상 로드할 아이템이 없음');
                }
                
                if (reset) {
                    this.mediaItems = newItems;
                } else {
                    this.mediaItems = [...this.mediaItems, ...newItems];
                }

                this.renderMediaItems(reset);
                
                console.log(`총 ${this.mediaItems.length}개 아이템 보유`);
            } else {
                console.error('API 응답 오류:', response.status);
                this.hasMoreItems = false;
            }
        } catch (error) {
            console.error('미디어 아이템 로드 오류:', error);
            this.showError('미디어를 불러오는 중 오류가 발생했습니다.');
            this.hasMoreItems = false;
        } finally {
            this.isLoading = false;
        }
    }

    // 새로 추가: 사용자 미디어 아이템 로드
    async loadUserMediaItems() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`/api/media/user/${this.currentUser.id}`);
            if (response.ok) {
                this.userMediaItems = await response.json();
                console.log(`사용자 미디어 로드 완료: ${this.userMediaItems.length}개`);
            }
        } catch (error) {
            console.error('사용자 미디어 로드 오류:', error);
        }
    }

    async loadMoreItems() {
        if (this.isLoading || !this.hasMoreItems) {
            return;
        }
        
        console.log(`더 많은 아이템 로드 - 현재 페이지: ${this.currentPage}`);
        this.currentPage++;
        await this.loadMediaItems(false);
    }

    renderMediaItems(reset = false) {
        const activeSection = document.querySelector('.media-section.active');
        if (!activeSection) return;

        const gallery = activeSection.querySelector('.media-gallery');
        if (!gallery) return;

        if (reset) {
            gallery.innerHTML = '';
        }

        const loadingPlaceholder = gallery.querySelector('.loading-placeholder');
        if (loadingPlaceholder) {
            loadingPlaceholder.remove();
        }

        if (this.mediaItems.length === 0 && reset) {
            gallery.innerHTML = `
                <div class="no-media" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📷</div>
                    <p>이 카테고리에는 아직 미디어가 없습니다.</p>
                </div>
            `;
            return;
        }

        const startIndex = reset ? 0 : gallery.children.length;
        const newItems = this.mediaItems.slice(startIndex);

        newItems.forEach(item => {
            const mediaElement = this.createMediaElement(item);
            gallery.appendChild(mediaElement);
        });

        if (!this.hasMoreItems && this.mediaItems.length > 0) {
            const endMessage = document.createElement('div');
            endMessage.className = 'end-message';
            endMessage.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 2rem; color: #666; font-style: italic;';
            endMessage.textContent = '모든 미디어를 불러왔습니다.';
            gallery.appendChild(endMessage);
        }
    }

    // 핵심 수정: YouTube/Vimeo 썸네일 표시 개선된 createMediaElement
    createMediaElement(item) {
        const mediaElement = document.createElement('div');
        mediaElement.className = 'media-item';
        mediaElement.dataset.mediaId = item.media_id;

        const isVideo = item.file_type === 'video';
        const isYouTube = item.mime_type === 'video/youtube' || item.file_url.includes('youtube.com/embed');
        const isVimeo = item.mime_type === 'video/vimeo' || item.file_url.includes('player.vimeo.com');
        
        // YouTube 썸네일 URL 생성
        let thumbnailUrl = '';
        if (isYouTube) {
            const youtubeId = this.extractYouTubeId(item.file_url || item.file_path);
            thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : '';
        } else if (isVimeo) {
            // Vimeo의 경우 API를 통해 썸네일을 가져와야 하지만, 여기서는 기본 플레이스홀더 사용
            thumbnailUrl = '';
        } else {
            // 일반 파일의 경우
            thumbnailUrl = item.file_url || `/uploads/media/${item.file_name}`;
        }

        mediaElement.innerHTML = `
            <div class="media-thumbnail">
                ${isYouTube ? 
                    `<div class="video-container" style="position: relative; cursor: pointer;">
                        <img src="${thumbnailUrl}" alt="${item.title}" 
                             style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="video-placeholder" style="display: none; width: 100%; height: 200px; background: linear-gradient(135deg, #ff0000, #cc0000); border-radius: 8px; align-items: center; justify-content: center; flex-direction: column; color: white;">
                            <span style="font-size: 3rem; margin-bottom: 0.5rem;">📺</span>
                            <span style="font-weight: 600; text-align: center; padding: 0 1rem;">YouTube 동영상</span>
                            <span style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.8;">${item.title}</span>
                        </div>
                        <div class="play-overlay" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.9;">
                            <div style="background: rgba(255,0,0,0.9); color: white; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                                <span>▶️</span>
                                <span>YouTube</span>
                            </div>
                        </div>
                     </div>` :
                    isVimeo ? 
                    `<div class="video-container" style="position: relative; cursor: pointer;">
                        <div class="video-placeholder" style="width: 100%; height: 200px; background: linear-gradient(135deg, #1ab7ea, #1563c7); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-direction: column; color: white;">
                            <span style="font-size: 3rem; margin-bottom: 0.5rem;">🎬</span>
                            <span style="font-weight: 600; text-align: center; padding: 0 1rem;">Vimeo 동영상</span>
                            <span style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.8;">${item.title}</span>
                        </div>
                        <div class="play-overlay" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.9;">
                            <div style="background: rgba(26,183,234,0.9); color: white; border-radius: 8px; padding: 0.5rem 1rem; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                                <span>▶️</span>
                                <span>Vimeo</span>
                            </div>
                        </div>
                     </div>` :
                    isVideo ? 
                    `<div class="video-container" style="position: relative;">
                        <img src="${thumbnailUrl}" alt="${item.title}" 
                             style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="video-placeholder" style="display: none; width: 100%; height: 200px; background: #f0f0f0; border-radius: 8px; align-items: center; justify-content: center; flex-direction: column;">
                            <span style="font-size: 3rem; margin-bottom: 0.5rem;">🎥</span>
                            <span style="color: #666;">${item.title}</span>
                        </div>
                        <div class="play-overlay" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                            <button class="play-btn" style="background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 50px; height: 50px; font-size: 1.2rem; cursor: pointer;">▶</button>
                        </div>
                     </div>` :
                    `<img src="${thumbnailUrl}" alt="${item.title}" 
                          style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;"
                          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="image-placeholder" style="display: none; width: 100%; height: 200px; background: #f0f0f0; border-radius: 8px; align-items: center; justify-content: center; flex-direction: column;">
                         <span style="font-size: 3rem; margin-bottom: 0.5rem;">${this.getCategoryIcon(item.category_code)}</span>
                         <span style="color: #666;">${item.title}</span>
                     </div>`
                }
            </div>
            <div class="media-info">
                <h4 class="media-title">${this.escapeHtml(item.title)}</h4>
                <p class="media-description">${this.escapeHtml(item.description || '').substring(0, 100)}${item.description && item.description.length > 100 ? '...' : ''}</p>
                <div class="media-meta">
                    <span>${this.formatDate(item.upload_date)}</span>
                    <span>${item.resolution || (isVideo ? this.formatDuration(item.duration) : '')}</span>
                </div>
                <div class="media-stats" style="margin-top: 0.5rem; display: flex; gap: 1rem; font-size: 0.8rem; color: #666;">
                    <span>👁 ${item.views?.toLocaleString() || '0'}</span>
                    <span>❤️ ${item.likes?.toLocaleString() || '0'}</span>
                    <span>⬇️ ${item.downloads?.toLocaleString() || '0'}</span>
                </div>
            </div>
        `;

        return mediaElement;
    }

    getCategoryIcon(categoryCode) {
        const icons = {
            'screenshots': '📸',
            'videos': '🎥',
            'artwork': '🎨',
            'wallpapers': '🖥️'
        };
        return icons[categoryCode] || '📁';
    }

    // YouTube ID 추출 함수 추가 (누락된 함수 복원)
    extractYouTubeId(url) {
        if (!url) return null;
        
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(youtubeRegex);
        
        if (match) {
            return match[1];
        }
        
        // embed URL에서 추출하는 경우
        const embedRegex = /youtube\.com\/embed\/([^"&?\/\s]{11})/i;
        const embedMatch = url.match(embedRegex);
        
        return embedMatch ? embedMatch[1] : null;
    }

    playVideo(mediaItem) {
        const mediaId = mediaItem.dataset.mediaId;
        const item = this.mediaItems.find(item => item.media_id == mediaId);
        
        if (item) {
            if (item.file_type === 'video') {
                alert(`"${item.title}" 동영상을 재생합니다.\n(실제 환경에서는 동영상 플레이어가 열립니다)`);
                this.incrementViews(mediaId);
            } else {
                this.openMediaDetail(mediaItem);
            }
        }
    }

    async openMediaDetail(mediaItem) {
        const mediaId = mediaItem.dataset.mediaId;
        
        try {
            const response = await fetch(`/api/media/items/${mediaId}`);
            if (!response.ok) throw new Error('미디어 정보를 불러올 수 없습니다.');
            
            const item = await response.json();
            this.showMediaModal(item);
        } catch (error) {
            console.error('미디어 상세 로드 오류:', error);
            this.showError('미디어 상세 정보를 불러오는 중 오류가 발생했습니다.');
        }
    }

    // 수정된 showMediaModal 함수 - 실제 이미지/비디오 표시
    showMediaModal(item) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';

        const isVideo = item.file_type === 'video';
        const isYouTube = item.mime_type === 'video/youtube' || item.file_url.includes('youtube.com/embed');
        const isVimeo = item.mime_type === 'video/vimeo' || item.file_url.includes('player.vimeo.com');
        const mediaUrl = item.file_url || `/uploads/media/${item.file_name}`;

        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>${this.escapeHtml(item.title)}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="media-detail-container">
                        <div class="media-preview">
                            <div class="media-preview-content">
                                ${isYouTube || isVimeo ? 
                                    `<div style="position: relative; width: 100%; height: 400px; border-radius: 8px; overflow: hidden;">
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            src="${item.file_url}" 
                                            frameborder="0" 
                                            allowfullscreen
                                            style="border-radius: 8px;"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                                        </iframe>
                                     </div>` :
                                    isVideo ? 
                                    `<video controls style="width: 100%; max-height: 400px; border-radius: 8px;">
                                        <source src="${mediaUrl}" type="${item.mime_type}">
                                        동영상을 재생할 수 없습니다.
                                     </video>` :
                                    `<img src="${mediaUrl}" alt="${item.title}" 
                                          style="width: 100%; max-height: 400px; object-fit: contain; border-radius: 8px;"
                                          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                     <div class="image-error" style="display: none; width: 100%; height: 400px; background: #f0f0f0; border-radius: 8px; align-items: center; justify-content: center; flex-direction: column;">
                                         <span style="font-size: 4rem; margin-bottom: 1rem;">${this.getCategoryIcon(item.category_code)}</span>
                                         <p style="margin: 0; color: #666;">이미지를 불러올 수 없습니다</p>
                                         <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #999;">${item.title}</p>
                                     </div>`
                                }
                            </div>
                            <div class="media-actions">
                                <button class="action-btn like-btn" onclick="mediaManager.toggleLike(${item.media_id}, this)">
                                    <span>❤️</span>
                                    <span class="like-count">${item.likes || 0}</span>
                                </button>
                                ${!isYouTube && !isVimeo ? `
                                    <button class="action-btn download-btn" onclick="mediaManager.downloadMedia(${item.media_id})">
                                        <span>⬇️</span>
                                        <span>다운로드</span>
                                    </button>
                                ` : `
                                    <button class="action-btn download-btn" onclick="window.open('${item.file_path}', '_blank')">
                                        <span>🔗</span>
                                        <span>원본 보기</span>
                                    </button>
                                `}
                                <button class="action-btn share-btn" onclick="mediaManager.shareMedia(${item.media_id})">
                                    <span>📤</span>
                                    <span>공유</span>
                                </button>
                            </div>
                        </div>
                        <div class="media-details">
                            <div class="meta-details">
                                <div class="meta-item">
                                    <span class="label">카테고리</span>
                                    <span class="value">${item.category_name}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="label">업로드 날짜</span>
                                    <span class="value">${this.formatDate(item.upload_date)}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="label">해상도</span>
                                    <span class="value">${item.resolution || 'N/A'}</span>
                                </div>
                                ${isVideo ? `
                                <div class="meta-item">
                                    <span class="label">재생 시간</span>
                                    <span class="value">${this.formatDuration(item.duration)}</span>
                                </div>` : ''}
                                <div class="meta-item">
                                    <span class="label">조회수</span>
                                    <span class="value">${item.views?.toLocaleString() || '0'}</span>
                                </div>
                            </div>
                            <div class="comments-section">
                                <h5>댓글</h5>
                                ${this.currentUser ? `
                                <div class="comment-write">
                                    <textarea placeholder="댓글을 작성해주세요..." id="commentInput"></textarea>
                                    <button class="btn btn-primary" onclick="mediaManager.addComment(${item.media_id})">댓글 작성</button>
                                </div>` : 
                                '<p style="color: #666; font-style: italic; text-align: center; padding: 1rem;">댓글을 작성하려면 로그인이 필요합니다.</p>'}
                                <div class="comments-list" id="commentsList"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        this.loadComments(item.media_id);
    }

    async toggleLike(mediaId, button) {
        if (!this.currentUser) {
            alert('좋아요를 누르려면 로그인이 필요합니다.');
            return;
        }

        try {
            const response = await fetch(`/api/media/items/${mediaId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.currentUser.id
                })
            });

            if (response.ok) {
                const result = await response.json();
                const likeCountSpan = button.querySelector('.like-count');
                const currentCount = parseInt(likeCountSpan.textContent);
                
                if (result.liked) {
                    likeCountSpan.textContent = currentCount + 1;
                    button.classList.add('liked');
                } else {
                    likeCountSpan.textContent = Math.max(0, currentCount - 1);
                    button.classList.remove('liked');
                }
            }
        } catch (error) {
            console.error('좋아요 오류:', error);
            this.showError('좋아요 처리 중 오류가 발생했습니다.');
        }
    }

    async downloadMedia(mediaId) {
        try {
            const params = new URLSearchParams();
            if (this.currentUser) {
                params.append('user_id', this.currentUser.id);
            }

            window.open(`/api/media/download/${mediaId}?${params}`, '_blank');
            this.incrementDownloads(mediaId);
        } catch (error) {
            console.error('다운로드 오류:', error);
            this.showError('다운로드 중 오류가 발생했습니다.');
        }
    }

    shareMedia(mediaId) {
        const item = this.mediaItems.find(item => item.media_id == mediaId);
        if (!item) return;

        const shareUrl = `${window.location.origin}/media.html?item=${mediaId}`;
        
        if (navigator.share) {
            navigator.share({
                title: item.title,
                text: item.description,
                url: shareUrl
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('링크가 클립보드에 복사되었습니다.');
            }).catch(() => {
                const textarea = document.createElement('textarea');
                textarea.value = shareUrl;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('링크가 클립보드에 복사되었습니다.');
            });
        }
    }

    async loadComments(mediaId) {
        try {
            const response = await fetch(`/api/media/items/${mediaId}/comments`);
            if (response.ok) {
                const comments = await response.json();
                this.renderComments(comments);
            }
        } catch (error) {
            console.error('댓글 로드 오류:', error);
        }
    }

    renderComments(comments) {
        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;

        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="no-comments">첫 번째 댓글을 작성해보세요!</p>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${this.escapeHtml(comment.nickname)}</span>
                    <span class="comment-date">${this.formatDate(comment.created_at)}</span>
                </div>
                <div class="comment-content">${this.escapeHtml(comment.content)}</div>
                ${comment.likes > 0 ? `<div class="comment-likes">👍 ${comment.likes}</div>` : ''}
            </div>
        `).join('');
    }

    async addComment(mediaId) {
        if (!this.currentUser) {
            alert('댓글을 작성하려면 로그인이 필요합니다.');
            return;
        }

        const commentInput = document.getElementById('commentInput');
        const content = commentInput.value.trim();

        if (!content) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        if (content.length > 500) {
            alert('댓글은 500자 이내로 작성해주세요.');
            return;
        }

        try {
            const response = await fetch(`/api/media/items/${mediaId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.currentUser.id,
                    content: content
                })
            });

            if (response.ok) {
                commentInput.value = '';
                this.loadComments(mediaId);
            } else {
                throw new Error('댓글 작성 실패');
            }
        } catch (error) {
            console.error('댓글 작성 오류:', error);
            this.showError('댓글 작성 중 오류가 발생했습니다.');
        }
    }

    async incrementViews(mediaId) {
        try {
            await fetch(`/api/media/items/${mediaId}`, { method: 'GET' });
        } catch (error) {
            console.error('조회수 증가 오류:', error);
        }
    }

    incrementDownloads(mediaId) {
        const mediaElement = document.querySelector(`[data-media-id="${mediaId}"]`);
        if (mediaElement) {
            const downloadStat = mediaElement.querySelector('.media-stats span:last-child');
            if (downloadStat) {
                const currentCount = parseInt(downloadStat.textContent.replace(/[^\d]/g, ''));
                downloadStat.textContent = `⬇️ ${(currentCount + 1).toLocaleString()}`;
            }
        }
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR');
        } catch (error) {
            return dateString;
        }
    }

    formatDuration(seconds) {
        if (!seconds) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: #ff4757; color: white; padding: 1rem 1.5rem;
            border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: #28a745; color: white; padding: 1rem 1.5rem;
            border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
        `;
        successDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>✅</span>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('item');
        
        if (itemId) {
            setTimeout(() => {
                this.openMediaDetailById(itemId);
            }, 1000);
        }
    }

    async openMediaDetailById(mediaId) {
        try {
            const response = await fetch(`/api/media/items/${mediaId}`);
            if (response.ok) {
                const item = await response.json();
                this.showMediaModal(item);
            }
        } catch (error) {
            console.error('미디어 로드 오류:', error);
        }
    }

    // 수정된 미디어 업로드 모달 - 폼 검증 오류 해결
    showUploadModal() {
        if (!this.currentUser) {
            alert('미디어를 업로드하려면 로그인이 필요합니다.');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';

        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>📤 미디어 업로드</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="upload-mode-toggle" style="margin-bottom: 2rem; text-align: center;">
                        <div style="display: inline-flex; background: #f8f9fa; border-radius: 10px; padding: 0.3rem;">
                            <button type="button" id="fileUploadBtn" class="upload-mode-btn active" style="
                                padding: 0.8rem 1.5rem; border: none; border-radius: 8px; 
                                cursor: pointer; font-weight: 600; background: #667eea; color: white;
                            ">📁 파일 업로드</button>
                            <button type="button" id="urlUploadBtn" class="upload-mode-btn" style="
                                padding: 0.8rem 1.5rem; border: none; border-radius: 8px; 
                                cursor: pointer; font-weight: 600; background: transparent; color: #666;
                            ">🔗 URL 업로드</button>
                        </div>
                    </div>

                    <!-- 파일 업로드 폼 -->
                    <form id="fileUploadForm" enctype="multipart/form-data" style="display: block;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                            <div class="upload-left">
                                <div class="form-group">
                                    <label class="form-label">파일 선택</label>
                                    <div class="file-drop-zone" id="fileDropZone" style="
                                        border: 2px dashed #ddd; border-radius: 10px; padding: 3rem; 
                                        text-align: center; cursor: pointer; transition: all 0.3s ease; background: #f8f9fa;
                                    ">
                                        <div class="drop-content">
                                            <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">📁</span>
                                            <p style="margin: 0; color: #666; font-weight: 600;">파일을 드래그하거나 클릭하여 선택</p>
                                            <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #999;">JPG, PNG, GIF, MP4, WebM (최대 50MB)</p>
                                        </div>
                                    </div>
                                    <input type="file" id="mediaFile" name="media" accept="image/*,video/*" style="display: none;">
                                    <div id="filePreview" style="margin-top: 1rem; display: none;"></div>
                                </div>
                            </div>
                            
                            <div class="upload-right">
                                <div class="form-group">
                                    <label for="mediaCategory" class="form-label">카테고리</label>
                                    <select id="mediaCategory" name="category_id" required class="form-input">
                                        <option value="">카테고리 선택</option>
                                        <option value="1">스크린샷</option>
                                        <option value="2">동영상</option>
                                        <option value="3">아트워크</option>
                                        <option value="4">배경화면</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="mediaTitle" class="form-label">제목</label>
                                    <input type="text" id="mediaTitle" name="title" required maxlength="200" class="form-input" placeholder="미디어 제목을 입력하세요">
                                </div>
                                
                                <div class="form-group">
                                    <label for="mediaDescription" class="form-label">설명</label>
                                    <textarea id="mediaDescription" name="description" rows="4" class="form-input" placeholder="미디어에 대한 설명을 입력하세요"></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label for="mediaTags" class="form-label">태그</label>
                                    <input type="text" id="mediaTags" name="tags" placeholder="태그를 쉼표로 구분하여 입력" class="form-input">
                                    <div class="form-help">예: 게임플레이, 액션, 스킬, 전투</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions" style="margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1.5rem;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">취소</button>
                            <button type="submit" class="btn btn-primary" id="fileUploadSubmitBtn">업로드</button>
                        </div>
                    </form>

                    <!-- URL 업로드 폼 (별도 폼으로 분리) -->
                    <form id="urlUploadForm" style="display: none;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                            <div class="upload-left">
                                <div class="form-group">
                                    <label class="form-label">미디어 URL</label>
                                    <div style="background: #f8f9fa; border-radius: 10px; padding: 2rem; text-align: center; margin-bottom: 1rem;">
                                        <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">🔗</span>
                                        <p style="margin: 0; color: #666; font-weight: 600;">이미지나 동영상의 직접 링크를 입력하세요</p>
                                    </div>
                                    <input type="url" id="mediaUrl" name="url" placeholder="https://example.com/image.jpg" class="form-input" style="margin-bottom: 1rem;">
                                    <div id="urlPreview" style="display: none; text-align: center;"></div>
                                </div>
                            </div>
                            
                            <div class="upload-right">
                                <div class="form-group">
                                    <label for="urlMediaCategory" class="form-label">카테고리</label>
                                    <select id="urlMediaCategory" name="category_id" class="form-input">
                                        <option value="">카테고리 선택</option>
                                        <option value="1">스크린샷</option>
                                        <option value="2">동영상</option>
                                        <option value="3">아트워크</option>
                                        <option value="4">배경화면</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="urlMediaTitle" class="form-label">제목</label>
                                    <input type="text" id="urlMediaTitle" name="title" maxlength="200" class="form-input" placeholder="미디어 제목을 입력하세요">
                                </div>
                                
                                <div class="form-group">
                                    <label for="urlMediaDescription" class="form-label">설명</label>
                                    <textarea id="urlMediaDescription" name="description" rows="4" class="form-input" placeholder="미디어에 대한 설명을 입력하세요"></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label for="urlMediaTags" class="form-label">태그</label>
                                    <input type="text" id="urlMediaTags" name="tags" placeholder="태그를 쉼표로 구분하여 입력" class="form-input">
                                    <div class="form-help">예: 게임플레이, 액션, 스킬, 전투</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions" style="margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1.5rem;">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">취소</button>
                            <button type="submit" class="btn btn-primary" id="urlUploadSubmitBtn">업로드</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupUploadModal(modal);
    }

    // 수정된 setupUploadModal 함수 - 폼 검증 오류 해결
    setupUploadModal(modal) {
        const fileUploadBtn = modal.querySelector('#fileUploadBtn');
        const urlUploadBtn = modal.querySelector('#urlUploadBtn');
        const fileUploadForm = modal.querySelector('#fileUploadForm');
        const urlUploadForm = modal.querySelector('#urlUploadForm');
        const fileDropZone = modal.querySelector('#fileDropZone');
        const fileInput = modal.querySelector('#mediaFile');
        const urlInput = modal.querySelector('#mediaUrl');

        // 업로드 모드 토글 - 핵심 수정 부분
        fileUploadBtn.addEventListener('click', () => {
            // 버튼 상태 변경
            fileUploadBtn.classList.add('active');
            urlUploadBtn.classList.remove('active');
            fileUploadBtn.style.background = '#667eea';
            fileUploadBtn.style.color = 'white';
            urlUploadBtn.style.background = 'transparent';
            urlUploadBtn.style.color = '#666';
            
            // 폼 표시/숨김
            fileUploadForm.style.display = 'block';
            urlUploadForm.style.display = 'none';
            
            // URL 폼의 required 속성 제거 (핵심 수정)
            const urlRequiredFields = urlUploadForm.querySelectorAll('[required]');
            urlRequiredFields.forEach(field => {
                field.removeAttribute('required');
            });
            
            // 파일 폼의 required 속성 복원
            const fileRequiredFields = fileUploadForm.querySelectorAll('[data-required="true"]');
            fileRequiredFields.forEach(field => {
                field.setAttribute('required', 'required');
            });
            
            // 파일 폼 필드들에 required 속성 설정
            fileUploadForm.querySelector('#mediaCategory').setAttribute('required', 'required');
            fileUploadForm.querySelector('#mediaTitle').setAttribute('required', 'required');
        });

        urlUploadBtn.addEventListener('click', () => {
            // 버튼 상태 변경
            urlUploadBtn.classList.add('active');
            fileUploadBtn.classList.remove('active');
            urlUploadBtn.style.background = '#667eea';
            urlUploadBtn.style.color = 'white';
            fileUploadBtn.style.background = 'transparent';
            fileUploadBtn.style.color = '#666';
            
            // 폼 표시/숨김
            urlUploadForm.style.display = 'block';
            fileUploadForm.style.display = 'none';
            
            // 파일 폼의 required 속성 제거 (핵심 수정)
            const fileRequiredFields = fileUploadForm.querySelectorAll('[required]');
            fileRequiredFields.forEach(field => {
                field.setAttribute('data-required', 'true'); // 나중에 복원하기 위해 저장
                field.removeAttribute('required');
            });
            
            // URL 폼의 required 속성 설정
            urlUploadForm.querySelector('#mediaUrl').setAttribute('required', 'required');
            urlUploadForm.querySelector('#urlMediaCategory').setAttribute('required', 'required');
            urlUploadForm.querySelector('#urlMediaTitle').setAttribute('required', 'required');
        });

        // 파일 드롭존 이벤트
        fileDropZone.addEventListener('click', () => fileInput.click());
        
        fileDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileDropZone.style.borderColor = '#667eea';
            fileDropZone.style.backgroundColor = '#f0f4ff';
        });

        fileDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileDropZone.style.borderColor = '#ddd';
            fileDropZone.style.backgroundColor = '#f8f9fa';
        });

        fileDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            fileDropZone.style.borderColor = '#ddd';
            fileDropZone.style.backgroundColor = '#f8f9fa';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0], modal);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.handleFileSelect(e.target.files[0], modal);
            }
        });

        // URL 미리보기
        urlInput.addEventListener('input', (e) => {
            this.handleUrlPreview(e.target.value, modal);
        });

        // 각 폼별로 별도 이벤트 리스너 설정
        fileUploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadMediaFile(fileUploadForm, modal);
        });

        urlUploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadMediaUrl(urlUploadForm, modal);
        });
    }

    // 수정된 URL 미리보기 처리 - 유튜브 및 다양한 플랫폼 지원
    handleUrlPreview(url, modal) {
        const urlPreview = modal.querySelector('#urlPreview');
        
        if (!url || !this.isValidUrl(url)) {
            urlPreview.style.display = 'none';
            return;
        }

        const isImageUrl = /\.(jpg|jpeg|png|gif|bmp|webp)(\?.*)?$/i.test(url);
        const isVideoUrl = /\.(mp4|webm|mov|avi)(\?.*)?$/i.test(url);
        const isYouTubeUrl = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i.test(url);
        const isVimeoUrl = /vimeo\.com\/(?:.*\/)?(\d+)/i.test(url);

        if (isImageUrl) {
            urlPreview.style.display = 'block';
            urlPreview.innerHTML = `
                <div style="text-align: center;">
                    <img src="${url}" alt="URL 미리보기" 
                         style="max-width: 100%; max-height: 200px; border-radius: 8px; margin-bottom: 1rem;"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div style="display: none; padding: 1rem; background: #f0f0f0; border-radius: 8px; color: #666;">
                        URL에서 이미지를 불러올 수 없습니다
                    </div>
                    <p style="margin: 0; font-size: 0.9rem; color: #666;">이미지 URL 미리보기</p>
                </div>
            `;
        } else if (isYouTubeUrl) {
            const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
            if (youtubeMatch) {
                const videoId = youtubeMatch[1];
                const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                urlPreview.style.display = 'block';
                urlPreview.innerHTML = `
                    <div style="text-align: center;">
                        <div style="position: relative; width: 100%; height: 150px; border-radius: 8px; overflow: hidden; margin-bottom: 1rem;">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src="${embedUrl}" 
                                frameborder="0" 
                                allowfullscreen
                                style="border-radius: 8px;"
                                loading="lazy"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                            </iframe>
                        </div>
                        <p style="margin: 0; color: #666; font-weight: 600;">YouTube 동영상 미리보기</p>
                    </div>
                `;
            }
        } else if (isVimeoUrl) {
            const vimeoMatch = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/i);
            if (vimeoMatch) {
                const videoId = vimeoMatch[1];
                const embedUrl = `https://player.vimeo.com/video/${videoId}`;
                urlPreview.style.display = 'block';
                urlPreview.innerHTML = `
                    <div style="text-align: center;">
                        <div style="position: relative; width: 100%; height: 150px; border-radius: 8px; overflow: hidden; margin-bottom: 1rem;">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src="${embedUrl}" 
                                frameborder="0" 
                                allowfullscreen
                                style="border-radius: 8px;"
                                loading="lazy">
                            </iframe>
                        </div>
                        <p style="margin: 0; color: #666; font-weight: 600;">Vimeo 동영상 미리보기</p>
                    </div>
                `;
            }
        } else if (isVideoUrl) {
            urlPreview.style.display = 'block';
            urlPreview.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: #f0f0f0; border-radius: 8px;">
                    <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">🎥</span>
                    <p style="margin: 0; color: #666; font-weight: 600;">직접 동영상 링크</p>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: #999;">업로드 가능한 동영상 URL입니다</p>
                </div>
            `;
        } else {
            urlPreview.style.display = 'block';
            urlPreview.innerHTML = `
                <div style="text-align: center; padding: 1rem; background: #fff3cd; border-radius: 8px; color: #856404;">
                    ⚠️ 직접 파일 링크 또는 YouTube, Vimeo 등의 동영상 플랫폼 URL을 입력해주세요
                    <br><small style="font-size: 0.8rem; margin-top: 0.5rem; display: block;">
                    지원 형식: 직접 링크(.jpg, .png, .gif, .mp4, .webm) 또는 YouTube/Vimeo URL
                    </small>
                </div>
            `;
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    handleFileSelect(file, modal) {
        if (!this.validateFile(file)) {
            return;
        }

        const filePreview = modal.querySelector('#filePreview');
        const dropContent = modal.querySelector('.drop-content');
        
        filePreview.style.display = 'block';
        dropContent.style.display = 'none';

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (isImage) {
            const reader = new FileReader();
            reader.onload = (e) => {
                filePreview.innerHTML = `
                    <div style="text-align: center;">
                        <img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px; margin-bottom: 1rem;">
                        <p style="margin: 0; font-size: 0.9rem; color: #666;">${file.name} (${this.formatFileSize(file.size)})</p>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else if (isVideo) {
            filePreview.innerHTML = `
                <div style="text-align: center;">
                    <div style="background: #f0f0f0; padding: 2rem; border-radius: 8px; margin-bottom: 1rem;">
                        <span style="font-size: 3rem;">🎥</span>
                        <p style="margin: 0.5rem 0 0 0; color: #666;">동영상 파일</p>
                    </div>
                    <p style="margin: 0; font-size: 0.9rem; color: #666;">${file.name} (${this.formatFileSize(file.size)})</p>
                </div>
            `;
        }

        const categorySelect = modal.querySelector('#mediaCategory');
        if (isImage) {
            categorySelect.value = '1';
        } else if (isVideo) {
            categorySelect.value = '2';
        }
    }

    validateFile(file) {
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'video/mp4', 'video/webm', 'video/mov'
        ];
        const maxFileSize = 50 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            alert('지원하지 않는 파일 형식입니다.\n허용 형식: JPG, PNG, GIF, MP4, WebM');
            return false;
        }

        if (file.size > maxFileSize) {
            alert('파일 크기가 너무 큽니다.\n최대 크기: 50MB');
            return false;
        }

        return true;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 파일 업로드 처리 (분리된 함수)
    async uploadMediaFile(form, modal) {
        try {
            const submitBtn = form.querySelector('#fileUploadSubmitBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '업로드 중...';

            const formData = new FormData(form);
            
            const tagsInput = formData.get('tags');
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            formData.set('tags', JSON.stringify(tags));
            formData.set('user_id', this.currentUser.id);

            const response = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.showSuccessMessage('미디어가 성공적으로 업로드되었습니다!');
                modal.remove();
                
                await this.loadUserMediaItems();
                await this.loadMediaItems(true);
            } else {
                const error = await response.json();
                throw new Error(error.error || '업로드 실패');
            }
        } catch (error) {
            console.error('파일 업로드 오류:', error);
            alert('업로드 중 오류가 발생했습니다: ' + error.message);
        } finally {
            const submitBtn = form.querySelector('#fileUploadSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '업로드';
            }
        }
    }

    // 수정된 URL 업로드 처리 함수
    async uploadMediaUrl(form, modal) {
        try {
            const submitBtn = form.querySelector('#urlUploadSubmitBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '업로드 중...';

            const url = form.querySelector('#mediaUrl').value.trim();
            const category_id = form.querySelector('#urlMediaCategory').value;
            const title = form.querySelector('#urlMediaTitle').value.trim();
            const description = form.querySelector('#urlMediaDescription').value.trim();
            const tagsInput = form.querySelector('#urlMediaTags').value.trim();

            if (!url || !category_id || !title) {
                alert('URL, 카테고리, 제목을 모두 입력해주세요.');
                return;
            }

            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

            const response = await fetch('/api/media/upload-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    category_id: category_id,
                    title: title,
                    description: description,
                    tags: tags,
                    user_id: this.currentUser.id
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.showSuccessMessage('URL 미디어가 성공적으로 업로드되었습니다!');
                modal.remove();
                
                await this.loadUserMediaItems();
                await this.loadMediaItems(true);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'URL 업로드 실패');
            }
        } catch (error) {
            console.error('URL 업로드 오류:', error);
            alert('URL 업로드 중 오류가 발생했습니다: ' + error.message);
        } finally {
            const submitBtn = form.querySelector('#urlUploadSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '업로드';
            }
        }
    }

    // 수정된 내 미디어 보기 - 실제 업로드된 미디어 목록 표시
    showMyMedia() {
        if (!this.currentUser) {
            alert('내 미디어를 보려면 로그인이 필요합니다.');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';

        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>📁 내가 업로드한 미디어</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="myMediaGrid" class="media-gallery" style="max-height: 60vh; overflow-y: auto;">
                        <div class="loading-placeholder" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
                            <p>내 미디어를 불러오는 중...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.renderMyMedia();
    }

    // 수정된 renderMyMedia - userMediaItems 사용
    renderMyMedia() {
        const grid = document.getElementById('myMediaGrid');
        if (!grid) return;
        
        if (this.userMediaItems.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📷</div>
                    <p>아직 업로드한 미디어가 없습니다.</p>
                    <button class="btn btn-primary" onclick="mediaManager.showUploadModal(); this.closest('.modal').remove();" style="margin-top: 1rem;">
                        첫 미디어 업로드하기
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        this.userMediaItems.forEach(item => {
            const element = this.createMyMediaElement(item);
            grid.appendChild(element);
        });
    }

    // 수정된 createMyMediaElement - 실제 이미지 표시
    createMyMediaElement(item) {
        const element = document.createElement('div');
        element.className = 'media-item my-media-item';
        element.dataset.mediaId = item.media_id;

        const isVideo = item.file_type === 'video';
        const isYouTube = item.mime_type === 'video/youtube' || item.file_url.includes('youtube.com/embed');
        const isVimeo = item.mime_type === 'video/vimeo' || item.file_url.includes('player.vimeo.com');
        const imageUrl = item.file_url || `/uploads/media/${item.file_name}`;

        element.innerHTML = `
            <div class="media-thumbnail" style="position: relative;">
                ${isYouTube || isVimeo ? 
                    `<div style="position: relative; width: 100%; height: 150px; border-radius: 8px; overflow: hidden;">
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src="${item.file_url}" 
                            frameborder="0" 
                            allowfullscreen
                            style="border-radius: 8px;"
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                        </iframe>
                     </div>` :
                    isVideo ? 
                    `<div style="position: relative;">
                        <img src="${imageUrl}" alt="${item.title}" 
                             style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="video-placeholder" style="display: none; width: 100%; height: 150px; background: #f0f0f0; border-radius: 8px; align-items: center; justify-content: center; flex-direction: column;">
                            <span style="font-size: 2rem;">🎥</span>
                            <span style="color: #666; font-size: 0.8rem;">${item.title}</span>
                        </div>
                     </div>` :
                    `<img src="${imageUrl}" alt="${item.title}" 
                          style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;"
                          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="image-placeholder" style="display: none; width: 100%; height: 150px; background: #f0f0f0; border-radius: 8px; align-items: center; justify-content: center; flex-direction: column;">
                         <span style="font-size: 2rem;">${this.getCategoryIcon(item.category_code)}</span>
                         <span style="color: #666; font-size: 0.8rem;">${item.title}</span>
                     </div>`
                }
                <div class="media-controls" style="
                    position: absolute; top: 0.5rem; right: 0.5rem; 
                    display: flex; gap: 0.3rem; opacity: 0; transition: opacity 0.3s ease;
                ">
                    <button onclick="mediaManager.editMedia(${item.media_id}); event.stopPropagation();" 
                            style="background: rgba(0,0,0,0.7); color: white; border: none; padding: 0.3rem; border-radius: 3px; cursor: pointer;">✏️</button>
                    <button onclick="mediaManager.deleteMedia(${item.media_id}); event.stopPropagation();" 
                            style="background: rgba(255,0,0,0.7); color: white; border: none; padding: 0.3rem; border-radius: 3px; cursor: pointer;">🗑️</button>
                </div>
            </div>
            <div class="media-info">
                <h4 class="media-title">${this.escapeHtml(item.title)}</h4>
                <p class="media-description">${this.escapeHtml(item.description || '').substring(0, 80)}${item.description && item.description.length > 80 ? '...' : ''}</p>
                <div class="media-stats" style="margin-top: 0.5rem; display: flex; gap: 1rem; font-size: 0.8rem; color: #666;">
                    <span>👁 ${item.views?.toLocaleString() || '0'}</span>
                    <span>❤️ ${item.likes?.toLocaleString() || '0'}</span>
                    <span>⬇️ ${item.downloads?.toLocaleString() || '0'}</span>
                </div>
            </div>
        `;

        element.addEventListener('mouseenter', () => {
            const controls = element.querySelector('.media-controls');
            if (controls) controls.style.opacity = '1';
        });

        element.addEventListener('mouseleave', () => {
            const controls = element.querySelector('.media-controls');
            if (controls) controls.style.opacity = '0';
        });

        return element;
    }

    // 미디어 편집
    editMedia(mediaId) {
        const item = this.userMediaItems.find(item => item.media_id == mediaId);
        if (!item) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>✏️ 미디어 편집</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editForm">
                        <div class="form-group">
                            <label class="form-label">현재 미디어</label>
                            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
                                <span style="font-size: 2rem;">${this.getCategoryIcon(item.category_code)}</span>
                                <p style="margin: 0.5rem 0 0 0; font-weight: 600;">${item.title}</p>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="editTitle" class="form-label">제목</label>
                            <input type="text" id="editTitle" value="${this.escapeHtml(item.title)}" required maxlength="200" class="form-input">
                        </div>
                        
                        <div class="form-group">
                            <label for="editDescription" class="form-label">설명</label>
                            <textarea id="editDescription" rows="4" class="form-input">${this.escapeHtml(item.description || '')}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="editTags" class="form-label">태그</label>
                            <input type="text" id="editTags" value="${item.tags ? item.tags.join(', ') : ''}" class="form-input">
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">취소</button>
                            <button type="submit" class="btn btn-primary">수정 완료</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#editForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updateMedia(mediaId, modal);
        });
    }

    async updateMedia(mediaId, modal) {
        const form = modal.querySelector('#editForm');
        const title = form.querySelector('#editTitle').value.trim();
        const description = form.querySelector('#editDescription').value.trim();
        const tagsInput = form.querySelector('#editTags').value.trim();

        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        try {
            const response = await fetch(`/api/media/items/${mediaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    description,
                    tags,
                    user_id: this.currentUser.id
                })
            });

            if (response.ok) {
                // 로컬 데이터 업데이트
                const itemIndex = this.userMediaItems.findIndex(item => item.media_id == mediaId);
                if (itemIndex !== -1) {
                    this.userMediaItems[itemIndex] = {
                        ...this.userMediaItems[itemIndex],
                        title,
                        description,
                        tags
                    };
                }
                
                this.showSuccessMessage('미디어 정보가 수정되었습니다!');
                modal.remove();
                this.renderMyMedia(); // 내 미디어 목록 새로고침
            } else {
                const error = await response.json();
                throw new Error(error.error || '수정 실패');
            }
        } catch (error) {
            console.error('수정 오류:', error);
            this.showError('수정 중 오류가 발생했습니다.');
        }
    }

    // 미디어 삭제
    deleteMedia(mediaId) {
        const item = this.userMediaItems.find(item => item.media_id == mediaId);
        if (!item) return;

        if (!confirm(`"${item.title}" 미디어를 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        this.performDelete(mediaId);
    }

    async performDelete(mediaId) {
        try {
            const response = await fetch(`/api/media/items/${mediaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: this.currentUser.id
                })
            });

            if (response.ok) {
                // 로컬 데이터에서 제거
                this.userMediaItems = this.userMediaItems.filter(item => item.media_id != mediaId);
                this.renderMyMedia(); // 내 미디어 목록 새로고침
                this.showSuccessMessage('미디어가 삭제되었습니다.');
            } else {
                const error = await response.json();
                throw new Error(error.error || '삭제 실패');
            }
        } catch (error) {
            console.error('삭제 오류:', error);
            this.showError('삭제 중 오류가 발생했습니다.');
        }
    }

    setupViewMode() {
        const viewModeSelect = document.getElementById('viewModeSelect');
        if (viewModeSelect) {
            viewModeSelect.addEventListener('change', (e) => {
                this.switchViewMode(e.target.value);
            });
        }
    }

    switchViewMode(mode) {
        const galleries = document.querySelectorAll('.media-gallery');
        
        galleries.forEach(gallery => {
            if (mode === 'list') {
                gallery.style.gridTemplateColumns = '1fr';
                gallery.querySelectorAll('.media-item').forEach(item => {
                    item.style.display = 'flex';
                    item.style.alignItems = 'center';
                    item.style.gap = '1rem';
                    
                    const thumbnail = item.querySelector('.media-thumbnail');
                    const info = item.querySelector('.media-info');
                    if (thumbnail && info) {
                        thumbnail.style.width = '120px';
                        thumbnail.style.height = '80px';
                        thumbnail.style.flexShrink = '0';
                        info.style.flex = '1';
                    }
                });
            } else {
                gallery.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
                gallery.querySelectorAll('.media-item').forEach(item => {
                    item.style.display = 'block';
                    item.style.gap = '';
                    
                    const thumbnail = item.querySelector('.media-thumbnail');
                    const info = item.querySelector('.media-info');
                    if (thumbnail && info) {
                        thumbnail.style.width = '';
                        thumbnail.style.height = '200px';
                        thumbnail.style.flexShrink = '';
                        info.style.flex = '';
                    }
                });
            }
        });
    }

    // 고급 검색 모달
    showAdvancedSearch() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>고급 검색</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="advancedSearchForm">
                        <div class="form-group">
                            <label class="form-label">검색어</label>
                            <input type="text" id="searchQuery" placeholder="제목, 설명, 태그에서 검색" class="form-input">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label class="form-label">카테고리</label>
                                <select id="searchCategory" class="form-input">
                                    <option value="">전체</option>
                                    <option value="screenshots">스크린샷</option>
                                    <option value="videos">동영상</option>
                                    <option value="artwork">아트워크</option>
                                    <option value="wallpapers">배경화면</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">정렬</label>
                                <select id="searchSort" class="form-input">
                                    <option value="newest">최신순</option>
                                    <option value="oldest">오래된순</option>
                                    <option value="popular">인기순</option>
                                    <option value="most_viewed">조회순</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">취소</button>
                            <button type="submit" class="btn btn-primary">검색</button>
                        </div>
                    </form>
                    
                    <div id="searchResults" style="margin-top: 2rem; display: none;">
                        <h4>검색 결과</h4>
                        <div class="search-results-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; max-height: 400px; overflow-y: auto;">
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#advancedSearchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.performAdvancedSearch(modal);
        });
    }

    performAdvancedSearch(modal) {
        const form = modal.querySelector('#advancedSearchForm');
        const query = form.querySelector('#searchQuery').value.trim().toLowerCase();
        const category = form.querySelector('#searchCategory').value;
        const sort = form.querySelector('#searchSort').value;

        let filteredItems = [...this.mediaItems];

        if (query) {
            filteredItems = filteredItems.filter(item => 
                item.title.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query)) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }

        if (category) {
            const categoryMapping = {
                'screenshots': 'screenshots',
                'videos': 'videos',
                'artwork': 'artwork',
                'wallpapers': 'wallpapers'
            };
            filteredItems = filteredItems.filter(item => item.category_code === categoryMapping[category]);
        }

        switch (sort) {
            case 'oldest':
                filteredItems.sort((a, b) => new Date(a.upload_date) - new Date(b.upload_date));
                break;
            case 'popular':
                filteredItems.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                break;
            case 'most_viewed':
                filteredItems.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            default:
                filteredItems.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
                break;
        }

        this.displaySearchResults(filteredItems, modal);
    }

    displaySearchResults(results, modal) {
        const resultsContainer = modal.querySelector('#searchResults');
        const resultsGrid = modal.querySelector('.search-results-grid');
        
        resultsContainer.style.display = 'block';
        
        if (results.length === 0) {
            resultsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #666;">
                    <span style="font-size: 2rem; display: block; margin-bottom: 1rem;">🔍</span>
                    <p>검색 조건에 맞는 미디어가 없습니다.</p>
                </div>
            `;
        } else {
            resultsGrid.innerHTML = '';
            results.slice(0, 20).forEach(item => {
                const element = this.createSearchResultElement(item);
                resultsGrid.appendChild(element);
            });
        }

        const resultsHeader = resultsContainer.querySelector('h4');
        resultsHeader.textContent = `검색 결과 (${results.length}개)`;
    }

    // 수정된 createSearchResultElement - 실제 이미지 표시
    createSearchResultElement(item) {
        const element = document.createElement('div');
        element.className = 'search-result-item';
        element.style.cssText = `
            background: white; border-radius: 8px; padding: 1rem; border: 1px solid #eee;
            cursor: pointer; transition: all 0.3s ease;
        `;

        const imageUrl = item.file_url || `/uploads/media/${item.file_name}`;

        element.innerHTML = `
            <div style="text-align: center; margin-bottom: 1rem;">
                <img src="${imageUrl}" alt="${item.title}" 
                     style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="icon-placeholder" style="display: none; height: 120px; background: #f0f0f0; border-radius: 6px; align-items: center; justify-content: center;">
                    <span style="font-size: 2rem;">${this.getCategoryIcon(item.category_code)}</span>
                </div>
            </div>
            <h5 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #333;">${this.escapeHtml(item.title)}</h5>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem; color: #666; line-height: 1.4;">
                ${this.escapeHtml(item.description || '').substring(0, 60)}${item.description && item.description.length > 60 ? '...' : ''}
            </p>
            <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: #999;">
                <span>${this.formatDate(item.upload_date)}</span>
                <span>${item.views || 0} 조회</span>
            </div>
        `;

        element.addEventListener('click', () => {
            modal.remove();
            this.openMediaDetailById(item.media_id);
        });

        return element;
    }

    // 미디어 통계 보기
    showMediaStats() {
        if (!this.currentUser) {
            alert('통계를 보려면 로그인이 필요합니다.');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';

        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>📊 미디어 통계</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <div class="stat-card" style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📷</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #333;" id="totalUploads">0</div>
                            <div style="color: #666;">총 업로드</div>
                        </div>
                        <div class="stat-card" style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">👁</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #333;" id="totalViews">0</div>
                            <div style="color: #666;">총 조회수</div>
                        </div>
                        <div class="stat-card" style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">❤️</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #333;" id="totalLikes">0</div>
                            <div style="color: #666;">총 좋아요</div>
                        </div>
                        <div class="stat-card" style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px; text-align: center;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⬇️</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #333;" id="totalDownloads">0</div>
                            <div style="color: #666;">총 다운로드</div>
                        </div>
                    </div>
                    
                    <div class="popular-media" style="margin-top: 2rem;">
                        <h4>인기 미디어 TOP 5</h4>
                        <div id="popularMediaList"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.loadUserStats();
    }

    loadUserStats() {
        const totalUploads = this.userMediaItems.length;
        const totalViews = this.userMediaItems.reduce((sum, item) => sum + (item.views || 0), 0);
        const totalLikes = this.userMediaItems.reduce((sum, item) => sum + (item.likes || 0), 0);
        const totalDownloads = this.userMediaItems.reduce((sum, item) => sum + (item.downloads || 0), 0);

        document.getElementById('totalUploads').textContent = totalUploads.toLocaleString();
        document.getElementById('totalViews').textContent = totalViews.toLocaleString();
        document.getElementById('totalLikes').textContent = totalLikes.toLocaleString();
        document.getElementById('totalDownloads').textContent = totalDownloads.toLocaleString();

        const popularItems = [...this.userMediaItems]
            .sort((a, b) => (b.views + b.likes * 2 + b.downloads) - (a.views + a.likes * 2 + a.downloads))
            .slice(0, 5);

        const popularList = document.getElementById('popularMediaList');
        if (popularItems.length === 0) {
            popularList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">아직 업로드한 미디어가 없습니다.</p>';
        } else {
            popularList.innerHTML = popularItems.map((item, index) => `
                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer;" onclick="mediaManager.openMediaDetailById(${item.media_id})">
                    <div style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${index + 1}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 0.3rem;">${this.escapeHtml(item.title)}</div>
                        <div style="font-size: 0.8rem; color: #666;">
                            조회 ${item.views?.toLocaleString() || '0'} · 좋아요 ${item.likes?.toLocaleString() || '0'}
                        </div>
                    </div>
                    <div style="text-align: center; color: #667eea; font-size: 1.5rem;">
                        ${this.getCategoryIcon(item.category_code)}
                    </div>
                </div>
            `).join('');
        }
    }

    // 디버깅을 위한 미디어 정보 확인 함수
    async debugMediaItem(mediaId) {
        try {
            const response = await fetch(`/api/debug/media/${mediaId}`);
            const debugInfo = await response.json();
            console.log('미디어 디버그 정보:', debugInfo);
            return debugInfo;
        } catch (error) {
            console.error('디버그 정보 로딩 실패:', error);
            return null;
        }
    }
}

// 전역 변수 선언
let mediaManagerInstance = null;

// 페이지 로드 완료시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 중복 초기화 방지
    if (window.mediaManager) {
        console.log('미디어 매니저가 이미 초기화되었습니다.');
        return;
    }

    try {
        console.log('미디어 페이지 초기화 시작');
        mediaManagerInstance = new MediaManager();
        window.mediaManager = mediaManagerInstance;
        
        setTimeout(() => {
            if (window.mediaManager && typeof window.mediaManager.setupViewMode === 'function') {
                window.mediaManager.setupViewMode();
            }
        }, 100);
        
        if (window.mediaManager && typeof window.mediaManager.checkUrlParams === 'function') {
            window.mediaManager.checkUrlParams();
        }

        console.log('미디어 매니저 초기화 완료');
    } catch (error) {
        console.error('미디어 매니저 초기화 오류:', error);
    }
});

// 전역 함수들 - 안전한 호출을 위한 검증 추가
window.toggleLike = function(mediaId, button) {
    if (window.mediaManager && typeof window.mediaManager.toggleLike === 'function') {
        window.mediaManager.toggleLike(mediaId, button);
    } else {
        console.error('mediaManager.toggleLike 함수를 찾을 수 없습니다.');
    }
};

window.downloadMedia = function(mediaId) {
    if (window.mediaManager && typeof window.mediaManager.downloadMedia === 'function') {
        window.mediaManager.downloadMedia(mediaId);
    } else {
        console.error('mediaManager.downloadMedia 함수를 찾을 수 없습니다.');
    }
};

window.shareMedia = function(mediaId) {
    if (window.mediaManager && typeof window.mediaManager.shareMedia === 'function') {
        window.mediaManager.shareMedia(mediaId);
    } else {
        console.error('mediaManager.shareMedia 함수를 찾을 수 없습니다.');
    }
};

window.addComment = function(mediaId) {
    if (window.mediaManager && typeof window.mediaManager.addComment === 'function') {
        window.mediaManager.addComment(mediaId);
    } else {
        console.error('mediaManager.addComment 함수를 찾을 수 없습니다.');
    }
};

// YouTube/Vimeo URL 변환 함수들 (클라이언트 사이드 - 누락된 기능 복원)
function convertYouTubeUrl(url) {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(youtubeRegex);
    
    if (match) {
        const videoId = match[1];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return null;
}

function convertVimeoUrl(url) {
    const vimeoRegex = /vimeo\.com\/(?:.*\/)?(\d+)/i;
    const match = url.match(vimeoRegex);
    
    if (match) {
        const videoId = match[1];
        return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return null;
}

// 키보드 단축키
document.addEventListener('keydown', function(e) {
    try {
        if (e.ctrlKey && e.key === 'u' && window.mediaManager && window.mediaManager.currentUser) {
            e.preventDefault();
            if (typeof window.mediaManager.showUploadModal === 'function') {
                window.mediaManager.showUploadModal();
            }
        }
    } catch (error) {
        console.error('키보드 단축키 처리 오류:', error);
    }
});

// CSS 스타일 동적 추가
try {
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        .file-drop-zone:hover {
            border-color: #667eea !important;
            background-color: #f0f4ff !important;
            transform: scale(1.02);
        }
        
        .my-media-item:hover .media-controls {
            opacity: 1 !important;
        }
        
        .search-result-item:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
            transform: translateY(-2px) !important;
        }
        
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }

        .modal-content {
            background: white;
            border-radius: 15px;
            max-width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .modal-content.large {
            max-width: 95vw;
            width: 1200px;
        }

        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            color: #666;
        }

        .modal-body {
            padding: 1.5rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
        }

        .form-input {
            width: 100%;
            padding: 0.8rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
        }

        .form-help {
            font-size: 0.8rem;
            color: #666;
            margin-top: 0.3rem;
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }

        .btn {
            padding: 0.8rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-secondary {
            background: #6c757d;
            color: white;
        }

        .btn-success {
            background: #28a745;
            color: white;
        }

        .btn-warning {
            background: #ffc107;
            color: #333;
        }

        .btn-info {
            background: #17a2b8;
            color: white;
        }

        .btn-dark {
            background: #343a40;
            color: white;
        }

        .media-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }

        .media-item {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .media-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .media-thumbnail {
            position: relative;
            height: 200px;
            overflow: hidden;
        }

        .media-info {
            padding: 1rem;
        }

        .media-title {
            margin: 0 0 0.5rem 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
        }

        .media-description {
            margin: 0 0 0.5rem 0;
            color: #666;
            font-size: 0.9rem;
            line-height: 1.4;
        }

        .media-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            color: #999;
        }

        .upload-mode-btn.active {
            background: #667eea !important;
            color: white !important;
        }

        @media (max-width: 768px) {
            .media-action-bar {
                flex-direction: column;
                gap: 1rem;
            }
            
            .action-buttons {
                width: 100%;
                justify-content: center;
            }
            
            .view-options {
                width: 100%;
                justify-content: center;
            }

            .modal-content {
                max-width: 95vw;
                margin: 1rem;
            }

            .media-gallery {
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
            }
        }
    `;

    if (document.head) {
        document.head.appendChild(additionalStyles);
    }
} catch (error) {
    console.error('CSS 스타일 추가 오류:', error);
}