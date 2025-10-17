// 全局状态
let currentCardData = null;
let avatarDataUrl = null;

// DOM 元素
const elements = {
    cardForm: document.getElementById('cardForm'),
    avatarInput: document.getElementById('avatar'),
    avatarPreview: document.getElementById('avatarPreview'),
    nameInput: document.getElementById('name'),
    phoneInput: document.getElementById('phone'),
    emailInput: document.getElementById('email'),
    homepageInput: document.getElementById('homepage'),
    githubInput: document.getElementById('github'),
    xInput: document.getElementById('x'),
    bioInput: document.getElementById('bio'),
    themeSelect: document.getElementById('theme'),
    cardPreview: document.getElementById('cardPreview'),
    downloadSection: document.getElementById('downloadSection'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    submitBtn: document.querySelector('.btn-primary'),
    toast: document.getElementById('toast')
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    setupAvatarPreview();
});

// 事件监听器初始化
function initializeEventListeners() {
    // 表单提交
    elements.cardForm.addEventListener('submit', handleFormSubmit);

    // 重置按钮
    elements.resetBtn.addEventListener('click', resetForm);

    // 下载按钮
    elements.downloadBtn.addEventListener('click', downloadCard);

    // 头像变化监听
    elements.avatarInput.addEventListener('change', handleAvatarChange);

    // 实时预览
    const inputs = [
        elements.nameInput, elements.phoneInput, elements.emailInput,
        elements.homepageInput, elements.githubInput, elements.xInput,
        elements.bioInput, elements.themeSelect
    ];

    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', debounce(updatePreview, 300));
            input.addEventListener('change', updatePreview);
        }
    });
}

// 设置头像预览
function setupAvatarPreview() {
    elements.avatarPreview.addEventListener('click', () => {
        elements.avatarInput.click();
    });
}

// 处理头像变化
function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            avatarDataUrl = e.target.result;
            updateAvatarPreview(avatarDataUrl);
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

// 更新头像预览
function updateAvatarPreview(dataUrl) {
    elements.avatarPreview.innerHTML = `<img src="${dataUrl}" alt="头像预览">`;
    elements.avatarPreview.classList.add('has-image');
}

// 防抖函数
function debounce(func, wait) {
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

// 获取表单数据
function getFormData() {
    return {
        avatar: avatarDataUrl,
        name: elements.nameInput.value.trim(),
        phone: elements.phoneInput.value.trim(),
        email: elements.emailInput.value.trim(),
        homepage: elements.homepageInput.value.trim(),
        github: elements.githubInput.value.trim(),
        x: elements.xInput.value.trim(),
        bio: elements.bioInput.value.trim(),
        theme: elements.themeSelect.value
    };
}

// 验证表单数据
function validateFormData(data) {
    const errors = [];

    if (!data.name) {
        errors.push('姓名是必填项');
    }

    if (data.email && !isValidEmail(data.email)) {
        errors.push('邮箱格式不正确');
    }

    if (data.homepage && !isValidUrl(data.homepage)) {
        errors.push('个人主页链接格式不正确');
    }

    return errors;
}

// 邮箱验证
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// URL验证
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// 处理表单提交
async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = getFormData();
    const errors = validateFormData(formData);

    if (errors.length > 0) {
        showToast(errors.join(', '), 'error');
        return;
    }

    currentCardData = formData;

    // 显示加载状态
    setLoading(true);

    try {
        // 模拟API调用（实际项目中替换为真实API）
        await simulateApiCall();

        // 生成预览
        generateCardPreview(formData);

        // 显示下载区域
        elements.downloadSection.style.display = 'block';

        showToast('名片生成成功！', 'success');
    } catch (error) {
        showToast('生成失败，请重试', 'error');
    } finally {
        setLoading(false);
    }
}

// 模拟API调用
function simulateApiCall() {
    return new Promise(resolve => {
        setTimeout(resolve, 1000);
    });
}

// 生成名片预览
function generateCardPreview(data) {
    const themeClass = `theme-${data.theme}`;

    const cardHTML = `
        <div class="card-preview ${themeClass}">
            ${data.avatar ? `<img src="${data.avatar}" alt="${data.name}" class="card-avatar">` : ''}
            <h3 class="card-name">${escapeHtml(data.name || '姓名')}</h3>
            <p class="card-bio">${escapeHtml(data.bio || '这个人很懒，什么都没写')}</p>

            <div class="card-contacts">
                ${data.phone ? `
                <div class="card-contact-item">
                    <span class="card-contact-icon">📱</span>
                    <span>${escapeHtml(data.phone)}</span>
                </div>` : ''}

                ${data.email ? `
                <div class="card-contact-item">
                    <span class="card-contact-icon">📧</span>
                    <span>${escapeHtml(data.email)}</span>
                </div>` : ''}

                ${data.homepage ? `
                <div class="card-contact-item">
                    <span class="card-contact-icon">🌐</span>
                    <a href="${escapeHtml(data.homepage)}" target="_blank" style="color: inherit; text-decoration: none;">
                        ${escapeHtml(data.homepage)}
                    </a>
                </div>` : ''}
            </div>

            ${(data.github || data.x) ? `
            <div class="card-social-links">
                ${data.github ? `
                <a href="https://github.com/${escapeHtml(data.github)}" target="_blank"
                   class="card-social-link" title="GitHub">
                    <span>🐙</span>
                </a>` : ''}

                ${data.x ? `
                <a href="https://twitter.com/${escapeHtml(data.x.replace('@', ''))}" target="_blank"
                   class="card-social-link" title="X (Twitter)">
                    <span>🐦</span>
                </a>` : ''}
            </div>` : ''}
        </div>
    `;

    elements.cardPreview.innerHTML = cardHTML;
}

// 更新预览（实时）
function updatePreview() {
    const formData = getFormData();

    if (!formData.name) {
        return;
    }

    generateCardPreview(formData);
}

// 设置加载状态
function setLoading(loading) {
    elements.submitBtn.disabled = loading;
    const btnText = elements.submitBtn.querySelector('.btn-text');
    const btnLoading = elements.submitBtn.querySelector('.btn-loading');

    if (loading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
    } else {
        btnText.style.display = 'inline-block';
        btnLoading.style.display = 'none';
    }
}

// 下载名片
async function downloadCard() {
    if (!currentCardData) {
        showToast('请先生成名片', 'error');
        return;
    }

    try {
        setLoading(true);

        // 使用html2canvas将预览转换为图片
        const canvas = await html2canvas(elements.cardPreview.querySelector('.card-preview'), {
            backgroundColor: null,
            scale: 2,
            logging: false
        });

        // 转换为blob并下载
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentCardData.name}_名片.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('名片下载成功！', 'success');
        }, 'image/png');

    } catch (error) {
        // 如果html2canvas不可用，使用备用方案
        downloadCardFallback();
    } finally {
        setLoading(false);
    }
}

// 备用下载方案
function downloadCardFallback() {
    // 简单的文本信息下载
    const textContent = `
姓名: ${currentCardData.name}
电话: ${currentCardData.phone || '未提供'}
邮箱: ${currentCardData.email || '未提供'}
个人主页: ${currentCardData.homepage || '未提供'}
GitHub: ${currentCardData.github || '未提供'}
X(Twitter): ${currentCardData.x || '未提供'}
个人简介: ${currentCardData.bio || '未提供'}
主题: ${currentCardData.theme}
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCardData.name}_名片.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('名片信息已下载（文本格式）', 'info');
}

// 重置表单
function resetForm() {
    elements.cardForm.reset();
    elements.avatarPreview.innerHTML = '<span>选择头像图片</span>';
    elements.avatarPreview.classList.remove('has-image');
    elements.cardPreview.innerHTML = `
        <div class="preview-placeholder">
            <div class="preview-icon">📇</div>
            <p>填写表单后，这里将显示名片预览</p>
        </div>
    `;
    elements.downloadSection.style.display = 'none';

    currentCardData = null;
    avatarDataUrl = null;

    showToast('表单已重置', 'info');
}

// 显示提示消息
function showToast(message, type = 'info') {
    const toast = elements.toast;
    toast.textContent = message;
    toast.className = `toast ${type}`;

    // 显示toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // 3秒后隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 动态加载html2canvas（如果需要更好的图片下载功能）
function loadHtml2Canvas() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.onload = () => {
        console.log('html2canvas loaded successfully');
    };
    script.onerror = () => {
        console.warn('html2canvas failed to load, using fallback download method');
    };
    document.head.appendChild(script);
}

// 尝试加载html2canvas以提供更好的图片下载功能
loadHtml2Canvas();