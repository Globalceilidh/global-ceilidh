'use client';

// lib/siteContent.js
// Client-side access to editor-published site content (gc_content via
// /api/content). A component reads a piece by key and passes its in-code
// default; the override wins only when present, so nothing breaks if the DB
// is empty and strings can be migrated one at a time.
//
//   const site = useSiteContent();
//   const blurb = pickContent(site, 'home.easter_egg', { en: DEFAULT_EN, gd: DEFAULT_GD }, language);
//
// The fetch is done once and memoised across mounts (module-level cache), so
// every component shares one request.

import { useEffect, useState } from 'react';

let _cache = null;
let _promise = null;

function loadOnce() {
  if (_cache) return Promise.resolve(_cache);
  if (!_promise) {
    _promise = fetch('/api/content')
      .then((r) => r.json())
      .then((j) => { _cache = j?.content || {}; return _cache; })
      .catch(() => { _cache = {}; return _cache; });
  }
  return _promise;
}

export function useSiteContent() {
  const [map, setMap] = useState(_cache || {});
  useEffect(() => {
    let alive = true;
    loadOnce().then((m) => { if (alive) setMap(m || {}); });
    return () => { alive = false; };
  }, []);
  return map;
}

// Pick the published value for a key + language, or the in-code default.
export function pickContent(map, key, def, language) {
  const o = map?.[key];
  const v = language === 'gd' ? o?.gd : o?.en;
  return (v != null && v !== '') ? v : (language === 'gd' ? def.gd : def.en);
}
