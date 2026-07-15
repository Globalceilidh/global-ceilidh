// Book catalog for /AnTonn/leabhraichean/test.
//
// Sourced from sruth-backend's `/books?vertical=leabhraichean` endpoint,
// which reads the gc_books Supabase table. Editors curate the catalog
// in sruth-admin → "Leabhraichean Books"; no code edits needed to add
// or remove books.
//
// The endpoint is cached at the Vercel edge for 5 minutes so we don't
// hit Railway on every visitor — after an editorial change, users see
// the new book within 5 minutes of publish.
//
// Backend response shape (per row from gc_books):
//   {
//     id, vertical, category, isbn, title, author, publisher, year,
//     cover_url, link_url, description, display_order, is_published
//   }
//
// We normalise into the shape BookshelfWall.js expects — `coverUrl`
// mirrors cover_url, `linkUrl` mirrors link_url. Cover fallback via
// OpenLibrary ISBN URL is handled by coverFor() below.

export const GENRES = [
  { slug: 'top-10-week',  en: 'GC Top 10 of the Week',    gd: 'Deich as Fheàrr na Seachdain' },
  { slug: 'new-releases', en: 'New Releases',             gd: 'Foillseachaidhean Ùra' },
  { slug: 'fiction',      en: 'Fiction',                  gd: 'Ficsean' },
  { slug: 'sci-fi',       en: 'Science Fiction',          gd: 'Ficsean-saidheans' },
  { slug: 'non-fiction',  en: 'Non-fiction',              gd: 'Neo-fhicsean' },
  { slug: 'children',     en: "Children's Literature",    gd: 'Litreachas Chloinne' },
  { slug: 'poetry',       en: 'Poetry',                   gd: 'Bàrdachd' },
  { slug: 'history',      en: 'History',                  gd: 'Eachdraidh' },
  { slug: 'language',     en: 'Gàidhlig Language Learning', gd: 'Ionnsachadh na Gàidhlig' },
]

const CATEGORIES = GENRES.map((g) => g.slug)

const RAILWAY_URL =
  process.env.NEXT_PUBLIC_SRUTH_API ||
  'https://insightful-purpose-production-faf9.up.railway.app'

// Async loader — used by the page's server component. Returns a
// normalised { category: [books] } catalog. Falls back to an empty
// catalog on any error so a Railway blip doesn't blank the wall.
export async function loadCatalog() {
  try {
    const res = await fetch(`${RAILWAY_URL}/books?vertical=leabhraichean`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`books api ${res.status}`)
    const raw = await res.json()
    const out = {}
    for (const cat of CATEGORIES) {
      const rows = raw?.[cat] || []
      out[cat] = rows.map(normaliseRow)
    }
    return out
  } catch (err) {
    console.error('[leabhraichean/test] loadCatalog failed:', err)
    return Object.fromEntries(CATEGORIES.map((c) => [c, []]))
  }
}

function normaliseRow(row) {
  return {
    id: row.id,
    isbn: row.isbn || undefined,
    title: row.title,
    author: row.author || undefined,
    publisher: row.publisher || undefined,
    year: row.year || undefined,
    coverUrl: row.cover_url || undefined,
    linkUrl: row.link_url || undefined,
    description: row.description || undefined,
  }
}

// Kept for backward compatibility if the wall is imported without a
// catalog prop; empty by default so no stale data leaks.
export const BOOK_CATALOG = {
  'top-10-week': [],
  'new-releases': [],
  fiction: [],
  'sci-fi': [],
  'non-fiction': [],
  children: [],
  poetry: [],
  history: [],
  language: [],
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
