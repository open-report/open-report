// A deliberately small BibTeX -> CSL-JSON converter. citeproc consumes CSL-JSON,
// but reports store their bibliography as `references.bib` (BibTeX), the format
// agents and reference managers emit most reliably. We parse the common entry
// types rather than pull in a heavy citation toolkit — core keeps its dependency
// list short on purpose.

export type CslName = { family?: string; given?: string; literal?: string };

export type CslDate = { 'date-parts'?: number[][] };

export type CslItem = {
  id: string;
  type: string;
  title?: string;
  author?: CslName[];
  editor?: CslName[];
  'container-title'?: string;
  'collection-title'?: string;
  issued?: CslDate;
  volume?: string;
  issue?: string;
  page?: string;
  publisher?: string;
  'publisher-place'?: string;
  DOI?: string;
  URL?: string;
  ISBN?: string;
  ISSN?: string;
  note?: string;
  [key: string]: unknown;
};

const TYPE_MAP: Record<string, string> = {
  article: 'article-journal',
  inproceedings: 'paper-conference',
  conference: 'paper-conference',
  proceedings: 'book',
  book: 'book',
  inbook: 'chapter',
  incollection: 'chapter',
  phdthesis: 'thesis',
  mastersthesis: 'thesis',
  techreport: 'report',
  manual: 'book',
  misc: 'document',
  online: 'webpage',
  electronic: 'webpage',
  unpublished: 'manuscript',
};

/** Read one BibTeX field value: `{...}`, `"..."`, or a bareword/number. */
function readValue(src: string, start: number): [string, number] {
  let i = start;
  const ch = src[i];
  if (ch === '{') {
    let depth = 0;
    let out = '';
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === '{') {
        depth++;
        if (depth === 1) continue;
      } else if (c === '}') {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
      out += c;
    }
    return [out, i];
  }
  if (ch === '"') {
    let out = '';
    i++;
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === '"') {
        i++;
        break;
      }
      out += c;
    }
    return [out, i];
  }
  let out = '';
  for (; i < src.length && !/[,}\s]/.test(src[i] as string); i++) {
    out += src[i];
  }
  return [out, i];
}

/** Strip protective braces and collapse whitespace in a text field. */
function cleanText(value: string): string {
  return value.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
}

/** Parse a BibTeX author/editor list ("A and B and C") into CSL names. */
function parseNames(raw: string): CslName[] {
  return raw
    .split(/\s+and\s+/i)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((name): CslName => {
      // A fully brace-wrapped name is an institution: keep it literal.
      if (/^\{.*\}$/.test(name)) {
        return { literal: cleanText(name) };
      }
      const cleaned = cleanText(name);
      if (cleaned.includes(',')) {
        const [family, ...rest] = cleaned.split(',');
        return {
          family: (family ?? '').trim(),
          given: rest.join(',').trim() || undefined,
        };
      }
      const parts = cleaned.split(/\s+/);
      if (parts.length === 1) return { family: parts[0] };
      const family = parts.pop() as string;
      return { family, given: parts.join(' ') };
    });
}

function toIssued(year: string): CslDate | undefined {
  const y = Number.parseInt(year.replace(/[^0-9]/g, ''), 10);
  if (Number.isNaN(y)) return undefined;
  return { 'date-parts': [[y]] };
}

function assignField(item: CslItem, key: string, value: string): void {
  const v = cleanText(value);
  if (!v) return;
  switch (key) {
    case 'title':
    case 'volume':
    case 'publisher':
      item[key] = v;
      break;
    case 'author':
      item.author = parseNames(value);
      break;
    case 'editor':
      item.editor = parseNames(value);
      break;
    case 'journal':
    case 'booktitle':
      item['container-title'] = v;
      break;
    case 'series':
      item['collection-title'] = v;
      break;
    case 'year':
      item.issued = toIssued(v);
      break;
    case 'number':
      item.issue = v;
      break;
    case 'pages':
      item.page = v.replace(/\s*-{2,3}\s*/g, '–');
      break;
    case 'address':
    case 'location':
      item['publisher-place'] = v;
      break;
    case 'school':
    case 'institution':
      if (!item.publisher) item.publisher = v;
      break;
    case 'doi':
      item.DOI = v;
      break;
    case 'url':
      item.URL = v;
      break;
    case 'isbn':
      item.ISBN = v;
      break;
    case 'issn':
      item.ISSN = v;
      break;
    case 'note':
      item.note = v;
      break;
    default:
      break;
  }
}

/**
 * Parse a BibTeX string into CSL-JSON items. Unknown entry types map to
 * `document`; unknown fields are ignored. Malformed entries are skipped rather
 * than thrown, so one bad entry never breaks a whole bibliography.
 */
export function parseBibtex(input: string): CslItem[] {
  const items: CslItem[] = [];
  const src = input;
  let i = 0;
  const n = src.length;

  while (i < n) {
    while (i < n && src[i] !== '@') i++;
    if (i >= n) break;
    i++; // '@'

    let type = '';
    while (i < n && /[a-zA-Z]/.test(src[i] as string)) {
      type += src[i];
      i++;
    }
    type = type.toLowerCase();

    while (i < n && src[i] !== '{' && src[i] !== '@') i++;
    if (i >= n || src[i] === '@') continue;
    i++; // '{'

    // @string / @preamble / @comment carry no citeable entry.
    if (type === 'string' || type === 'preamble' || type === 'comment') {
      let depth = 1;
      for (; i < n && depth > 0; i++) {
        if (src[i] === '{') depth++;
        else if (src[i] === '}') depth--;
      }
      continue;
    }

    let key = '';
    while (i < n && src[i] !== ',' && src[i] !== '}') {
      key += src[i];
      i++;
    }
    key = key.trim();
    if (!key) continue;

    const item: CslItem = { id: key, type: TYPE_MAP[type] ?? 'document' };

    while (i < n && src[i] !== '}') {
      const c = src[i] as string;
      if (c === ',' || /\s/.test(c)) {
        i++;
        continue;
      }
      let field = '';
      while (i < n && /[a-zA-Z0-9_:.-]/.test(src[i] as string)) {
        field += src[i];
        i++;
      }
      while (i < n && /\s/.test(src[i] as string)) i++;
      if (src[i] !== '=') {
        // Not a field assignment; bail to the end of this entry.
        while (i < n && src[i] !== '}') i++;
        break;
      }
      i++; // '='
      while (i < n && /\s/.test(src[i] as string)) i++;
      const [value, next] = readValue(src, i);
      i = next;
      if (field) assignField(item, field.toLowerCase(), value);
    }
    if (src[i] === '}') i++;

    items.push(item);
  }

  return items;
}
