# 作品網站

這是一個使用 `HTML + Sass + JavaScript` 的履歷作品網站，透過 `Vite` 做開發與打包。

## 開發與打包

1. 安裝套件
2. 啟動開發環境
3. 打包正式版

```bash
npm install
npm run dev
npm run build
```

## 目錄結構

- `index.html`: 主頁模板（Vite 入口）
- `assets/js/main.js`: 互動邏輯與作品資料
- `assets/scss/styles.scss`: Sass 樣式
- `assets/images/`: 作品圖片素材

## 作品資料範例

```js
{
  title: '你的專案名稱',
  description: '專案描述',
  image: 'assets/images/project-01.svg',
  demo: 'https://你的作品網址',
  repo: 'https://github.com/你的帳號/你的repo'
}
```
