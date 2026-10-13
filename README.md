# 咖啡風味輪 · Coffee Flavor Wheel

純前端的互動式咖啡風味選擇器。從內圈的 9 大風味分類出發，點選後風味輪會縮放展開下一層，一路選到最外圈的細緻風味，並整理成「我的風味筆記」。

- 資料：依 SCA / WCR Coffee Taster's Flavor Wheel 的 3 層結構（9 → 28 → 85），顏色取樣自參考圖
- 語言：繁體中文 / English（記住上次選擇，預設依瀏覽器語言）
- 技術：React 19 + TypeScript + Vite，樣式全部使用 [StyleX](https://stylexjs.com)（`@stylexjs/unplugin`）
- RWD：手機直向單欄、平板 / 手機橫向 / 桌機雙欄（風味輪固定在畫面上），風味輪標籤依實際像素大小自動縮放或隱藏
- 深淺色模式：預設跟隨系統；標題列按鈕可手動切換（切到與系統相反時記住，切回與系統相同時恢復跟隨系統）
- 支援 `prefers-reduced-motion`、鍵盤操作（右側清單可完整操作，`Esc` 返回上一層）
- 已選風味存在 localStorage，可一鍵複製為文字

## 開發

```sh
pnpm install
pnpm dev          # 開發伺服器
pnpm build        # 型別檢查 + 打包到 dist/
pnpm preview      # 預覽打包結果
```

`dist/` 為純靜態檔案（相對路徑），可直接部署到任何靜態主機。

## 部署

推送到 `main` 時，`.github/workflows/deploy.yml` 會自動打包並部署到 GitHub Pages（也可在 Actions 頁面手動執行）。首次使用需在 repo 的 Settings → Pages → Build and deployment → Source 選擇「GitHub Actions」。

## 結構

```
src/
  data/flavors.ts        風味樹（中英名稱、顏色）與扇形版面計算
  i18n.ts                介面文字
  tokens.stylex.ts       StyleX 設計變數（light-dark() 深淺色，舊瀏覽器以 media query 退回）
  lib/colorScheme.ts     深淺色手動切換（localStorage + <meta name="color-scheme">）
  lib/geometry.ts        扇形路徑、縮放視角、徑向標籤擺放
  components/Wheel.tsx   SVG 風味輪（縮放動畫、hover 路徑高亮、選取標記）
  components/LevelPanel.tsx  目前層級：麵包屑、子項目清單、整體風味選擇
  components/NotesPanel.tsx  我的風味筆記
```
