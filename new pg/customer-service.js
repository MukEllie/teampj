// customer-service.js - 고객센터 페이지 전용 JavaScript (안전한 수정 버전)

// 전역 변수
let currentUser = null;
let chatConnected = false;
let faqData = [];
let userInquiries = [];

// FAQ 데이터 (기존 호환성 유지하면서 서버 형식 지원)
const defaultFaqData = [
    {
        faq_id: 1,
        id: 1, // 기존 호환성 유지
        question: "게임을 처음 시작하는데 어떤 캐릭터를 선택해야 하나요?",
        answer: "초보자에게는 전사(Warrior) 클래스를 추천합니다. 높은 체력과 방어력으로 생존력이 뛰어나며, 조작이 비교적 간단합니다. 게임에 익숙해지면 마법사나 궁수 등 다른 클래스를 시도해보세요.",
        category: "gameplay",
        views: 1250,
        is_active: true
    },
    {
        faq_id: 2,
        id: 2,
        question: "갓챠에서 좋은 캐릭터를 뽑을 확률을 높이는 방법이 있나요?",
        answer: "갓챠는 완전한 확률 기반 시스템입니다. 다만, 이벤트 기간 중에는 특정 캐릭터의 출현 확률이 증가하니 이벤트를 잘 활용하시기 바랍니다. 또한 보장 시스템이 있어 일정 횟수 뽑으면 반드시 최고 등급 캐릭터를 획득할 수 있습니다.",
        category: "gameplay",
        views: 2340,
        is_active: true
    },
    {
        faq_id: 3,
        id: 3,
        question: "친구와 함께 멀티플레이를 하려면 어떻게 해야 하나요?",
        answer: "게임 내 친구 시스템을 통해 친구를 추가한 후, 파티 메뉴에서 초대할 수 있습니다. 친구 코드를 교환하거나 닉네임으로 검색하여 친구 추가가 가능합니다. 파티를 구성하면 함께 던전이나 레이드에 참여할 수 있습니다.",
        category: "gameplay",
        views: 890,
        is_active: true
    },
    {
        faq_id: 4,
        id: 4,
        question: "계정을 분실했을 때 복구할 수 있나요?",
        answer: "계정 복구는 가능합니다. 이메일이나 소셜 미디어 계정으로 연동하셨다면 해당 정보로 복구할 수 있습니다. 그렇지 않은 경우 고객센터에 문의하시면 게임 내 정보를 확인하여 복구를 도와드립니다.",
        category: "account",
        views: 1560,
        is_active: true
    },
    {
        faq_id: 5,
        id: 5,
        question: "게임이 느리거나 끊어질 때는 어떻게 해야 하나요?",
        answer: "먼저 인터넷 연결 상태를 확인해보세요. Wi-Fi보다는 안정적인 데이터 연결을 권장합니다. 또한 게임 설정에서 그래픽 옵션을 낮춰보시거나, 백그라운드 앱을 종료해보세요. 문제가 지속되면 게임을 재시작해보시기 바랍니다.",
        category: "bug",
        views: 3420,
        is_active: true
    },
    {
        faq_id: 6,
        id: 6,
        question: "업데이트는 언제 이루어지나요?",
        answer: "정기 업데이트는 매월 둘째 주에 진행됩니다. 긴급 버그 수정이나 이벤트 업데이트는 수시로 이루어질 수 있습니다. 업데이트 소식은 게임 내 공지사항과 공식 커뮤니티를 통해 미리 안내해드립니다.",
        category: "general",
        views: 780,
        is_active: true
    },
    {
        faq_id: 7,
        id: 7,
        question: "결제한 아이템이 지급되지 않았어요",
        answer: "결제 완료 후 아이템이 지급되지 않은 경우, 먼저 게임을 재시작해보세요. 여전히 지급되지 않는다면 결제 영수증과 함께 고객센터로 문의해주세요. 영업시간 내 빠른 처리를 도와드리겠습니다.",
        category: "payment",
        views: 2100,
        is_active: true
    },
    {
        faq_id: 8,
        id: 8,
        question: "닉네임을 변경하고 싶어요",
        answer: "닉네임 변경은 게임 내 설정 메뉴에서 가능합니다. 첫 번째 변경은 무료이며, 이후 변경 시에는 닉네임 변경권이 필요합니다. 변경권은 게임 내 상점에서 구매할 수 있습니다.",
        category: "account",
        views: 450,
        is_active: true
    }
];

// 현재 사용자 정보 가져오기 함수 (common-auth.js에서 제공되어야 함)
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        return null;
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// 페이지 초기화 - 기존 성능 유지
function initializePage() {
    // 사용자 정보 확인
    currentUser = getCurrentUser();
    
    // 기본 이벤트 리스너 설정
    setupEventListeners();
    
    // FAQ 데이터 로드 및 표시 (동기적으로 유지)
    loadFaqData();
    renderFaq();
    
    // 로그인된 사용자라면 문의 내역 표시
    if (currentUser) {
        loadUserInquiries();
        document.getElementById('inquiryHistorySection').style.display = 'block';
        
        // 사용자 이메일 자동 입력
        const emailField = document.getElementById('userEmail');
        if (emailField && currentUser.email) {
            emailField.value = currentUser.email;
        }
    }
    
    // 폼 자동완성
    setupFormAutofill();
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

    // 지원 카테고리 클릭
    document.querySelectorAll('.support-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            handleSupportCategoryClick(category);
        });
    });

    // 문의 폼 제출
    const inquiryForm = document.getElementById('inquiryForm');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', submitInquiry);
    }

    // 실시간 채팅 모달
    setupChatModal();

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

// FAQ 데이터 로드 - 기존 방식 유지하면서 에러 처리만 개선
function loadFaqData() {
    try {
        // 비동기 호출하되 성능에 영향주지 않게 처리
        fetch('/api/faq')
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('FAQ 로드 실패');
                }
            })
            .then(serverFaqData => {
                // 서버 데이터 정규화
                faqData = serverFaqData.sort((a, b) => b.views - a.views);
                renderFaq(); // 데이터 로드 완료 후 다시 렌더링
            })
            .catch(error => {
                console.error('FAQ 로드 실패:', error);
                // 기본 데이터 사용 (이미 초기화됨)
                faqData = defaultFaqData.sort((a, b) => b.views - a.views);
            });
    } catch (error) {
        console.error('FAQ 로드 실패:', error);
        faqData = defaultFaqData.sort((a, b) => b.views - a.views);
    }
}

// FAQ 렌더링 - 기존 호환성 유지
function renderFaq() {
    const faqList = document.getElementById('faqList');
    if (!faqList) return;
    
    faqList.innerHTML = faqData.map(faq => `
        <div class="faq-item" data-faq-id="${faq.faq_id || faq.id}">
            <button class="faq-question">
                <span>${escapeHtml(faq.question)}</span>
                <span class="faq-toggle">▼</span>
            </button>
            <div class="faq-answer">
                <p>${escapeHtml(faq.answer)}</p>
                <div class="faq-meta">
                    <span class="faq-views">조회수: ${faq.views}</span>
                </div>
            </div>
        </div>
    `).join('');

    // FAQ 아코디언 이벤트 리스너
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            const isActive = faqItem.classList.contains('active');
            
            // 모든 FAQ 아이템 비활성화
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // 클릭한 아이템만 활성화 (토글)
            if (!isActive) {
                faqItem.classList.add('active');
                
                // 조회수 증가
                const faqId = parseInt(faqItem.dataset.faqId);
                if (faqId) {
                    increaseFaqViews(faqId);
                }
            }
        });
    });
}

// FAQ 조회수 증가 - 기존 로직 유지하면서 에러 처리만 개선
function increaseFaqViews(faqId) {
    const faq = faqData.find(f => (f.faq_id || f.id) === faqId);
    if (faq) {
        // 로컬 조회수 즉시 업데이트
        faq.views++;
        
        // 조회수 화면 업데이트
        const faqItem = document.querySelector(`[data-faq-id="${faqId}"]`);
        if (faqItem) {
            const viewsElement = faqItem.querySelector('.faq-views');
            if (viewsElement) {
                viewsElement.textContent = `조회수: ${faq.views}`;
            }
        }
        
        // 서버에 조회수 업데이트 요청 (에러가 있어도 진행)
        try {
            fetch(`/api/faq/${faqId}/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).catch(error => {
                // 서버 업데이트 실패해도 사용자 경험에는 영향 없음
                console.warn('FAQ 조회수 서버 업데이트 실패:', error);
            });
        } catch (error) {
            console.warn('FAQ 조회수 업데이트 오류:', error);
        }
    }
}

// 지원 카테고리 클릭 처리
function handleSupportCategoryClick(category) {
    switch (category) {
        case 'faq':
            document.querySelector('.faq-section')?.scrollIntoView({ behavior: 'smooth' });
            break;
        case 'chat':
            openSupportChat();
            break;
        case 'email':
            document.querySelector('.contact-section')?.scrollIntoView({ behavior: 'smooth' });
            const inquiryType = document.getElementById('inquiryType');
            if (inquiryType) inquiryType.value = 'other';
            break;
        case 'bug':
            document.querySelector('.contact-section')?.scrollIntoView({ behavior: 'smooth' });
            const bugType = document.getElementById('inquiryType');
            if (bugType) bugType.value = 'bug';
            break;
        case 'account':
            document.querySelector('.contact-section')?.scrollIntoView({ behavior: 'smooth' });
            const accountType = document.getElementById('inquiryType');
            if (accountType) accountType.value = 'account';
            break;
        case 'guide':
            alert('게임 가이드 페이지로 이동합니다.\n(현재는 데모 버전입니다)');
            break;
        default:
            break;
    }
}

// 실시간 채팅 모달 설정
function setupChatModal() {
    const chatModal = document.getElementById('chatModal');
    const chatModalClose = document.getElementById('chatModalClose');
    const chatInput = document.getElementById('supportChatInput');
    const chatSend = document.getElementById('supportChatSend');

    if (chatModalClose) {
        chatModalClose.addEventListener('click', closeSupportChat);
    }
    
    // 모달 외부 클릭 시 닫기
    if (chatModal) {
        window.addEventListener('click', function(e) {
            if (e.target === chatModal) {
                closeSupportChat();
            }
        });
    }

    if (chatSend) {
        chatSend.addEventListener('click', sendChatMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
}

// 실시간 채팅 열기
function openSupportChat() {
    if (!currentUser) {
        alert('로그인 후 실시간 채팅을 이용할 수 있습니다.');
        window.location.href = '/login';
        return;
    }
    
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        chatModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // 채팅 연결 시뮬레이션
        setTimeout(() => {
            const chatStatus = document.getElementById('chatStatus');
            if (chatStatus) {
                chatStatus.textContent = '상담원 연결됨';
                chatStatus.className = 'status-indicator connected';
                chatConnected = true;
                
                // 상담원 인사 메시지
                addChatMessage('agent', `안녕하세요 ${currentUser.nickname || currentUser.id}님! 무엇을 도와드릴까요?`);
            }
        }, 2000);
    }
}

// 실시간 채팅 닫기
function closeSupportChat() {
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
        chatModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        chatConnected = false;
        
        // 채팅 상태 초기화
        const chatStatus = document.getElementById('chatStatus');
        if (chatStatus) {
            chatStatus.textContent = '연결 중...';
            chatStatus.className = 'status-indicator';
        }
    }
}

// 채팅 메시지 전송
function sendChatMessage() {
    const chatInput = document.getElementById('supportChatInput');
    if (!chatInput) return;
    
    const message = chatInput.value.trim();
    
    if (!message || !chatConnected) return;
    
    // 사용자 메시지 추가
    addChatMessage('user', message);
    chatInput.value = '';
    
    // 상담원 응답 시뮬레이션
    setTimeout(() => {
        const responses = [
            "네, 확인해보겠습니다. 잠시만 기다려주세요.",
            "해당 문제에 대해 도움을 드릴 수 있습니다.",
            "더 자세한 정보를 알려주시면 더 정확한 답변을 드릴 수 있습니다.",
            "이 문제는 일반적인 경우이니 걱정하지 마세요.",
            "추가로 궁금한 점이 있으시면 언제든 말씀해주세요."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage('agent', randomResponse);
    }, 1000 + Math.random() * 2000);
}

// 채팅 메시지 추가
function addChatMessage(sender, message) {
    const chatMessages = document.getElementById('supportChatMessages');
    if (!chatMessages) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}`;
    
    const currentTime = new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
        <div class="message-time">${currentTime}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 폼 자동완성 설정
function setupFormAutofill() {
    const inquiryType = document.getElementById('inquiryType');
    
    if (inquiryType) {
        inquiryType.addEventListener('change', function() {
            const type = this.value;
            const titleField = document.getElementById('inquiryTitle');
            const contentField = document.getElementById('inquiryContent');
            
            // 문의 유형에 따른 자동완성
            const templates = {
                bug: {
                    title: '[버그신고] ',
                    content: '발생한 버그 상황:\n\n재현 방법:\n1. \n2. \n3. \n\n기기 정보:\n- 운영체제: \n- 브라우저: \n- 게임 버전: '
                },
                account: {
                    title: '[계정문의] ',
                    content: '문의 내용:\n\n계정 정보:\n- 닉네임: \n- 가입 이메일: \n- 마지막 접속일: '
                },
                payment: {
                    title: '[결제문의] ',
                    content: '결제 관련 문의:\n\n결제 정보:\n- 결제 일시: \n- 결제 금액: \n- 구매 상품: \n- 결제 방법: '
                },
                gameplay: {
                    title: '[게임플레이] ',
                    content: '게임플레이 관련 문의:\n\n상세 내용:\n'
                },
                suggestion: {
                    title: '[건의사항] ',
                    content: '건의하고 싶은 내용:\n\n개선 방향:\n\n기대 효과:\n'
                }
            };
            
            if (templates[type]) {
                if (titleField && (!titleField.value || titleField.value.startsWith('['))) {
                    titleField.value = templates[type].title;
                }
                if (contentField && !contentField.value) {
                    contentField.value = templates[type].content;
                }
            }
        });
    }
}

// 문의 제출 - 기존 동작 유지하면서 필드명만 표준화
async function submitInquiry(e) {
    e.preventDefault();
    
    // DOM 요소 존재 확인
    const inquiryTypeEl = document.getElementById('inquiryType');
    const userEmailEl = document.getElementById('userEmail');
    const inquiryTitleEl = document.getElementById('inquiryTitle');
    const inquiryContentEl = document.getElementById('inquiryContent');
    const gameInfoEl = document.getElementById('gameInfo');
    const agreePrivacyEl = document.getElementById('agreePrivacy');
    
    if (!inquiryTypeEl || !userEmailEl || !inquiryTitleEl || !inquiryContentEl || !agreePrivacyEl) {
        alert('폼 요소를 찾을 수 없습니다. 페이지를 새로고침 해주세요.');
        return;
    }
    
    // 폼 데이터 수집 - 표준화된 필드명 사용
    const formData = {
        user_id: currentUser ? currentUser.id : null,
        user_email: userEmailEl.value.trim(),
        inquiry_type: inquiryTypeEl.value,
        title: inquiryTitleEl.value.trim(),
        content: inquiryContentEl.value.trim(),
        game_info: gameInfoEl ? gameInfoEl.value.trim() : '',
        agreePrivacy: agreePrivacyEl.checked
    };
    
    // 유효성 검사 - 기존 수준 유지
    if (!validateInquiryForm(formData)) {
        return;
    }
    
    // 로딩 상태 표시
    const submitBtn = document.getElementById('submitInquiry');
    const submitLoading = document.getElementById('submitLoading');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    
    if (submitBtn) {
        submitBtn.disabled = true;
    }
    if (submitLoading) {
        submitLoading.style.display = 'block';
    }
    if (btnText) {
        btnText.textContent = '전송 중...';
    }
    
    try {
        // API 호출
        const response = await fetch('/api/inquiries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccessMessage();
            const form = document.getElementById('inquiryForm');
            if (form) {
                form.reset();
            }
            
            // 사용자의 문의 내역 새로고침
            if (currentUser) {
                loadUserInquiries();
            }
        } else {
            throw new Error(result.error || '문의 전송에 실패했습니다.');
        }
        
    } catch (error) {
        console.error('문의 전송 오류:', error);
        alert('문의 전송 중 오류가 발생했습니다: ' + error.message);
    } finally {
        // 로딩 상태 해제
        if (submitBtn) {
            submitBtn.disabled = false;
        }
        if (submitLoading) {
            submitLoading.style.display = 'none';
        }
        if (btnText) {
            btnText.textContent = '문의하기';
        }
    }
}

// 문의 폼 유효성 검사 - 기존 수준 유지 (엄격하지 않게)
function validateInquiryForm(formData) {
    let isValid = true;
    
    // 에러 메시지 초기화
    clearFormErrors();
    
    // 문의 유형 검사
    if (!formData.inquiry_type || formData.inquiry_type === '') {
        showFieldError('inquiryType', '문의 유형을 선택해주세요.');
        isValid = false;
    }
    
    // 이메일 검사
    if (!formData.user_email || formData.user_email === '') {
        showFieldError('userEmail', '이메일 주소를 입력해주세요.');
        isValid = false;
    } else if (!isValidEmail(formData.user_email)) {
        showFieldError('userEmail', '올바른 이메일 형식을 입력해주세요.');
        isValid = false;
    }
    
    // 제목 검사 - 기존보다 관대하게
    if (!formData.title || formData.title === '') {
        showFieldError('inquiryTitle', '문의 제목을 입력해주세요.');
        isValid = false;
    }
    
    // 내용 검사 - 기존보다 관대하게
    if (!formData.content || formData.content === '') {
        showFieldError('inquiryContent', '문의 내용을 입력해주세요.');
        isValid = false;
    }
    
    // 개인정보 동의 검사
    if (!formData.agreePrivacy) {
        showFieldError('agreePrivacy', '개인정보 수집 및 이용에 동의해주세요.');
        isValid = false;
    }
    
    return isValid;
}

// 폼 에러 표시
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

// 폼 에러 초기화
function clearFormErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    const inputElements = document.querySelectorAll('.form-input, .form-textarea');
    
    errorElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    
    inputElements.forEach(el => {
        el.classList.remove('error');
    });
}

// 성공 메시지 표시 - 기존 방식 유지
function showSuccessMessage() {
    const successHtml = `
        <div class="success-modal" id="successModal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; justify-content: center; align-items: center;">
            <div class="success-content" style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 400px;">
                <div class="success-icon" style="font-size: 48px; margin-bottom: 20px;">✅</div>
                <h3 style="margin-bottom: 15px;">문의가 접수되었습니다!</h3>
                <p style="margin-bottom: 10px;">문의해주신 내용을 확인 후, 24시간 내에 답변을 드리겠습니다.</p>
                <p style="margin-bottom: 20px;">답변은 입력하신 이메일로 발송됩니다.</p>
                <button class="btn btn-primary" onclick="closeSuccessModal()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">확인</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHtml);
    document.body.style.overflow = 'hidden';
}

// 성공 모달 닫기
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = 'auto';
}

// 사용자 문의 내역 로드
function loadUserInquiries() {
    if (!currentUser) return;
    
    fetch(`/api/inquiries/user/${currentUser.id}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('문의 내역 로드 실패');
            }
        })
        .then(data => {
            userInquiries = data;
            renderUserInquiries();
        })
        .catch(error => {
            console.error('문의 내역 로드 실패:', error);
            userInquiries = getDemoInquiries();
            renderUserInquiries();
        });
}

// 사용자 문의 내역 렌더링
function renderUserInquiries() {
    const inquiryList = document.getElementById('inquiryList');
    if (!inquiryList) return;
    
    if (userInquiries.length === 0) {
        inquiryList.innerHTML = '<div class="no-inquiries">문의 내역이 없습니다.</div>';
        return;
    }
    
    inquiryList.innerHTML = userInquiries.map(inquiry => `
        <div class="inquiry-item ${inquiry.status}" data-inquiry-id="${inquiry.id}">
            <div class="inquiry-header">
                <div class="inquiry-title">${escapeHtml(inquiry.title)}</div>
                <div class="inquiry-status ${inquiry.status}">${getStatusText(inquiry.status)}</div>
            </div>
            <div class="inquiry-meta">
                <span class="inquiry-type">${getTypeText(inquiry.type)}</span>
                <span class="inquiry-date">${formatDate(new Date(inquiry.created_at))}</span>
            </div>
            <div class="inquiry-preview">
                ${escapeHtml(inquiry.content).substring(0, 100)}${inquiry.content.length > 100 ? '...' : ''}
            </div>
            ${inquiry.response ? `
                <div class="inquiry-response">
                    <div class="response-header">답변</div>
                    <div class="response-content">${escapeHtml(inquiry.response)}</div>
                    <div class="response-date">${formatDate(new Date(inquiry.response_date))}</div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 데모 문의 데이터
function getDemoInquiries() {
    return [
        {
            id: 1,
            title: '[버그신고] 게임이 로딩 중에 멈춤',
            content: '게임을 시작할 때 로딩 화면에서 진행이 안 됩니다. 브라우저를 여러 번 새로고침해도 같은 현상이 발생합니다.',
            type: 'bug',
            status: 'resolved',
            created_at: '2025-01-25T10:30:00Z',
            response: '안녕하세요. 신고해주신 버그가 수정되었습니다. 브라우저 캐시를 삭제한 후 다시 접속해보세요. 문제가 지속되면 다시 연락주세요.',
            response_date: '2025-01-25T14:20:00Z'
        },
        {
            id: 2,
            title: '[계정문의] 비밀번호 변경 방법',
            content: '비밀번호를 변경하고 싶은데 어떻게 해야 하나요?',
            type: 'account',
            status: 'pending',
            created_at: '2025-01-27T09:15:00Z',
            response: null,
            response_date: null
        }
    ];
}

// 유틸리티 함수들
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function formatDate(date) {
    if (!date) return '';
    try {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return date.toString();
    }
}

function getStatusText(status) {
    const statusMap = {
        pending: '답변 대기',
        processing: '처리 중',
        resolved: '해결 완료',
        closed: '종료'
    };
    return statusMap[status] || status;
}

function getTypeText(type) {
    const typeMap = {
        bug: '버그신고',
        account: '계정문의',
        payment: '결제관련',
        gameplay: '게임플레이',
        suggestion: '건의사항',
        other: '기타'
    };
    return typeMap[type] || type;
}

// 전역 함수로 노출 (HTML onclick에서 사용)
window.closeSuccessModal = closeSuccessModal;