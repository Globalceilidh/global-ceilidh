'use client';

// app/duilleag/DuilleagData.js
// Shared state for the Duilleag-cèilidh (panel 1).
//
// On desktop the three columns live in one <Duilleag> component that owns
// the feed / connections / globe state. On mobile and tablet the shell
// splits those columns into three separate swipe panes (see DuilleagShell),
// which are siblings — they can't share React state through props. So the
// state is lifted here, into a provider mounted once above the panes. It
// fetches once regardless of how many column-panes are mounted, and a post
// made in the centre pane, a connection accepted in the right pane, and the
// requests badge in the left pane all read the same source.

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);

export function DuilleagDataProvider({ initialPosts, children }) {
  const [feed, setFeed] = useState([]);
  const [own, setOwn] = useState(initialPosts || []);
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [globeExpanded, setGlobeExpanded] = useState(false);

  const refreshConnections = useCallback(async () => {
    try {
      const res = await fetch('/api/connections');
      const json = await res.json();
      if (json.ok) {
        setConnections(json.connections || []);
        setPending(json.pending || []);
        setOutgoing(json.outgoing || []);
      }
    } catch { /* the column simply stays as it was */ }
  }, []);

  const refreshFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/feed');
      const json = await res.json();
      if (json.ok) setFeed(json.posts || []);
    } catch { /* ditto */ } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { refreshConnections(); refreshFeed(); }, [refreshConnections, refreshFeed]);

  const addOwnPost = useCallback((post) => setOwn((o) => [post, ...o]), []);
  const removeOwnPost = useCallback((id) => setOwn((o) => o.filter((x) => x.id !== id)), []);
  const removeFeedPost = useCallback((id) => setFeed((f) => f.filter((x) => x.id !== id)), []);
  const toggleGlobe = useCallback(() => setGlobeExpanded((v) => !v), []);

  const value = {
    feed, own, connections, pending, outgoing, loaded, globeExpanded,
    refreshConnections, refreshFeed, addOwnPost, removeOwnPost, removeFeedPost, toggleGlobe,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDuilleagData() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDuilleagData must be used within DuilleagDataProvider');
  return v;
}
