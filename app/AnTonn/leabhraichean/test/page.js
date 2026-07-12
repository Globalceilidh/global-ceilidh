import TestSurface from '../../_components/TestSurface'
import BookshelfWall from './BookshelfWall'

// /AnTonn/leabhraichean/test — Leabhraichean (Books) vertical sandbox.
// Tonal quality: dark brassy gold — old leather binding, lamplight on ink.
// Centre content: horizontal library-aisle shelves of books, one row
// per genre (Fiction / Poetry / Non-fiction / Children's / Language /
// History). Cover-first cards, horizontal scroll per shelf.

export const metadata = {
  title: 'Leabhraichean · An Tonn — sandbox',
  description: 'Leabhraichean (Books) vertical test surface for the An Tonn wing.',
}

// Palette: dark brassy gold still water, ripples peak toward a warm
// polished-brass — lamp catching gold leaf on an old spine.
export default function LeabhraicheanTest() {
  return (
    <TestSurface
      background="#2E2108"
      waveMod="#C69A2A"
      wordmarkText="Leabhraichean"
    >
      <BookshelfWall />
    </TestSurface>
  )
}
