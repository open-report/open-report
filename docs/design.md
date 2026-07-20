# open-report 設計文件

> **The report framework built for agents.** 用自然語言描述你的報告——coding agent 寫 MDX/React,open-report 管分頁、引用、編號、目錄、匯出 PDF/docx。
>
> 基於 open-slide v1.16 原始碼逐項解剖後的對照設計。2026-07-20。

---

## 1. open-slide 為什麼牛逼——解剖結論

讀完原始碼,它贏在七個設計決策,每一個都要在 open-report 找到對應物:

| # | open-slide 的設計                                                                                                                                                                                          | 為什麼有效                                                                                                                |
| - | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1 | **固定 1920×1080 canvas、絕對 px**                                                                                                                                                                  | 消滅了 agent 最容易出錯的 RWD 佈局歧義。skill 裡甚至教 agent「先算垂直預算再寫 JSX」                                      |
| 2 | **極簡檔案契約**:`slides/<id>/index.tsx` 單檔 + `assets/`,default export 零 props 元件陣列,禁止加依賴、禁止碰其他檔案                                                                            | agent 的自由度被精準框住:內容全自由,結構零自由。`meta.createdAt` 用 regex 讀而非執行模組——連解析都為 agent 的產出設計 |
| 3 | **Skills 隨 core 出貨**(5 個:`create-slide` 工作流 / `slide-authoring` 技術參考 + references/ 分冊 / `apply-comments` / `create-theme` / `current-slide`),`sync:skills` 偵測漂移自動同步 | 框架升級 = agent 知識同步升級。skills 分層:workflow 問問題,reference 管怎麼寫,互相引用不重複                              |
| 4 | **Inspector 評論迴圈**:瀏覽器點元素留言 → 寫回原始碼 `@slide-comment` 標記 → `/apply-comments` 讓 agent 逐條修                                                                                 | 人審 → agent 改的閉環,不用截圖、不用描述位置。babel 層級的 source 操作                                                   |
| 5 | **`current.json` 指涉解析**:dev server 寫 `node_modules/.open-slide/current.json`,agent 靠它理解「這一頁」「這個元素」                                                                           | 解決人機對話最大的摩擦:deixis                                                                                             |
| 6 | **`design` const + 面板即時調 token**(`var(--osd-*)`)                                                                                                                                            | 人微調視覺不用叫 agent,agent 寫結構不用管品味                                                                             |
| 7 | **AGENTS.md 只放 hard rules,細節全下放 skills**;template 由獨立 `@open-slide/cli init` 出貨                                                                                                        | 上下文經濟學:agent 每次只載入需要的知識                                                                                   |

Monorepo 工程紀律照抄即可:pnpm + turbo、biome、changesets、`apps/demo` dogfood、core 依賴極少(runtime 出貨給用戶,每個 dep 都算)。

---

## 2. open-report 的根本差異:流動 vs 固定

簡報是「一頁一元件」,報告內容是**流動的**——插一段文字,後面全部重排。這是唯一不能照抄的地方,也是技術核心:

- **Agent 寫流(flow),框架管頁(page)。** agent 絕不手動分頁。
- 分頁引擎:**Paged.js**(W3C CSS Paged Media polyfill)驅動預覽與 PDF——頁邊距、頁首頁尾、頁碼、running header 全由它渲染。
- open-slide 教 agent「算 1080px 垂直預算」;open-report 的對應紀律是「**不許讓不可分割區塊超過一頁**」(圖+說明、大表格),skill 裡教 agent 用 `<Figure>` / `<Table>` 包裹讓框架處理斷頁。

## 3. 檔案契約(對照 open-slide)

```
my-report/
├── AGENTS.md                    # hard rules only
├── open-report.config.ts
├── reports/
│   └── ml-final-project/
│       ├── index.mdx            # 唯一入口,禁止 sibling 檔
│       ├── references.bib       # 引用資料庫(BibTeX 或 CSL-JSON)
│       └── assets/
├── templates/                   # 格式模板,markdown(對照 themes/<id>.md)
│   └── ntu-cs-report.md         # 例:某系所報告規範
└── assets/                      # 全域資源(校徽、logo)
```

```mdx
---
title: 機器學習期末報告
author: 王小明
course: CS5087 機器學習
citationStyle: apa            # apa | mla | chicago | gb7714
template: ntu-cs-report
lang: zh-TW
createdAt: 2026-07-20T00:00:00Z
---

<Cover />
<Toc />

# 緒論

深度學習近年快速發展 <Cite id="lecun2015" />……

<Figure src="./assets/model.png" caption="模型架構圖" id="fig-model" />

如 <Ref to="fig-model" /> 所示……

<References />
```

- **MDX 而非純 tsx**:報告是散文為主,markdown 是 agent 寫散文最不會出錯的格式;需要版面控制時內嵌 React 元件。front-matter 用 regex/靜態解析(照抄 open-slide 的 meta 策略)。
- 章節編號、圖表編號、目錄頁碼、引用格式**全部自動**——agent 只寫 `<Cite>` 和 `<Ref>`,編號永遠不會錯。這是相對 agent 裸寫 Word/LaTeX 的最大賣點。

## 4. 核心元件(MVP 八個)

| 元件             | 職責                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| `<Cover>`      | 封面:從 front-matter + template 規範生成(校名、系所、課程、指導教授、日期) |
| `<Toc>`        | 目錄,頁碼自動(分頁後回填)                                                  |
| `# / ## / ###` | 章節,自動編號(1、1.1、1.1.1),進目錄                                        |
| `<Figure>`     | 圖 + 自動編號 + caption,不可跨頁                                           |
| `<Table>`      | 表 + 自動編號,長表自動斷頁重複表頭                                         |
| `<Cite id>`    | 行內引用,依 CSL 樣式渲染((王,2026)/ [1])                                   |
| `<Ref to>`     | 交叉引用(圖 3、表 1、第 2.1 節),自動更新                                   |
| `<References>` | 參考文獻列表,只列被引用過的,依樣式排序格式化                               |

引用引擎:**citeproc-js + CSL styles**。第一天就帶四個樣式:APA 7、MLA 9、Chicago、**GB/T 7714**(中文學術標準——Quarto 生態的弱項,我們的護城河之一)。

## 5. Runtime(dev server)

照抄 open-slide 的骨架(vite plugin + React app),差異:

- **預覽 = 分頁後的紙張視圖**,側欄縮圖是頁面,點章節跳頁。
- **Inspector 評論迴圈完整移植**:點任何段落/圖表留言 → 寫回 MDX `{/* @report-comment: ... */}` → `/apply-comments`。這是 open-slide 最強的功能,報告場景(教授/主管改稿)甚至比簡報更需要它。
- **`current.json` 照搬**:agent 能解析「這一段」「第三章」。
- **設計面板 token**:紙張(A4/Letter)、邊距、字體、行距、字號 → `var(--ord-*)`,人可即時調不用改碼。
- 無 present mode——對應物是**閱讀模式**(連續滾動、無分頁,給線上分享用)。

## 6. 匯出

| 格式           | 機制                                                                                    | 優先級                                                                          |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| PDF            | Paged.js 渲染 + headless Chrome 列印(open-slide 同款管線)                               | MVP                                                                             |
| 靜態 HTML      | 閱讀模式打包單檔,可部署 Vercel/Netlify                                                  | MVP(便宜且利傳播)                                                               |
| **docx** | 元件樹 →[docx](https://www.npmjs.com/package/docx) npm 庫映射(樣式、編號、引用、目錄域) | **Phase 2,但這是護城河**——學校只收 Word,Quarto 的 docx 出口醜且引用常壞 |

## 7. Agent DX(skills,照抄結構)

| Skill                | 對照            | 內容                                                                                                                                                                                           |
| -------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create-report`    | create-slide    | 四個 scoping 問題:報告類型(課堂/實驗/提案/文獻回顧)、引用格式、長度、語言 → 規劃章節 → 委派 report-authoring                                                                                 |
| `report-authoring` | slide-authoring | 技術參考 + references/ 分冊:MDX 契約、印刷字級表(正文 11-12pt、標題階層)、引用規則、圖表規則、**中文排版規範**(段首縮排 2em、標點禁則、中西文間距)、反模式(手動編號、手動分頁、超寬表格) |
| `apply-comments`   | 同名            | 處理 @report-comment 標記                                                                                                                                                                      |
| `create-template`  | create-theme    | 把學校/公司的格式規範(PDF 或口述)轉成`templates/<id>.md`                                                                                                                                     |
| `current-report`   | current-slide   | 解析「這一段」                                                                                                                                                                                 |

AGENTS.md:只放 hard rules(檔案位置、單檔契約、禁加依賴、禁碰其他報告),其餘指向 skills。`sync:skills` 機制照搬。

## 8. 一句話定位與 README 策略

> **"為什麼不用 Quarto?"** — Quarto 是給科學家的出版系統(R/Python 生態、要裝 CLI、學術基因);open-report 是給交作業的學生和寫提案的上班族的 agent 框架:`npx @open-report/cli init` 就能跑,skills 出貨,inspector 改稿迴圈,docx 優先,中文排版第一天就對。

README 開頭(照抄 open-slide 的節奏):cover 圖 → 一句定位 → `npx init` → 一支影片:「用 Claude Code 三分鐘生成一份帶引用、帶目錄、格式正確的課堂報告 PDF」。

## 9. MVP 範圍(兩週)與 roadmap

**第 1 週(能跑)**:monorepo 骨架(照抄 open-slide 布局)→ MDX 載入 + front-matter 解析 → Paged.js 預覽 + A4 模板(頁碼/頁首)→ `dev` 命令。
**第 2 週(能交)**:八個元件 + citeproc(APA + GB/T 7714)→ `export pdf` + 靜態 HTML → AGENTS.md + `create-report`、`report-authoring` 兩個 skill → demo repo 放三份範例報告(課堂報告、實驗報告、商業提案)→ README + 影片。

**發布後才做**:inspector 評論迴圈(v0.2,最大賣點留一手)→ docx 匯出(v0.3)→ create-template skill + 模板市集(各校系所格式,社群會自己貢獻——這是網路效應所在)→ 閱讀模式 → i18n(open-slide 有 zh-TW/zh-CN/ja/en locale,照抄)。

**刻意不做**:接 LLM API(一接就變產品)、WYSIWYG 編輯器、協作、雲端儲存。

## 10. 風險與對策

- **Quarto/Posit 補位**(已在做 quarto-report skill):我們的窗口以週計,兩週 MVP 不可妥協;差異化釘死在 npm-native、docx、中文、inspector 迴圈四點上。
- **Paged.js 效能**(長文件重排慢):MVP 限制在 50 頁內的報告場景,增量重排後續再優化;別一開始挑戰論文/書籍。
- **TOC 回填不觸發 reflow**(known limitation):目錄於 Paged.js 分頁完成後以 DOM 後處理填入,不會重新分頁,長報告的目錄可能溢出目錄頁。後續以「TOC 預留頁數估算」或二次分頁解決。
- **章節/圖表編號改用 JS 後處理**(對 §4「維持 CSS counter」的必要修正):Paged.js 會把 `.or-content` 複製到每一頁,並以 per-fragment 方式解析 `counter()`——named counter 在每次分頁邊界重置,導致跨頁編號錯誤(第 3 章在新頁顯示成「1」)。已實測 counter-reset 放 `.or-content` / `.pagedjs_pages` / `:root` 皆無效。因此編號(章節、圖、表)統一由 `postprocess.ts` 在分頁後計算,與目錄、交叉引用共用同一來源,確保「編號永遠不會錯」。頁碼仍用 Paged.js 原生 `counter(page)`。
- **clawnify 生態**:他們填格子速度極快,名字先佔:立刻註冊 npm `@open-report/*` scope 與 GitHub org/repo。
