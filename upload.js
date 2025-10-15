// ==================== 上傳頁面 JavaScript ====================

let selectedImages = [];

// ==================== 頁面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
  initializePage();
});

function initializePage() {
  updateAddressPreview();
  updateImageCount();
  
  // 綁定事件監聽器
  bindEventListeners();
  
  // 允許正常滾動
  // 移除了會阻止手機滾動的代碼
}

// ==================== 事件監聽器綁定 ====================
function bindEventListeners() {
  // 地址變更事件
  document.getElementById('village').addEventListener('change', updateAddressPreview);
  document.getElementById('neighborhood').addEventListener('input', updateAddressPreview);
  document.getElementById('address').addEventListener('input', updateAddressPreview);
  
  // 圖片選擇事件
  document.getElementById('imageInput').addEventListener('change', handleImageSelection);
  
  // 表單提交事件
  document.getElementById('uploadForm').addEventListener('submit', handleFormSubmit);
}

// ==================== 地址預覽更新 ====================
function updateAddressPreview() {
  const village = document.getElementById('village').value;
  const neighborhood = document.getElementById('neighborhood').value;
  const address = document.getElementById('address').value;
  
  let preview = '花蓮縣光復鄉';
  if (village) preview += village;
  if (neighborhood) preview += neighborhood + '鄰';
  if (address) preview += address;
  
  document.getElementById('fullAddressPreview').textContent = preview;
}

// ==================== 照片數量顯示更新 ====================
function updateImageCount() {
  const countElement = document.getElementById('imageCount');
  const numberElement = document.getElementById('imageCountNumber');
  
  if (selectedImages.length > 0) {
    countElement.classList.remove('hidden');
    numberElement.textContent = selectedImages.length;
  } else {
    countElement.classList.add('hidden');
  }
}

// ==================== 圖片選擇處理 ====================
function handleImageSelection(e) {
  const files = Array.from(e.target.files).slice(0, CONFIG.MAX_IMAGES);
  selectedImages = [];
  const previewContainer = document.getElementById('imagePreview');
  previewContainer.innerHTML = '';

  if (files.length === 0) {
    updateImageCount();
    return;
  }

  // 驗證檔案
  const validFiles = files.filter(file => {
    if (!isValidImageType(file)) {
      showError(`檔案 ${file.name} 不是支援的圖片格式`);
      return false;
    }
    if (!isValidFileSize(file)) {
      showError(`檔案 ${file.name} 太大，請選擇小於 ${formatFileSize(CONFIG.MAX_FILE_SIZE)} 的檔案`);
      return false;
    }
    return true;
  });

  if (validFiles.length === 0) {
    updateImageCount();
    return;
  }

  // 處理每個有效檔案
  validFiles.forEach((file, index) => {
    const reader = new FileReader();
    
    reader.onload = function(event) {
      selectedImages.push(event.target.result);
      
      const imgContainer = document.createElement('div');
      imgContainer.className = 'relative group';
      imgContainer.innerHTML = `
        <div class="card overflow-hidden">
          <img src="${event.target.result}" class="w-full h-32 object-cover">
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
          <div class="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
            ${index + 1}
          </div>
          <button type="button" onclick="removeImage(${index})" 
                  class="absolute top-2 left-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 active:bg-red-700 transition-colors shadow-lg">
            ×
          </button>
        </div>
        <p class="text-xs text-gray-600 mt-1 truncate px-1">${file.name}</p>
        <p class="text-xs text-gray-500 px-1">${formatFileSize(file.size)}</p>
      `;
      previewContainer.appendChild(imgContainer);
      updateImageCount();
    };
    
    reader.readAsDataURL(file);
  });
}

// ==================== 移除圖片 ====================
window.removeImage = function(index) {
  selectedImages.splice(index, 1);
  
  // 重新觸發 change 事件來更新預覽
  const imageInput = document.getElementById('imageInput');
  const dt = new DataTransfer();
  
  // 重新建立檔案列表（排除被移除的檔案）
  Array.from(imageInput.files).forEach((file, i) => {
    if (i !== index) {
      dt.items.add(file);
    }
  });
  
  imageInput.files = dt.files;
  imageInput.dispatchEvent(new Event('change', { bubbles: true }));
};

// ==================== 表單提交處理 ====================
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // 隱藏所有訊息卡片
  hideAllCards();
  
  // 顯示進度卡片
  showCard('progressCard');
  
  // 禁用提交按鈕
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.classList.add('opacity-50');
  submitBtn.innerHTML = '⏳ 上傳中...';
  
  try {
    // 驗證表單
    validateForm();
    
    // 更新進度
    updateProgress(10, '📋 驗證資料...');
    
    // 準備上傳資料
    updateProgress(30, '📦 準備上傳...');
    
    const uploadData = {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      village: document.getElementById('village').value,
      neighborhood: document.getElementById('neighborhood').value,
      address: document.getElementById('address').value,
      images: selectedImages
    };
    
    updateProgress(50, '☁️ 上傳中...');
    
    // 呼叫 API 上傳資料
    const result = await callAPI('upload', uploadData);
    
    updateProgress(100, '✅ 完成！');
    
    setTimeout(() => {
      hideCard('progressCard');
      
      if (result.success) {
        showCard('successCard');
        document.getElementById('recordIdDisplay').textContent = result.recordId;
      } else {
        showError(result.message || CONFIG.MESSAGES.UPLOAD_ERROR);
      }
      
      // 恢復提交按鈕
      resetSubmitButton();
      
    }, 1000);
    
  } catch (error) {
    console.error('上傳錯誤:', error);
    hideCard('progressCard');
    showError(error.message || CONFIG.MESSAGES.UPLOAD_ERROR);
    resetSubmitButton();
  }
}

// ==================== 表單驗證 ====================
function validateForm() {
  // 驗證基本資料
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const village = document.getElementById('village').value;
  const neighborhood = document.getElementById('neighborhood').value.trim();
  const address = document.getElementById('address').value.trim();
  
  if (!name) throw new Error('請填寫姓名');
  if (!phone) throw new Error('請填寫電話號碼');
  if (!/^[0-9]{10}$/.test(phone)) throw new Error('請輸入正確的10碼電話號碼');
  if (!village) throw new Error('請選擇村');
  if (!neighborhood) throw new Error('請填寫鄰');
  if (!address) throw new Error('請填寫詳細地址');
  
  // 驗證照片
  if (selectedImages.length === 0) {
    throw new Error('請至少上傳一張照片');
  }
  
  if (selectedImages.length > CONFIG.MAX_IMAGES) {
    throw new Error(`最多只能上傳 ${CONFIG.MAX_IMAGES} 張照片`);
  }
}

// ==================== 重設表單 ====================
function resetForm() {
  document.getElementById('uploadForm').reset();
  document.getElementById('imagePreview').innerHTML = '';
  selectedImages = [];
  updateImageCount();
  updateAddressPreview();
  hideAllCards();
}

window.resetForm = resetForm;

// ==================== 恢復提交按鈕 ====================
function resetSubmitButton() {
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = false;
  submitBtn.classList.remove('opacity-50');
  submitBtn.innerHTML = '🚀 送出資料';
}

// ==================== 顯示/隱藏卡片 ====================
function showCard(cardId) {
  const card = document.getElementById(cardId);
  if (card) {
    card.classList.remove('hidden');
    card.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }
}

function hideCard(cardId) {
  const card = document.getElementById(cardId);
  if (card) {
    card.classList.add('hidden');
  }
}

function hideAllCards() {
  hideCard('successCard');
  hideCard('errorCard');
  hideCard('progressCard');
}

// ==================== 顯示錯誤訊息 ====================
function showError(message) {
  document.getElementById('errorText').textContent = message;
  showCard('errorCard');
}

// ==================== 隱藏錯誤訊息 ====================
window.hideError = function() {
  hideCard('errorCard');
};

// ==================== 更新進度 ====================
function updateProgress(percent, text) {
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  if (progressBar) {
    progressBar.style.width = percent + '%';
    progressBar.textContent = percent + '%';
  }
  
  if (progressText) {
    progressText.textContent = text;
  }
}

// ==================== 除錯用函數 ====================
function debugUpload() {
  console.log('=== 上傳頁面除錯資訊 ===');
  console.log('已選擇圖片數量:', selectedImages.length);
  console.log('圖片檔案大小:', selectedImages.map(img => img.length));
  console.log('表單資料:', {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    village: document.getElementById('village').value,
    neighborhood: document.getElementById('neighborhood').value,
    address: document.getElementById('address').value
  });
}

// 在開發模式下提供除錯功能
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debugUpload = debugUpload;
}