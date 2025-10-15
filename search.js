// ==================== 查詢頁面 JavaScript ====================

// ==================== 頁面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
  initializePage();
});

function initializePage() {
  // 綁定事件監聽器
  bindEventListeners();
  
  // 檢查 URL 參數是否有電話號碼
  checkURLParams();
  
  // iOS Safari 滑動修復
  fixiOSScrolling();
}

// ==================== iOS Safari 滑動修復 ====================
function fixiOSScrolling() {
  // 檢測是否為 iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  if (isIOS) {
    // 修復 iOS 滑動問題
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // 防止輸入框聚焦時的跳動
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        // 輕微延遲後滾動到輸入框
        setTimeout(() => {
          this.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 300);
      });
      
      input.addEventListener('blur', function() {
        // 輸入完成後滾動到頂部
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      });
    });
    
    // 處理虛擬鍵盤
    let initialViewportHeight = window.innerHeight;
    
    window.addEventListener('resize', function() {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // 如果高度差異超過 150px，可能是虛擬鍵盤打開
      if (heightDifference > 150) {
        document.body.style.height = currentHeight + 'px';
      } else {
        document.body.style.height = 'auto';
      }
    });
  }
}

// ==================== 事件監聽器綁定 ====================
function bindEventListeners() {
  // 查詢表單提交事件
  document.getElementById('queryForm').addEventListener('submit', handleQuerySubmit);
  
  // 模態框點擊外部關閉事件
  document.getElementById('imageModal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeModal();
    }
  });
}

// ==================== 檢查 URL 參數 ====================
function checkURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const phone = urlParams.get('phone');
  
  if (phone) {
    document.getElementById('queryPhone').value = phone;
    // 自動執行查詢
    setTimeout(() => {
      document.getElementById('queryForm').dispatchEvent(new Event('submit'));
    }, 500);
  }
}

// ==================== 查詢表單提交處理 ====================
async function handleQuerySubmit(e) {
  e.preventDefault();
  
  const phone = document.getElementById('queryPhone').value.trim();
  
  // 驗證電話號碼
  if (!phone) {
    showError('請輸入電話號碼');
    return;
  }
  
  if (!/^[0-9]{10}$/.test(phone)) {
    showError('請輸入正確的10碼電話號碼');
    return;
  }
  
  // 隱藏所有結果區域
  hideAllCards();
  showCard('loadingCard');
  
  try {
    // 呼叫 API 查詢資料
    const result = await callAPI('query', { phone: phone });
    
    hideCard('loadingCard');
    
    if (result.success && result.data && result.data.length > 0) {
      displayResults(result.data);
    } else {
      showCard('noResultsCard');
    }
    
  } catch (error) {
    console.error('查詢錯誤:', error);
    hideCard('loadingCard');
    showError(error.message || CONFIG.MESSAGES.QUERY_ERROR);
  }
}

// ==================== 顯示查詢結果 ====================
function displayResults(records) {
  const recordsList = document.getElementById('recordsList');
  const resultCount = document.getElementById('resultCount');
  
  recordsList.innerHTML = '';
  resultCount.textContent = `${records.length} 筆紀錄`;
  
  records.forEach((record, index) => {
    const recordCard = document.createElement('div');
    recordCard.className = 'record-card';
    recordCard.innerHTML = createRecordCardHTML(record, index);
    recordsList.appendChild(recordCard);
  });
  
  showCard('resultsSection');
}

// ==================== 建立紀錄卡片 HTML ====================
function createRecordCardHTML(record, index) {
  return `
    <div class="flex justify-between items-start mb-3">
      <span class="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
        <i class="fas fa-file-alt"></i> ${record.recordId}
      </span>
      <span class="text-xs text-gray-500">
        ${record.uploadTime}
      </span>
    </div>
    
    <div class="space-y-2 mb-4">
      <div class="flex items-center">
        <span class="text-gray-600 font-semibold w-16 flex-shrink-0"><i class="fas fa-user"></i></span>
        <span class="text-gray-800">${record.name}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-600 font-semibold w-16 flex-shrink-0"><i class="fas fa-phone"></i></span>
        <span class="text-gray-800">${record.phone}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-600 font-semibold w-16 flex-shrink-0"><i class="fas fa-envelope"></i></span>
        <span class="text-gray-800">${record.email || '未提供'}</span>
      </div>
      <div class="flex items-start">
        <span class="text-gray-600 font-semibold w-16 flex-shrink-0"><i class="fas fa-home"></i></span>
        <span class="text-gray-800">${record.fullAddress}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-600 font-semibold w-16 flex-shrink-0"><i class="fas fa-camera"></i></span>
        <span class="text-gray-800">${record.imageCount} 張照片</span>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-2">
      <button onclick="viewImages('${record.folderId}', '${record.fullAddress}')" 
              class="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all">
        <i class="fas fa-eye"></i> 查看照片
      </button>
      <button onclick="downloadZip('${record.folderId}', '${record.recordId}')" 
              class="bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 active:bg-gray-800 transition-all">
        <i class="fas fa-download"></i> 下載
      </button>
    </div>
  `;
}

// ==================== 查看照片 ====================
window.viewImages = async function(folderId, address) {
  const modal = document.getElementById('imageModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  
  // 設定標題和載入畫面
  modalTitle.innerHTML = `<i class="fas fa-images"></i> ${address}`;
  modalContent.innerHTML = createLoadingHTML();
  modal.classList.remove('hidden');
  
  try {
    const images = await callAPI('getImages', { folderId: folderId });
    
    // 檢查回應格式
    let imageList = images;
    if (images && typeof images === 'object' && images.length === undefined) {
      // 如果是包裝過的物件，提取實際的陣列
      imageList = images.data || images;
    }
    
    if (!imageList || imageList.length === 0) {
      modalContent.innerHTML = '<p class="text-center text-gray-600 py-8">此紀錄沒有照片</p>';
      return;
    }
    
    // 創建照片容器
    const grid = document.createElement('div');
    grid.className = 'space-y-4';
    
    // 載入所有照片的 Promise 陣列
    const loadPromises = imageList.map(async (image, i) => {
      try {
        const result = await callAPI('getImageBase64', { fileId: image.id });
        
        if (result.success) {
          return {
            success: true,
            html: createImageHTML(result.data, i + 1, image.name),
            index: i
          };
        } else {
          return {
            success: false,
            html: `<div class="card p-3 bg-red-50"><p class="text-red-600 text-center">載入圖片失敗: ${image.name}</p></div>`,
            index: i
          };
        }
      } catch (error) {
        console.error(`載入圖片 ${image.id} 失敗:`, error);
        return {
          success: false,
          html: `<div class="card p-3 bg-red-50"><p class="text-red-600 text-center">載入圖片失敗: ${image.name}</p></div>`,
          index: i
        };
      }
    });
    
    // 等待所有照片載入完成
    const results = await Promise.all(loadPromises);
    
    // 按順序顯示照片
    results.sort((a, b) => a.index - b.index).forEach(result => {
      const imgDiv = document.createElement('div');
      imgDiv.className = result.success ? 'card p-3' : '';
      imgDiv.innerHTML = result.html;
      grid.appendChild(imgDiv);
    });
    
    // 一次性更新內容
    modalContent.innerHTML = '';
    modalContent.appendChild(grid);
    
  } catch (error) {
    console.error('載入照片列表失敗:', error);
    modalContent.innerHTML = `<p class="text-center text-red-600 py-8">載入失敗：${error.message}</p>`;
  }
};

// ==================== 建立載入中 HTML ====================
function createLoadingHTML() {
  return `
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">載入照片中...</p>
      <p class="mt-2 text-sm text-gray-500">請稍候，正在處理圖片資料</p>
    </div>
  `;
}

// ==================== 建立圖片 HTML ====================
function createImageHTML(imageSrc, index, imageName) {
  return `
    <div class="relative">
      <img src="${imageSrc}" class="w-full h-64 object-cover rounded-lg cursor-pointer" 
           onclick="openImageFullscreen('${imageSrc}', '${imageName}')">
      <div class="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">
        ${index}
      </div>
      <div class="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        點擊放大
      </div>
    </div>
    <p class="mt-2 text-sm text-gray-600 truncate">${imageName}</p>
  `;
}

// ==================== 開啟圖片全螢幕檢視 ====================
window.openImageFullscreen = function(imageSrc, imageName) {
  const fullscreenDiv = document.createElement('div');
  fullscreenDiv.className = 'fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4';
  fullscreenDiv.innerHTML = `
    <div class="relative max-w-full max-h-full">
      <img src="${imageSrc}" class="max-w-full max-h-full object-contain">
      <button onclick="this.parentElement.parentElement.remove()" 
              class="absolute top-4 right-4 bg-white bg-opacity-20 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-30 transition-colors">
        ×
      </button>
      <div class="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
        ${imageName}
      </div>
    </div>
  `;
  
  // 點擊背景關閉
  fullscreenDiv.addEventListener('click', function(e) {
    if (e.target === this) {
      this.remove();
    }
  });
  
  document.body.appendChild(fullscreenDiv);
};

// ==================== 關閉模態框 ====================
window.closeModal = function() {
  document.getElementById('imageModal').classList.add('hidden');
};

// ==================== 下載 ZIP ====================
window.downloadZip = async function(folderId, recordId) {
  const adminKey = prompt('請輸入管理員密鑰：');
  if (!adminKey) return;
  
  try {
    showCard('loadingCard');
    
    const result = await callAPI('downloadZip', { 
      folderId: folderId, 
      adminKey: adminKey 
    });
    
    hideCard('loadingCard');
    
    if (result.success) {
      // 建立下載連結
      const link = document.createElement('a');
      link.href = `data:application/zip;base64,${result.data}`;
      link.download = `${recordId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('下載成功！');
    } else {
      showError(result.message || '下載失敗');
    }
    
  } catch (error) {
    console.error('下載錯誤:', error);
    hideCard('loadingCard');
    showError('下載失敗：' + error.message);
  }
};

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
  hideCard('resultsSection');
  hideCard('noResultsCard'); 
  hideCard('errorCard');
  hideCard('loadingCard');
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

// ==================== 除錯用函數 ====================
function debugSearch() {
  console.log('=== 查詢頁面除錯資訊 ===');
  console.log('當前查詢電話:', document.getElementById('queryPhone').value);
  console.log('URL 參數:', new URLSearchParams(window.location.search).toString());
}

// 在開發模式下提供除錯功能
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debugSearch = debugSearch;
}