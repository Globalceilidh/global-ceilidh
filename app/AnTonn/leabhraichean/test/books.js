// Book catalog for /AnTonn/leabhraichean/test.
//
// Frontend-only placeholder for now — moves to sruth-backend +
// admin editorial workflow once the layout is approved (same
// path we took with Bhidio Videos).
//
// Per-entry shape:
//   {
//     id:        'stable id (isbn preferred, else uuid)',
//     title:     'Book title',
//     author:    'Author name',
//     isbn:      '9781000000000'   (optional — enables auto-cover)
//     coverUrl:  'https://…'       (optional — explicit override)
//     linkUrl:   'https://…'       (bookseller / review / library link)
//     year:      2026              (optional; shown under the cover)
//   }
//
// When `isbn` is set and no `coverUrl` is provided, we derive the
// cover from OpenLibrary:
//   https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg

export const GENRES = [
  { slug: 'new-releases', en: 'New Releases',      gd: 'Foillseachaidhean Ùra' },
  { slug: 'fiction',      en: 'Fiction',           gd: 'Ficsean' },
  { slug: 'poetry',       en: 'Poetry',            gd: 'Bàrdachd' },
  { slug: 'non-fiction',  en: 'Non-fiction',       gd: 'Neo-fhicsean' },
  { slug: 'children',     en: "Children's",        gd: 'Cloinne' },
  { slug: 'language',     en: 'Gaelic Language',   gd: 'Cànan' },
  { slug: 'history',      en: 'History',           gd: 'Eachdraidh' },
]

export const BOOK_CATALOG = {
  'new-releases': [],
  fiction: [],
  poetry: [],
  'non-fiction': [],
  children: [],
  language: [],
  history: [],
}

const MIN_SLOTS_PER_SHELF = 8

export function getBooks(catalog, slug) {
  const real = catalog?.[slug] || []
  const padCount = Math.max(0, MIN_SLOTS_PER_SHELF - real.length)
  const slots = Array.from({ length: padCount }, (_, i) => ({
    id: `${slug}-slot-${i + 1}`,
    isSlot: true,
  }))
  return [...real, ...slots]
}

// Derives the OpenLibrary cover URL for a book when a direct coverUrl
// isn't provided. Falls back to null so callers can render a slot
// or a text-only cover.
export function coverFor(book) {
  if (!book) return null
  if (book.coverUrl) return book.coverUrl
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`
  return null
}
