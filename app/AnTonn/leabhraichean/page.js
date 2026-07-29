import TestSurface from '../_components/TestSurface'
import BookshelfWall from './test/BookshelfWall'
import { loadCatalog } from './test/books'

// /AnTonn/leabhraichean — Leabhraichean (Books). Promoted from the test route
// (2026-07-28); the test path 301-redirects here. Wall components stay in
// ./test/. Server component: fetches the catalog at build / ISR time.

export const metadata = {
  title: 'Leabhraichean · An Tonn',
  description: 'Leabhraichean (Books) — the An Tonn books current.',
}

export default async function Leabhraichean() {
  const catalog = await loadCatalog()
  return (
    <TestSurface
      background="#2E2108"
      waveMod="#C69A2A"
      wordmarkText="Leabhraichean"
    >
      <BookshelfWall catalog={catalog} />
    </TestSurface>
  )
}
