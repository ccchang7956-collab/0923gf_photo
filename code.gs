// ==================== 設定區 ====================
// 請在這裡填入您的 Google 試算表 ID 和雲端硬碟資料夾 ID
const SPREADSHEET_ID = '14l5WC2mu51Sx0TC3905z9tv6tSHCxo70OywjO8GHrqE';
const DRIVE_FOLDER_ID = '1Q4ndsA9oDImzFKyeXM1OaWwwjN882DdlQxu-CQdApzrfHdN_1J1SDAf0_X0pZ4K-JMfDTjRl';
const ADMIN_EMAILS = ['admin@example.com']; // 管理員信箱列表

// ==================== 頁面路由 ====================
function doGet(e) {
  const page = e.parameter.page || 'input';
  const mobile = e.parameter.mobile === 'true' || isMobileDevice(e);
  
  if (page === 'input') {
    const template = mobile ? 'input_mobile' : 'input';
    return HtmlService.createHtmlOutputFromFile(template)
      .setTitle('災害通報系統')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else if (page === 'query') {
    const template = mobile ? 'query_mobile' : 'query';
    return HtmlService.createHtmlOutputFromFile(template)
      .setTitle('查詢系統')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  return HtmlService.createHtmlOutput('頁面不存在');
}

// 檢測是否為手機設備
function isMobileDevice(e) {
  const userAgent = e.parameter.userAgent || '';
  const mobileKeywords = ['Mobile', 'Android', 'iPhone', 'iPad', 'Windows Phone'];
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
}

// ==================== POST 處理 ====================
function doPost(e) {
  try {
    // 記錄接收到的參數（用於除錯）
    Logger.log('Received parameters: ' + JSON.stringify(e.parameter));
    
    const action = e.parameter.action;
    
    if (action === 'upload') {
      return handleUpload(e);
    } else if (action === 'query') {
      return handleQuery(e);
    } else if (action === 'downloadZip') {
      return handleDownloadZip(e);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: '無效的操作'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: '系統錯誤：' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== 上傳處理（供前端呼叫）====================
function submitUpload(data) {
  try {
    // 驗證必填欄位
    if (!data.name || !data.phone || !data.village || !data.neighborhood || !data.address) {
      return {
        success: false,
        message: '請填寫所有必填欄位'
      };
    }
    
    // 驗證照片
    if (!data.images || data.images.length === 0) {
      return {
        success: false,
        message: '請至少上傳一張照片'
      };
    }
    
    // 生成編號（時間戳記 + 隨機數）
    const recordId = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyyMMddHHmmss') + 
                     Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // 完整地址
    const fullAddress = `花蓮縣光復鄉${data.village}${data.neighborhood}鄰${data.address}`;
    
    // 建立資料夾
    const parentFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const folderName = `${recordId}_${fullAddress}`;
    const recordFolder = parentFolder.createFolder(folderName);
    
    // 處理照片上傳
    const imageUrls = [];
    
    for (let i = 0; i < data.images.length && i < 5; i++) {
      const fileData = data.images[i];
      if (fileData && fileData !== '') {
        // 解析 base64 圖片
        const base64Data = fileData.split(',')[1];
        const mimeType = fileData.split(',')[0].split(':')[1].split(';')[0];
        const extension = mimeType.split('/')[1];
        
        const blob = Utilities.newBlob(
          Utilities.base64Decode(base64Data),
          mimeType,
          `${fullAddress}_${i + 1}.${extension}`
        );
        
        const file = recordFolder.createFile(blob);
        imageUrls.push(file.getId());
      }
    }
    
    // 寫入 Google 試算表
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    // 如果是第一筆資料，建立標題列
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '編號', '姓名', '電話', '信箱', '村', '鄰', '地址', 
        '完整地址', '照片數量', '資料夾ID', '上傳時間'
      ]);
    }
    
    sheet.appendRow([
      recordId,
      data.name,
      data.phone,
      data.email || '',
      data.village,
      data.neighborhood,
      data.address,
      fullAddress,
      imageUrls.length,
      recordFolder.getId(),
      new Date()
    ]);
    
    return {
      success: true,
      message: '上傳成功！',
      recordId: recordId
    };
    
  } catch (error) {
    Logger.log('Error in submitUpload: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return {
      success: false,
      message: '上傳失敗：' + error.toString()
    };
  }
}

// ==================== 查詢處理（供前端呼叫）====================
function submitQuery(phone) {
  try {
    if (!phone) {
      return {
        success: false,
        message: '請輸入電話號碼'
      };
    }
    
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    const results = [];
    
    // 從第二列開始（跳過標題）
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[2] === phone) { // 電話在第3欄（索引2）
        results.push({
          recordId: row[0],
          name: row[1],
          phone: row[2],
          email: row[3],
          village: row[4],
          neighborhood: row[5],
          address: row[6],
          fullAddress: row[7],
          imageCount: row[8],
          folderId: row[9],
          uploadTime: Utilities.formatDate(new Date(row[10]), 'Asia/Taipei', 'yyyy-MM-dd HH:mm:ss')
        });
      }
    }
    
    if (results.length === 0) {
      return {
        success: false,
        message: '查無資料'
      };
    }
    
    return {
      success: true,
      data: results
    };
    
  } catch (error) {
    Logger.log('Error in submitQuery: ' + error.toString());
    return {
      success: false,
      message: '查詢失敗：' + error.toString()
    };
  }
}

// ==================== 取得照片 ====================
function getImages(folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const images = [];
    
    while (files.hasNext()) {
      const file = files.next();
      const mimeType = file.getMimeType();
      
      if (mimeType.startsWith('image/')) {
        images.push({
          id: file.getId(),
          name: file.getName(),
          url: file.getUrl()
        });
      }
    }
    
    return images;
  } catch (error) {
    Logger.log('Error in getImages: ' + error.toString());
    return [];
  }
}

// ==================== 取得單一照片 (Base64) ====================
function getImageBase64(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    const base64 = Utilities.base64Encode(blob.getBytes());
    const mimeType = blob.getContentType();
    
    return {
      success: true,
      data: `data:${mimeType};base64,${base64}`
    };
  } catch (error) {
    Logger.log('Error in getImageBase64: ' + error.toString());
    return {
      success: false,
      message: '無法載入照片'
    };
  }
}

// ==================== 下載 ZIP ====================
function handleDownloadZip(e) {
  try {
    const folderId = e.parameter.folderId;
    const adminKey = e.parameter.adminKey;
    
    // 簡單的管理員驗證（實際應用中應該使用更安全的方式）
    if (adminKey !== 'your_admin_key_here') {
      throw new Error('無權限執行此操作');
    }
    
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const blobs = [];
    
    while (files.hasNext()) {
      const file = files.next();
      blobs.push(file.getBlob());
    }
    
    const zipBlob = Utilities.zip(blobs, folder.getName() + '.zip');
    
    return ContentService.createTextOutput(
      Utilities.base64Encode(zipBlob.getBytes())
    ).setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    Logger.log('Error in handleDownloadZip: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: '下載失敗：' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}