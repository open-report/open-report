import type { MdxContent, ReportEntry } from 'virtual:open-report/reports';
import { reports } from 'virtual:open-report/reports';
import { useEffect, useState } from 'react';
import { PagedView } from './paged-view';

const useHash = () => {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
};

export const App = () => {
  const hash = useHash();
  const match = /^#\/r\/(.+)$/.exec(hash);
  const reportId = match?.[1] ? decodeURIComponent(match[1]) : undefined;
  const entry = reportId ? reports.find((r) => r.id === reportId) : undefined;
  if (entry) return <Report entry={entry} />;
  return <Home />;
};

const Home = () => (
  <main className="or-home">
    <h1 className="or-home-title">open-report</h1>
    <p className="or-home-sub">
      {reports.length} report{reports.length === 1 ? '' : 's'} in this project
    </p>
    <div className="or-card-list">
      {reports.map((r) => (
        <a
          key={r.id}
          className="or-card"
          href={`#/r/${encodeURIComponent(r.id)}`}
        >
          <span className="or-card-title">{r.meta.title ?? r.id}</span>
          <span className="or-card-meta">
            {[r.meta.author, r.meta.course].filter(Boolean).join(' · ') || r.id}
          </span>
        </a>
      ))}
    </div>
  </main>
);

const Report = ({ entry }: { entry: ReportEntry }) => {
  const [Content, setContent] = useState<MdxContent | null>(null);
  useEffect(() => {
    let active = true;
    setContent(null);
    entry.load().then((mod) => {
      if (active) setContent(() => mod.default);
    });
    return () => {
      active = false;
    };
  }, [entry]);
  return (
    <div>
      <header className="or-topbar">
        <a href="#/" className="or-back">
          ←
        </a>
        <span className="or-topbar-title">{entry.meta.title ?? entry.id}</span>
      </header>
      {Content ? (
        <PagedView Content={Content} meta={entry.meta} dir={entry.dir} />
      ) : (
        <p className="or-loading">Rendering…</p>
      )}
    </div>
  );
};
