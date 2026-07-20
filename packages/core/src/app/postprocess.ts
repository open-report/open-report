// DOM post-processing that runs *after* Paged.js has laid the report into pages.
// It owns every auto-number in the document, because Paged.js resolves CSS
// counter() per page fragment and restarts named counters at each page break —
// so CSS counters cannot number a report that spans pages. Doing it here in one
// pass over the final paginated DOM keeps headings, captions, the TOC and
// cross-references numbered from a single source of truth.
//
// Jobs:
//   1. Number sections (1, 1.1, …), figures (圖/Figure N) and tables (表/Table N)
//      in their actual appearance order.
//   2. Resolve each <a data-or-ref> to "圖 N" / "表 N" / "第 N 節"
//      (Figure/Table/Section N in non-CJK reports); red if the target is gone.
//   3. Fill <nav data-or-toc> with real entries and the page each heading landed on.

// Real content headings only — the cover title and references title are <h1>s
// but are not numbered sections and must stay out of numbering and the TOC.
const HEADING_SELECTOR =
  '.or-content h1:not(.or-refs-title):not(.or-cover-title), .or-content h2, .or-content h3';

// Full-width ideographic space (U+3000), written as an escape so the lint for
// irregular whitespace stays happy; the correct caption separator in CJK.
const CJK_SPACE = '\u3000';

function isZh(meta: Record<string, string>): boolean {
  return (meta.lang ?? '').toLowerCase().startsWith('zh');
}

/** Compute a stable hierarchical section number for each heading in order. */
function numberHeadings(headings: Element[]): Map<Element, string> {
  const numbers = new Map<Element, string>();
  let h1 = 0;
  let h2 = 0;
  let h3 = 0;
  for (const h of headings) {
    switch (h.tagName.toLowerCase()) {
      case 'h1':
        h1++;
        h2 = 0;
        h3 = 0;
        numbers.set(h, `${h1}`);
        break;
      case 'h2':
        h2++;
        h3 = 0;
        numbers.set(h, `${h1}.${h2}`);
        break;
      default:
        h3++;
        numbers.set(h, `${h1}.${h2}.${h3}`);
        break;
    }
  }
  return numbers;
}

function pageNumberOf(el: Element, pages: Element[]): string {
  const page = el.closest('.pagedjs_page');
  if (!page) return '';
  return (
    page.getAttribute('data-page-number') ?? String(pages.indexOf(page) + 1)
  );
}

/** Prepend a number span to a caption, once. */
function prependNumber(target: Element | null, text: string): void {
  if (!target || target.querySelector('.or-num')) return;
  const span = target.ownerDocument.createElement('span');
  span.className = 'or-num';
  span.textContent = text;
  target.prepend(span);
}

export function postProcess(
  root: HTMLElement,
  meta: Record<string, string>,
): void {
  const zh = isZh(meta);
  const doc = root.ownerDocument;
  const pages = Array.from(root.querySelectorAll('.pagedjs_page'));

  // id -> cross-reference label ("圖 1", "表 1", "第 2.1 節", …).
  const labelById = new Map<string, string>();

  // --- 1. Numbering (figures, tables, sections) ---------------------------
  root.querySelectorAll('figure').forEach((fig, i) => {
    const n = i + 1;
    if (fig.id) labelById.set(fig.id, zh ? `圖 ${n}` : `Figure ${n}`);
    prependNumber(
      fig.querySelector('figcaption'),
      zh ? `圖 ${n}${CJK_SPACE}` : `Figure ${n}. `,
    );
  });

  root.querySelectorAll('.or-table').forEach((tbl, i) => {
    const n = i + 1;
    if (tbl.id) labelById.set(tbl.id, zh ? `表 ${n}` : `Table ${n}`);
    prependNumber(
      tbl.querySelector('.or-table-caption'),
      zh ? `表 ${n}${CJK_SPACE}` : `Table ${n}. `,
    );
  });

  const headings = Array.from(root.querySelectorAll(HEADING_SELECTOR));
  const headingNumbers = numberHeadings(headings);
  // Capture heading text before injecting the number span, so the TOC and the
  // section number never contaminate each other.
  const headingText = new Map<Element, string>();
  for (const h of headings) {
    const num = headingNumbers.get(h) as string;
    headingText.set(h, (h.textContent ?? '').trim());
    if (!h.id) h.id = `sec-${num.replace(/\./g, '-')}`;
    labelById.set(h.id, zh ? `第 ${num} 節` : `Section ${num}`);
    if (!h.querySelector('.or-secnum')) {
      const span = doc.createElement('span');
      span.className = 'or-secnum';
      // "1." for chapters, "1.1" for sub-sections; the space is a CSS margin.
      span.textContent = h.tagName.toLowerCase() === 'h1' ? `${num}.` : num;
      h.prepend(span);
    }
  }

  // --- 2. Cross-references -------------------------------------------------
  root.querySelectorAll<HTMLAnchorElement>('a[data-or-ref]').forEach((a) => {
    const to =
      a.getAttribute('data-to') ??
      (a.getAttribute('href') ?? '').replace(/^#/, '');
    const label = labelById.get(to);
    if (label) {
      a.textContent = label;
      a.setAttribute('href', `#${to}`);
      a.classList.remove('or-ref-missing');
    } else {
      a.textContent = `[${to}?]`;
      a.classList.add('or-ref-missing');
    }
  });

  // --- 3. Table of contents ----------------------------------------------
  const toc = root.querySelector('[data-or-toc]');
  if (toc) {
    for (const e of toc.querySelectorAll('.or-toc-entry')) e.remove();
    for (const h of headings) {
      const num = headingNumbers.get(h) as string;
      const tag = h.tagName.toLowerCase();
      const row = doc.createElement('a');
      row.className = `or-toc-entry or-toc-${tag}`;
      row.setAttribute('href', `#${h.id}`);

      const numSpan = doc.createElement('span');
      numSpan.className = 'or-toc-num';
      numSpan.textContent = num;

      const textSpan = doc.createElement('span');
      textSpan.className = 'or-toc-text';
      textSpan.textContent = headingText.get(h) ?? '';

      const dots = doc.createElement('span');
      dots.className = 'or-toc-dots';

      const pageSpan = doc.createElement('span');
      pageSpan.className = 'or-toc-page';
      pageSpan.textContent = pageNumberOf(h, pages);

      row.append(numSpan, textSpan, dots, pageSpan);
      toc.appendChild(row);
    }
  }

  // Signal that pagination + post-processing finished. Export and tests wait on
  // body[data-or-ready="true"] before capturing the document.
  doc.body?.setAttribute('data-or-ready', 'true');
}
