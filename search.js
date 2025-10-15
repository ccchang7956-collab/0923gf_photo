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
    const result = await queryData(phone);
    
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
        📋 ${record.recordId}
      </span>
      <span class="text-xs text-gray-500">
        ${record.uploadTime}
      </span>
    </div>
    
    <div class="space-y-2 mb-4">
      <div class="flex items-center">
        <span class="text-gray-600 font-semibold w-16 flex-shrink-0">👤</span>
        <span class="text-gray-800">${record.name}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-600 font-semibold w-16 flex-shrink-0">📞</span>
        <span class="text-gray-800">${record.phone}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-600 font-semibold w-16 flex-shrink-0">📧</span>
        <span class="text-gray-800">${record.email || '未提供'}</span>
      </div>
      <div class="flex items-start">
        <span class="text-gray-600 font-semibold w-16 flex-shrink-0">🏠</span>
        <span class="text-gray-800">${record.fullAddress}</span>
      </div>
      <div class="flex items-center">
        <span class="text-gray-600 font-semibold w-16 flex-shrink-0">📸</span>
        <span class="text-gray-800">${record.imageCount} 張照片</span>
      </div>
    </div>
    
    <div class="grid grid-cols-2 gap-2">
      <button onclick="viewImages('${record.folderId}', '${record.fullAddress}')" 
              class="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-all">
        📸 查看照片
      </button>
      <button onclick="downloadZip('${record.folderId}', '${record.recordId}')" 
              class="bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 active:bg-gray-800 transition-all">
        📥 下載
      </button>
    </div>
  `;
}

// ==================== 查看照片 ====================
window.viewImages = async function(folderId, address) {
  const modal = document.getElementById('imageModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  
  modalTitle.textContent = `📸 ${address}`;
  modalContent.innerHTML = createLoadingHTML();
  modal.classList.remove('hidden');
  
  try {
    const images = await getImages(folderId);
    
    if (!images || images.length === 0) {
      modalContent.innerHTML = '<p class="text-center text-gray-600 py-8">此紀錄沒有照片</p>';
      return;
    }
    
    modalContent.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'space-y-4';
    
    // 逐一載入照片
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        const result = await getImageBase64(image.id);
        
        if (result.success) {
          const imgDiv = document.createElement('div');
          imgDiv.className = 'card p-3';
          imgDiv.innerHTML = createImageHTML(result.data, i + 1, image.name);
          grid.appendChild(imgDiv);
        }
      } catch (error) {
        console.error(`載入圖片 ${image.id} 失敗:`, error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'card p-3 bg-red-50';
        errorDiv.innerHTML = `<p class="text-red-600 text-center">載入圖片失敗: ${image.name}</p>`;
        grid.appendChild(errorDiv);
      }
    }
    
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
      <p class="mt-4 text-gray-600">載入中...</p>
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
    
    const result = await downloadZip(folderId, adminKey);
    
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