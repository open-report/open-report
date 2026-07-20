# Vendored CSL styles & locales

These files are vendored verbatim from the [Citation Style Language](https://citationstyles.org/)
project so that open-report can format citations fully offline (no network, no
`citation-style-language` runtime download). Do not hand-edit them — re-vendor
from upstream instead.

| File | Upstream | License |
|---|---|---|
| `apa.csl` | [citation-style-language/styles → `apa.csl`](https://github.com/citation-style-language/styles/blob/master/apa.csl) | CC BY-SA 3.0 (see `<rights>` in the file) |
| `gb-7714-2015-numeric.csl` | [citation-style-language/styles → `china-national-standard-gb-t-7714-2015-numeric.csl`](https://github.com/citation-style-language/styles/blob/master/china-national-standard-gb-t-7714-2015-numeric.csl) | CC BY-SA 3.0 (see `<rights>` in the file) |
| `locales-en-US.xml` | [citation-style-language/locales → `locales-en-US.xml`](https://github.com/citation-style-language/locales/blob/master/locales-en-US.xml) | CC BY-SA 3.0 |
| `locales-zh-TW.xml` | [citation-style-language/locales → `locales-zh-TW.xml`](https://github.com/citation-style-language/locales/blob/master/locales-zh-TW.xml) | CC BY-SA 3.0 |

The per-file `<info><rights>` element carries the upstream license notice; keep it
intact. Locales repo is licensed CC BY-SA 3.0 (see the locales repo LICENSE).

## Re-vendoring

```sh
S=https://raw.githubusercontent.com/citation-style-language/styles/master
L=https://raw.githubusercontent.com/citation-style-language/locales/master
curl -fsSL $S/apa.csl -o apa.csl
curl -fsSL $S/china-national-standard-gb-t-7714-2015-numeric.csl -o gb-7714-2015-numeric.csl
curl -fsSL $L/locales-en-US.xml -o locales-en-US.xml
curl -fsSL $L/locales-zh-TW.xml -o locales-zh-TW.xml
```
