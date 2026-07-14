import TestSurface from '../../_components/TestSurface'
import BookshelfWall from './BookshelfWall'
import { loadCatalog } from './books'

// /AnTonn/leabhraichean/test — Leabhraichean (Books) vertical sandbox.
// Tonal quality: dark brassy gold — old leather binding, lamplight on ink.
// Centre content: horizontal library-aisle shelves of books, one row
// per genre (New Releases / Fiction / Poetry / Non-fiction / Children's /
// Language / History). Cover-first cards, horizontal scroll per shelf.
//
// Server component: fetches the catalog from sruth-backend at build /
// ISR revalidation time, passes it as a prop to the (client) wall.
// Editors curate books in sruth-admin → Leabhraichean Books.

export const metadata = {
  title: 'Leabhraichean · An Tonn — sandbox',
  description: 'Leabhraichean (Books) vertical test surface for the An Tonn wing.',
}

// Palette: dark brassy gold still water, ripples peak toward a warm
// polished-brass — lamp catching gold leaf on an old spine.
export default async function LeabhraicheanTest() {
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
