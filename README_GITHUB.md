# 🚨 災害通報系統 - GitHub Pages 版本

一個專為手機設計的災害通報系統，部署在 GitHub Pages 上，後端使用 Google Apps Script。

## ✨ 主要特色

- 📱 **手機優化設計** - 響應式介面，完美適配手機螢幕
- 🎨 **現代化 UI** - 卡片式設計，視覺友善
- 📸 **照片上傳** - 支援多張照片同時上傳
- 🔍 **快速查詢** - 電話號碼即可查詢所有紀錄
- ☁️ **雲端儲存** - 使用 Google 服務確保資料安全
- 🆓 **完全免費** - GitHub Pages + Google Apps Script

## 🌐 線上演示

- **系統首頁**: [https://您的用戶名.github.io/災害通報系統](https://您的用戶名.github.io/disaster-report-system)
- **資料上傳**: [https://您的用戶名.github.io/災害通報系統/upload.html](https://您的用戶名.github.io/disaster-report-system/upload.html)
- **查詢紀錄**: [https://您的用戶名.github.io/災害通報系統/search.html](https://您的用戶名.github.io/disaster-report-system/search.html)

## 🚀 快速開始

### 1. 複製此專案

```bash
git clone https://github.com/您的用戶名/disaster-report-system.git
cd disaster-report-system
```

### 2. 設定 Google Apps Script

1. 前往 [Google Apps Script](https://script.google.com/)
2. 建立新專案並上傳 `code.gs`
3. 設定試算表和雲端硬碟 ID
4. 部署為網路應用程式

### 3. 設定前端

編輯 `config.js` 檔案：

```javascript
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/您的腳本ID/exec',
  // 其他設定...
};
```

### 4. 啟用 GitHub Pages

1. 到儲存庫 Settings → Pages
2. Source 選擇 "Deploy from a branch"
3. 選擇 main branch
4. 等待部署完成

## 📁 專案結構

```
├── index.html          # 🏠 系統首頁
├── upload.html         # 📤 資料上傳頁面
├── search.html         # 🔍 查詢頁面
├── config.js           # ⚙️ 系統設定檔
├── upload.js           # 📱 上傳功能邏輯
├── search.js           # 🔍 查詢功能邏輯
├── code.gs             # 🔧 Google Apps Script 後端
├── input_mobile.html   # 📱 手機版上傳頁面（備用）
├── query_mobile.html   # 📱 手機版查詢頁面（備用）
├── README.md           # 📖 原始使用說明
├── README_GITHUB.md    # 📖 GitHub 版本說明
└── DEPLOY.md           # 🚀 詳細部署指南
```

## 🎯 使用方式

### 📤 災害通報流程

1. **填寫基本資料** - 姓名、電話、信箱
2. **選擇地點** - 村、鄰、詳細地址
3. **上傳照片** - 最多 5 張現場照片
4. **提交資料** - 獲得查詢編號

### 🔍 查詢紀錄流程

1. **輸入電話號碼** - 通報時使用的號碼
2. **查看結果** - 所有相關通報紀錄
3. **檢視照片** - 點擊查看詳細照片
4. **下載資料** - 管理員可下載完整檔案

## 🛠️ 自訂化設定

### 修改單位名稱

搜尋並替換以下檔案中的「花蓮縣光復鄉」：
- `index.html`
- `upload.html` 
- `search.html`

### 修改村里選項

編輯 `config.js` 中的村里列表：

```javascript
VILLAGES: [
  '您的村1', '您的村2', '您的村3'
  // 加入實際的村里名稱
]
```

同時修改 `upload.html` 中的下拉選單選項。

### 修改顏色主題

- **上傳頁面**: 藍色主題 (`blue-600`)
- **查詢頁面**: 綠色主題 (`green-600`)
- **首頁**: 藍綠漸層主題

## 🔧 技術規格

### 前端技術
- **HTML5** - 語意化標記
- **Tailwind CSS** - 快速樣式開發
- **JavaScript (ES6+)** - 現代化前端邏輯
- **響應式設計** - 支援各種螢幕尺寸

### 後端技術
- **Google Apps Script** - 雲端後端服務
- **Google Sheets** - 資料儲存
- **Google Drive** - 檔案管理
- **RESTful API** - 標準化 API 介面

### 支援的瀏覽器
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 手機瀏覽器（iOS Safari、Chrome Mobile）

## 📊 系統限制

- **檔案大小**: 單張照片最大 10MB
- **照片數量**: 每次最多上傳 5 張
- **支援格式**: JPG、PNG、GIF
- **儲存空間**: 依 Google 雲端硬碟容量
- **併發用戶**: Google Apps Script 限制

## 🔒 安全性考量

- ✅ HTTPS 加密傳輸
- ✅ 資料儲存在 Google 雲端
- ✅ 管理員功能需密鑰驗證
- ✅ 無需註冊即可使用
- ⚠️ 公開儲存庫，避免包含敏感資訊

## 🤝 貢獻指南

歡迎提交 Issues 和 Pull Requests！

### 開發環境設定

1. Fork 此專案
2. 建立功能分支: `git checkout -b feature/AmazingFeature`
3. 提交更改: `git commit -m 'Add some AmazingFeature'`
4. 推送分支: `git push origin feature/AmazingFeature`
5. 建立 Pull Request

### 程式碼規範

- 使用 2 空格縮排
- 變數名稱使用 camelCase
- 函數名稱要有清楚的描述
- 加入適當的註解

## 📝 授權條款

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- [Tailwind CSS](https://tailwindcss.com/) - 優秀的 CSS 框架
- [Google Apps Script](https://script.google.com/) - 強大的雲端平台
- [GitHub Pages](https://pages.github.com/) - 免費的網站託管服務

## 📞 聯絡方式

- **專案維護者**: [您的名稱](https://github.com/您的用戶名)
- **Email**: admin@example.com
- **Issues**: [GitHub Issues](https://github.com/您的用戶名/disaster-report-system/issues)

---

⭐ 如果這個專案對您有幫助，請給我們一個星星！

🚨 **適用場景**: 社區災害通報、意外事件記錄、設施損壞回報、環境問題舉報