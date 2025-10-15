# 📱 災害通報系統 - GitHub Pages 部署指南

## 🚀 快速部署步驟

### 第一步：準備 GitHub 儲存庫

1. **建立新的 GitHub 儲存庫**
   - 登入 [GitHub](https://github.com)
   - 點擊右上角 "+" → "New repository"
   - 輸入儲存庫名稱（例如：`disaster-report-system`）
   - 選擇 "Public"（GitHub Pages 免費版需要公開儲存庫）
   - 勾選 "Add a README file"
   - 點擊 "Create repository"

2. **上傳檔案到儲存庫**
   - 點擊 "uploading an existing file" 或 "Add file" → "Upload files"
   - 將以下檔案拖拽上傳：
     ```
     ├── index.html          # 首頁
     ├── upload.html         # 上傳頁面
     ├── search.html         # 查詢頁面
     ├── config.js           # 設定檔
     ├── upload.js           # 上傳功能
     ├── search.js           # 查詢功能
     └── README.md           # 說明檔案
     ```

### 第二步：啟用 GitHub Pages

1. **進入儲存庫設定**
   - 在您的儲存庫頁面，點擊 "Settings" 分頁

2. **設定 GitHub Pages**
   - 在左側選單找到 "Pages"
   - Source 選擇 "Deploy from a branch"
   - Branch 選擇 "main" 或 "master"
   - Folder 選擇 "/ (root)"
   - 點擊 "Save"

3. **取得網站網址**
   - 等待 1-2 分鐘後重新整理頁面
   - 您會看到網址：`https://您的用戶名.github.io/儲存庫名稱`

### 第三步：設定 Google Apps Script 後端

1. **開啟 Google Apps Script**
   - 前往 [Google Apps Script](https://script.google.com/)
   - 建立新專案或開啟現有專案

2. **上傳後端檔案**
   - 上傳 `code.gs`（主要後端邏輯）
   - 上傳 `input_mobile.html`（作為備用）
   - 上傳 `query_mobile.html`（作為備用）

3. **設定試算表和雲端硬碟**
   - 在 `code.gs` 中修改：
     ```javascript
     const SPREADSHEET_ID = '您的試算表ID';
     const DRIVE_FOLDER_ID = '您的雲端硬碟資料夾ID';
     ```

4. **部署為網路應用程式**
   - 點擊「部署」→「新增部署作業」
   - 類型：「網路應用程式」
   - 執行身分：「我」
   - 存取權：「任何人」
   - 點擊「部署」並複製網址

### 第四步：連接前後端

1. **修改 config.js**
   - 在 GitHub 上點擊 `config.js` 檔案
   - 點擊編輯按鈕（鉛筆圖示）
   - 將 `YOUR_SCRIPT_URL_HERE` 替換為您的 Google Apps Script 網址：
     ```javascript
     const CONFIG = {
       API_URL: 'https://script.google.com/macros/s/您的腳本ID/exec',
       // 其他設定...
     };
     ```
   - 點擊 "Commit changes"

2. **測試系統**
   - 開啟您的 GitHub Pages 網址
   - 測試上傳和查詢功能

## 🎯 檔案結構說明

```
disaster-report-system/
├── index.html          # 🏠 系統首頁 - 功能介紹和導航
├── upload.html         # 📤 資料上傳頁面 - 表單和照片上傳
├── search.html         # 🔍 查詢頁面 - 電話號碼查詢和結果顯示
├── config.js           # ⚙️ 系統設定檔 - API 連接和參數設定
├── upload.js           # 📱 上傳功能邏輯 - 表單處理和檔案上傳
├── search.js           # 🔍 查詢功能邏輯 - 資料查詢和結果顯示
├── README.md           # 📖 使用說明文件
└── DEPLOY.md           # 🚀 部署指南（本檔案）
```

## 🌐 網址結構

部署完成後，您的系統將有以下網址：

- **首頁**: `https://您的用戶名.github.io/儲存庫名稱/`
- **上傳頁面**: `https://您的用戶名.github.io/儲存庫名稱/upload.html`
- **查詢頁面**: `https://您的用戶名.github.io/儲存庫名稱/search.html`

## 🎨 自訂化設定

### 修改系統資訊

1. **修改標題和單位名稱**
   - 編輯 `index.html`、`upload.html`、`search.html`
   - 搜尋 "花蓮縣光復鄉" 並替換為您的單位名稱

2. **修改村里選項**
   - 編輯 `config.js` 中的 `VILLAGES` 陣列：
     ```javascript
     VILLAGES: [
       '您的村1', '您的村2', '您的村3'
       // 加入您的實際村里名稱
     ]
     ```
   - 編輯 `upload.html` 中的 select 選項

3. **修改聯絡資訊**
   - 編輯 `index.html` 底部的聯絡資訊
   - 修改緊急電話和 Email

### 調整樣式和顏色

1. **主要顏色主題**
   - 編輯各 HTML 檔案中的 CSS 類別
   - 上傳頁面：藍色主題 (`bg-blue-600`, `text-blue-600`)
   - 查詢頁面：綠色主題 (`bg-green-600`, `text-green-600`)

2. **自訂 CSS**
   - 在 `<style>` 標籤中加入您的 CSS
   - 或建立獨立的 `.css` 檔案

## 🔧 進階設定

### 自訂網域名稱

1. **購買網域**
   - 在網域註冊商購買網域（如 GoDaddy、Namecheap）

2. **設定 DNS**
   - 在網域管理中加入 CNAME 記錄：
     ```
     www  CNAME  您的用戶名.github.io
     ```

3. **在 GitHub 設定自訂網域**
   - 到儲存庫 Settings → Pages
   - 在 Custom domain 輸入您的網域
   - 等待 DNS 驗證完成

### 加入 Google Analytics

1. **建立 GA 帳戶**
   - 前往 [Google Analytics](https://analytics.google.com/)
   - 建立新的媒體資源

2. **加入追蹤碼**
   - 將 GA 追蹤碼加入每個 HTML 檔案的 `<head>` 區塊

### SSL 憑證

GitHub Pages 自動提供 HTTPS，無需額外設定。

## 🛠️ 常見問題排除

### 問題 1：頁面顯示 404 錯誤
**解決方案：**
- 確認檔案名稱正確（區分大小寫）
- 檢查 GitHub Pages 是否已啟用
- 等待 5-10 分鐘讓更改生效

### 問題 2：無法連接到 Google Apps Script
**解決方案：**
- 檢查 `config.js` 中的 API_URL 是否正確
- 確認 Google Apps Script 已部署為網路應用程式
- 檢查 Apps Script 的存取權限設定

### 問題 3：照片上傳失敗
**解決方案：**
- 檢查圖片檔案大小（建議小於 10MB）
- 確認圖片格式為 JPG、PNG、GIF
- 檢查網路連線狀態

### 問題 4：手機版顯示異常
**解決方案：**
- 清除瀏覽器快取
- 檢查手機瀏覽器是否支援現代 CSS
- 測試不同瀏覽器

## 📊 監控和維護

### 定期檢查項目

1. **每週檢查**
   - 測試上傳和查詢功能
   - 檢查 Google 雲端硬碟空間
   - 確認試算表資料正常

2. **每月檢查**
   - 備份試算表資料
   - 清理過期的照片檔案
   - 檢查系統效能

3. **每季檢查**
   - 更新系統版本
   - 檢查安全性設定
   - 優化使用者體驗

### 備份策略

1. **資料備份**
   - 定期下載試算表為 Excel 檔案
   - 建立雲端硬碟資料夾的副本

2. **程式碼備份**
   - GitHub 本身就是備份
   - 可下載整個儲存庫為 ZIP 檔案

## 🎉 部署完成！

恭喜！您的災害通報系統現在已經部署在 GitHub Pages 上了。

### 接下來可以做的事：

1. **📢 推廣使用** - 向您的社區宣傳這個系統
2. **📱 建立 QR Code** - 方便手機用戶快速存取
3. **📊 收集回饋** - 從使用者那裡獲得改善建議
4. **🔄 持續優化** - 根據使用情況調整功能

### 需要協助？

- 📧 Email: admin@example.com
- 📖 查看 [GitHub Issues](https://github.com/您的用戶名/儲存庫名稱/issues)
- 💬 在 GitHub 討論區發問

---

🚨 **重要提醒**: 這是一個開源專案，請確保不要在公開儲存庫中包含敏感資訊（如 API 金鑰、管理員密碼等）。