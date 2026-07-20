# open-report 產品規劃

> **The report framework built for agents.** 你描述報告,agent 寫 MDX,open-report 保證排版、引用、編號永遠正確,匯出 PDF/docx。
>
> 本文件:核心賣點、MVP 之後的路線圖、以及與「直接叫 agent 寫 LaTeX / 產 docx」的本質差異。

---

## 1. 引人的功能(按 demo 說服力排序)

| # | 功能 | 狀態 | 為什麼引人 |
|---|---|---|---|
| 1 | **一句話 → 可交付的報告**:`create-report` skill 問四個問題,agent 產出帶封面、目錄、引用、圖表的完整報告 | ✅ | 這是 demo 影片的主畫面:「用 Claude Code 三分鐘生成一份課堂報告 PDF」 |
| 2 | **引用全自動**:`references.bib` + `<Cite>`,APA / GB/T 7714 一鍵切換,行內引用與參考文獻列表由 citeproc 生成 | ✅ | agent 裸寫報告時最常出錯的就是引用格式;這裡結構上不可能錯 |
| 3 | **即時 A4 紙面預覽**:存檔即重排,所見即所交(頁碼、頁首、分頁位置) | ✅ | Word 使用者的直覺 + 程式碼的可控性,LaTeX 使用者沒有的體驗 |
| 4 | **全自動編號**:章節 1.1、圖 N、表 N、交叉引用、目錄頁碼,永不失同步 | ✅ | 每個寫過長報告的人都被「圖表編號對不上」折磨過 |
| 5 | **中文排版第一天就對**:段首 2em 縮排、圖/表標籤、GB/T 7714、中文字體堆疊 | ✅ | Quarto/LaTeX 生態的公認痛點,中文圈的第一眼賣點 |
| 6 | **Inspector 評論迴圈**(v0.2 王牌):瀏覽器點任何段落留言 → 寫回 MDX 註記 → `/apply-comments` 讓 agent 逐條修 | 🔜 | 「教授改稿 → 你改報告」的迴圈變成「點一點 → agent 修」;發布時留一手的差異化 |
| 7 | **格式模板**:`templates/<id>.md` 描述系所/公司規範(封面、字體、行距),`create-template` skill 能把規範 PDF 轉成模板 | 🔜 | 社群會自己貢獻各校模板——這是網路效應的來源 |
| 8 | **docx 匯出**:元件樹映射成帶真實樣式與域的 Word 檔 | 🔜 | 「學校只收 Word」是硬需求,也是所有代方案的死穴 |
| 9 | **零 LLM API**:框架不接任何模型,任何 agent(Claude Code、Codex、Cursor)都是一等公民 | ✅ 原則 | 使用者不被綁定、無 API 成本、專案不會因模型過時而過時 |

## 2. MVP(0.1)發布清單

已完成:dev server + Paged.js A4 預覽、八個元件、citeproc 引用(APA/GB7714)、交叉引用與目錄回填、兩個 skills、AGENTS.md/CLAUDE.md、CI。

發布前剩餘:
1. `open-report export <id>`:PDF(Playwright 無頭列印)+ 靜態 HTML
2. README 完稿(截圖 + 30 秒 GIF)+ demo 影片
3. `npm publish`(core + cli)、`npx @open-report/cli init` 端到端驗證
4. 發布:Twitter/X、Threads、Hacker News(Show HN)、v2ex/巴哈/Dcard 視受眾

## 3. MVP 之後的路線圖

| 版本 | 主題 | 內容 |
|---|---|---|
| **0.2** | Inspector 評論迴圈 | 點擊留言 → `{/* @report-comment */}` 寫回 MDX → `apply-comments` skill;`current-report` 指涉解析(dev server 寫 current.json) |
| **0.3** | docx 匯出 | 元件樹 → [docx](https://www.npmjs.com/package/docx) 映射:樣式、章節編號、目錄域、引用;這是護城河功能,做到「Word 打開不走樣」 |
| **0.4** | 模板系統 | `templates/<id>.md` 契約、`create-template` skill(規範 PDF → 模板)、官網模板展示頁;徵集各校系所模板 |
| **0.5** | 學術報告補完 | 數學公式(KaTeX)、程式碼高亮(Shiki)、Mermaid 圖表、`<Equation>` 自動編號、附錄元件 |
| **0.6** | 排版引擎強化 | TOC 溢出修復(預留頁數估算/二次分頁)、增量重排效能、Letter/B5 紙張、MLA/Chicago 樣式補齊 |
| **0.7** | 資料驅動報告 | `<DataTable src="./data.csv">`、簡單圖表元件;實驗報告的數據直接從檔案進來,改數據全文自動更新 |
| **1.0** | 穩定 | 檔案契約凍結、文件站(open-report.dev)、多語 locale、skills evals 常態化 |

持續進行:skills 品質是產品品質——每個新功能都要同步更新 `report-authoring`,並用 skill-creator 跑觸發率測試。

## 4. 為什麼不直接叫 Claude Code 寫 LaTeX / 產 docx?

這是本專案必須回答的問題,答案分三層。

### 4.1 對照表

| | 叫 agent 寫 LaTeX | 叫 agent 用腳本產 docx | open-report |
|---|---|---|---|
| 環境 | TeX Live 數 GB、xeCJK 中文配置、版本地獄 | Python + python-docx,或一次性 OOXML 腳本 | `npx init`,Node 即可 |
| 迭代方式 | 改 → 編譯 → 看錯誤 → 再編譯(agent 大量 token 燒在編譯錯誤迴圈) | 重跑腳本、輸出覆蓋,人手改過的部分全丟失 | 存檔即重排,MDX 是唯一事實來源,git 可追蹤 |
| 預覽 | 無即時預覽,編譯成功才看得到 | 完全盲產,開 Word 才知道長怎樣 | 瀏覽器即時 A4 預覽 |
| 編號/目錄/引用 | 能力強,但 bibtex 多趟編譯、錯誤難懂 | 腳本產出的多半是**死文字**——改內容後編號、目錄、引用全部失效 | 結構性保證:agent 根本沒有寫編號的途徑 |
| 中文 | xeCJK 可以做對,但配置是專家活 | 字體、標點、縮排全靠腳本作者手工 | 內建,`lang: zh-TW` 一行 |
| 產出格式 | PDF(要 docx 就沒轍) | docx(品質不穩) | PDF + HTML,docx 在路線圖 |
| 知識複用 | 每份報告 agent 重新發明 preamble | 每份報告重新發明腳本 | skills + 模板一次投資,所有報告與所有使用者共享 |

### 4.2 本質差異:一次性輸出 vs 可迭代專案

叫 agent 寫 LaTeX 或產 docx,得到的是**一次性輸出**:生成那一刻是對的,但報告是要來回改的——教授給意見、數據更新、章節重排。每次修改,LaTeX 要重新編譯除錯,docx 腳本要重跑並蓋掉手改;agent 每次都在重新解決同樣的排版問題,而且每次都可能犯不同的錯。

open-report 把「排版正確性」從 agent 的職責移進框架的結構裡:agent 只能寫內容(MDX),寫不了編號、頁碼、引用格式——所以這些永遠是對的。報告變成一個**可持續迭代的專案**:改內容,其他一切自動跟上。

### 4.3 對 agent 本身的差異

LaTeX 的錯誤訊息是出了名的難懂,agent 在編譯迴圈裡平均要來回多次;OOXML 的 XML 結構龐雜,agent 直寫容易產出 Word 打不開的檔案。這些來回全是 token 成本和失敗率。open-report 的檔案契約(單一 MDX + 八個元件)是**為 agent 的一次寫對率設計的**,skills 再把規則餵給它——這正是 open-slide 驗證過的公式:不是 agent 不會寫 HTML 簡報,而是框架讓它第一次就寫對。

### 4.4 誠實的邊界

LaTeX 在數學重度排版(期刊論文、書籍)仍是上限更高的工具;open-report 的主場是課堂報告、實驗報告、提案書、文獻回顧——量大、格式要求明確、使用者不想碰排版的場景。0.5 的 KaTeX 支援會覆蓋大部分報告等級的數學需求,但我們不跟 LaTeX 搶期刊排版。

## 5. 刻意不做的事

不接 LLM API(一接就從框架變產品,和幾百個死掉的 AI 寫作工具同賽道);不做 WYSIWYG 編輯器(Inspector 只留言、不編輯,源碼永遠是唯一事實);不做雲端儲存與帳號系統;不做即時協作(git 就是協作)。每一條都是 open-slide 驗證過的紀律:框架保持薄,價值留給 agent 和使用者。
