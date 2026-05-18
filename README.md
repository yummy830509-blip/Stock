# 台股預言機 🔮

每天自動分析台股走向，打開即看結果。

## 檔案結構

```
stock-oracle/
├── public/
│   └── index.html      # 前端頁面
├── api/
│   └── predict.js      # 後端 API（呼叫 Claude 分析）
├── vercel.json         # Vercel 設定
└── package.json
```

## 部署步驟

### 1. 建立 GitHub Repo
- 去 github.com 新增一個 repo，名稱例如 `stock-oracle`
- 把這四個檔案上傳進去（維持資料夾結構）

### 2. 部署到 Vercel
- 去 vercel.com，用 GitHub 登入
- 點「Add New Project」→ 選你的 repo
- 點「Deploy」（先不用改任何設定）

### 3. 填入 API Key
- 部署完成後，進入專案設定
- 點「Settings」→「Environment Variables」
- 新增一筆：
  - Name: `ANTHROPIC_API_KEY`
  - Value: `你的 sk-ant-api03-...`
- 儲存後點「Redeploy」

### 4. 完成！
- Vercel 會給你一個網址，例如 `stock-oracle.vercel.app`
- 分享給任何人，打開就能看到今日台股預測

## 運作方式
- 第一個打開的人觸發 AI 分析（約 10 秒）
- 之後當天所有人打開都直接看到快取結果（瞬間）
- 每天自動更新
