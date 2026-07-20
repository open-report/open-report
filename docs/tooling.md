# open-report 工具鏈

依「現代人怎麼寫報告」與 open-slide 的工程實踐選定。原則:core 出貨給用戶,依賴越少越好;開發鏈可以重,出貨鏈必須輕。

## 出貨依賴(進 core 的 dependencies,每一個都要辯護)

| 工具 | 用途 | 為什麼是它 |
|---|---|---|
| Vite 8 + @vitejs/plugin-react | dev server、HMR、建置 | open-slide 同款;生態最大 |
| @mdx-js/rollup | MDX → React | 報告 = 散文為主,MDX 是 agent 寫散文最不會錯的格式 |
| React 19 | 渲染 | 同 open-slide |
| Paged.js | 分頁引擎(CSS Paged Media polyfill) | 唯一成熟的瀏覽器端分頁方案;頁邊距/頁首頁尾/頁碼全靠它 |
| citeproc | 引用格式化(CSL) | 學術引用的事實標準;CSL styles 直接吃 APA/MLA/Chicago/GB/T 7714 |
| commander + chalk | CLI | 同 open-slide |
| fast-glob | 掃描 reports/ | 同 open-slide |

Phase 2 才加:`docx`(npm)— 元件樹 → Word 匯出。PDF 匯出用 headless Chrome 列印(playwright 作為 optional peer,不進預設安裝)。

## 開發工具鏈(devDependencies / repo 層,全部照抄 open-slide)

| 工具 | 用途 |
|---|---|
| pnpm workspaces + Turborepo | monorepo 任務編排(`pnpm dev` / `build` / `typecheck`) |
| TypeScript 5.9 | 全 repo strict |
| tsdown | core/cli 打包(open-slide 同款) |
| Biome | format + lint + organize imports,commit 前必過 |
| Vitest | 測試(編號器、引用解析、front-matter parser 是重點測試對象) |
| Changesets | 版本與 CHANGELOG;core/cli 改動必附 changeset |
| GitHub Actions | CI:check → typecheck → test → build(`.github/workflows/ci.yml`);之後加 changesets/action 自動發版 |

## Agent 工作流工具

| 工具 | 用途 |
|---|---|
| AGENTS.md ×2 | repo 根(框架開發規則)+ template(報告撰寫規則),hard rules only |
| skills(隨 core 出貨) | `create-report` / `report-authoring` / 後續 `apply-comments`、`create-template`、`current-report`;照 open-slide 的 `sync:skills` 漂移偵測機制 |
| OpenSpec(選用) | spec-driven development:大功能(分頁引擎、docx 匯出)先寫 spec 再讓 agent 實作,適合單人 + agent 的開發模式 |
| gh CLI | issue/PR/release 自動化 |

## 現代寫報告的需求 → 功能對應

| 現實需求 | open-report 的回答 |
|---|---|
| 學校/公司只收 PDF 或 Word | PDF(MVP)、docx(Phase 2 護城河) |
| 引用格式要求嚴格(APA/GB/T 7714) | citeproc + CSL,agent 只寫 `<Cite>` |
| 格式規範各系所不同(封面、字體、行距) | `templates/<id>.md` + `create-template` skill,社群可貢獻 |
| 中文排版(縮排、標點禁則、混排) | core 內建 CJK 樣式,config `lang` 切換 |
| 教授/主管改稿來回 | inspector 評論迴圈(v0.2):點段落留言 → agent 修 |
| 圖表編號、目錄頁碼永遠對不上 | 全自動編號 + 分頁後回填,結構上不可能錯 |
