// DOM post-processing that runs *after* Paged.js has laid the report into pages.
// Two jobs, both of which need the final paginated DOM:
//   1. Cross-references: replace each <a data-or-ref> with "圖 N" / "表 N" /
//      "第 N 節" (Figure/Table/Section N in non-CJK reports), by scanning the
//      actual appearance order of figures, tables and headings.
//   2. Table of contents: fill <nav data-or-toc> with real entries and the page
//      number each heading landed on.
// Section *display* numbering stays a CSS counter; here we only compute the same
// numbers in JS to drive ref text and the TOC.

const HEADING_SELECTOR =
  '.or-content h1:not(.or-refs-title), .or-content h2, .or-content h3';

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

export function postProcess(
  root: HTMLElement,
  meta: Record<string, string>,
): void {
  const zh = isZh(meta);
  const pages = Array.from(root.querySelectorAll('.pagedjs_page'));

  // --- Label maps in visual (DOM) order -----------------------------------
  const labelById = new Map<string, string>();

  root.querySelectorAll('figure[id]').forEach((el, i) => {
    labelById.set(el.id, zh ? `圖 ${i + 1}` : `Figure ${i + 1}`);
  });
  root.querySelectorAll('.or-table[id]').forEach((el, i) => {
    labelById.set(el.id, zh ? `表 ${i + 1}` : `Table ${i + 1}`);
  });

  const headings = Array.from(root.querySelectorAll(HEADING_SELECTOR));
  const headingNumbers = numberHeadings(headings);
  for (const h of headings) {
    const num = headingNumbers.get(h) as string;
    if (!h.id) h.id = `sec-${num.replace(/\./g, '-')}`;
    labelById.set(h.id, zh ? `第 ${num} 節` : `Section ${num}`);
  }

  // --- 1. Cross-references -------------------------------------------------
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

  // --- 2. Table of contents ----------------------------------------------
  const toc = root.querySelector('[data-or-toc]');
  if (toc) {
    for (const e of toc.querySelectorAll('.or-toc-entry')) e.remove();
    const doc = root.ownerDocument;
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
      textSpan.textContent = h.textContent ?? '';

      const dots = doc.createElement('span');
      dots.className = 'or-toc-dots';

      const pageSpan = doc.createElement('span');
      pageSpan.className = 'or-toc-page';
      pageSpan.textContent = pageNumberOf(h, pages);

      row.append(numSpan, textSpan, dots, pageSpan);
      toc.appendChild(row);
    }
  }
}
