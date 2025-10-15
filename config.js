// ==================== 系統設定檔 ====================
// 請將此檔案中的設定改為您的實際值

// Google Apps Script 網路應用程式網址
// 請將 'YOUR_SCRIPT_URL_HERE' 替換為您的實際 Google Apps Script 部署網址
const CONFIG = {
  // 您的 Google Apps Script 網址
  API_URL: 'https://script.google.com/macros/s/AKfycbwbAUhIk79pyXKu3t6Hmma-T9G8ZVud5aV_t6R7uwUY_XfJlrqbzt4muX3P9-MO8SkhyA/exec',
  
  // 系統設定
  MAX_IMAGES: 5,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  
  // 村里選項
  VILLAGES: [
    '大安村', '大華村', '大平村', '大馬村', 
    '大同村', '東富村', '北富村'
  ],
  
  // 系統訊息
  MESSAGES: {
    UPLOAD_SUCCESS: '資料上傳成功！',
    UPLOAD_ERROR: '上傳失敗，請稍後再試',
    QUERY_SUCCESS: '查詢完成',
    QUERY_ERROR: '查詢失敗，請稍後再試',
    NO_RESULTS: '查無相關資料',
    CONFIG_ERROR: '系統設定錯誤，請聯絡管理員'
  }
};

// ==================== 設定檔檢查 ====================
function checkConfig() {
  if (CONFIG.API_URL === 'YOUR_SCRIPT_URL_HERE') {
    console.warn('⚠️ 請先設定 Google Apps Script 網址');
    return false;
  }
  return true;
}

// ==================== API 呼叫函數 ====================
async function callAPI(action, data) {
  if (!checkConfig()) {
    throw new Error('系統設定錯誤：請先設定 Google Apps Script 網址');
  }

  try {
    const formData = new FormData();
    formData.append('action', action);
    
    // 將資料加入 FormData
    if (data) {
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
          data[key].forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else {
          formData.append(key, data[key]);
        }
      });
    }

    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('API 呼叫錯誤:', error);
    throw error;
  }
}

// ==================== API 呼叫都使用 callAPI 函數 ====================
// 所有 API 呼叫現在直接使用 callAPI 函數，避免重複定義

// ==================== 工具函數 ====================

// 檢查檔案類型
function isValidImageType(file) {
  return CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type);
}

// 檢查檔案大小
function isValidFileSize(file) {
  return file.size <= CONFIG.MAX_FILE_SIZE;
}

// 轉換檔案為 Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 格式化檔案大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 隱藏設定警告
function hideConfigWarning() {
  const warning = document.getElementById('configWarning');
  if (warning) {
    warning.style.display = 'none';
  }
  localStorage.setItem('configWarningHidden', 'true');
}

// 頁面載入時檢查是否要顯示設定警告
document.addEventListener('DOMContentLoaded', function() {
  const warningHidden = localStorage.getItem('configWarningHidden');
  const configValid = checkConfig();
  
  if (configValid || warningHidden === 'true') {
    hideConfigWarning();
  }
});

// ==================== 除錯用函數 ====================
function debugConfig() {
  console.log('=== 系統設定資訊 ===');
  console.log('API URL:', CONFIG.API_URL);
  console.log('設定檢查:', checkConfig());
  console.log('最大圖片數量:', CONFIG.MAX_IMAGES);
  console.log('最大檔案大小:', formatFileSize(CONFIG.MAX_FILE_SIZE));
  console.log('支援的圖片格式:', CONFIG.ALLOWED_IMAGE_TYPES);
}

// 在開發模式下自動顯示設定資訊
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  debugConfig();
}
