'use client'

// Library-aisle layout for /AnTonn/leabhraichean/test.
//
// Vertical stack of horizontal "shelves" — one per genre. Each shelf
// has a bilingual Bebas Neue header on the left and a row of portrait
// book covers scrolling horizontally to the right. Cover images are
// 2:3 portrait so they read as physical books; a wooden shelf-edge
// line runs beneath each row for the library-aisle feel.
//
// Content is placeholder for now (see books.js). Real books come
// from an editorial catalog in sruth-admin later, same pattern the
// Bhidio wall uses.

import { useLanguage } from '../../../../context/LanguageContext'
import { GENRES, BOOK_CATALOG, getBooks, coverFor } from './books'

export default function BookshelfWall({ catalog = BOOK_CATALOG }) {
  const { language } = useLanguage()

  return (
    <div style={wallStyle}>
      {GENRES.map((genre) => {
        const books = getBooks(catalog, genre.slug)
        return (
          <Shelf
            key={genre.slug}
            label={language === 'gd' ? genre.gd : genre.en}
            books={books}
          />
        )
      })}
    </div>
  )
}

function Shelf({ label, books }) {
  return (
    <section style={shelfStyle}>
      <h2 style={shelfHeaderStyle}>{label}</h2>
      <div style={shelfRowStyle}>
        {books.map((b) => (b.isSlot ? <BookSlot key={b.id} /> : <BookCard key={b.id} book={b} />))}
      </div>
      <div style={shelfLineStyle} />
    </section>
  )
}

function BookCard({ book }) {
  const cover = coverFor(book)
  const inner = (
    <div style={bookInnerStyle}>
      <div
        style={{
          ...coverStyle,
          ...(cover
            ? { backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}),
        }}
      >
        {!cover && (
          <div style={coverFallbackTextStyle}>
            <p style={coverFallbackTitleStyle}>{book.title}</p>
            <p style={coverFallbackAuthorStyle}>{book.author}</p>
          </div>
        )}
      </div>
      <div style={metaStyle}>
        <div style={titleStyle}>{book.title}</div>
        <div style={authorStyle}>{book.author}</div>
        {book.year && <div style={yearStyle}>{book.year}</div>}
      </div>
    </div>
  )
  if (book.linkUrl) {
    return (
      <a href={book.linkUrl} target="_blank" rel="noopener noreferrer" style={bookLinkStyle}>
        {inner}
      </a>
    )
  }
  return <div style={bookLinkStyle}>{inner}</div>
}

// Empty book slot — dashed 2:3 portrait rectangle, no imagery.
function BookSlot() {
  return <div style={bookSlotStyle} aria-hidden="true" />
}

// ── Styles ───────────────────────────────────────────────────────────

const wallStyle = {
  position: 'fixed',
  top: 130,
  bottom: 100,
  left: 12,
  right: 12,
  overflowY: 'auto',
  padding: '0 8px',
  zIndex: 2,
  // The bookshelf area doesn't need pointerEvents: none because it
  // relies on native scrolling; the wave shader beneath still gets
  // pointer moves via the outer TestSurface handler.
}

const shelfStyle = {
  padding: '12px 0 0',
  marginBottom: 8,
}

const shelfHeaderStyle = {
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  fontSize: 22,
  fontWeight: 400,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'rgba(242, 236, 220, 0.92)',
  margin: '0 4px 10px',
}

const shelfRowStyle = {
  display: 'flex',
  gap: 18,
  overflowX: 'auto',
  overflowY: 'hidden',
  padding: '4px 4px 14px',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(242,236,220,0.18) transparent',
}

// The shelf-edge line under each row — a warm brass gradient with
// a subtle drop-shadow to feel like a physical shelf.
const shelfLineStyle = {
  height: 2,
  background:
    'linear-gradient(90deg, rgba(198,154,42,0), rgba(198,154,42,0.75) 8%, rgba(198,154,42,0.75) 92%, rgba(198,154,42,0))',
  boxShadow: '0 6px 12px -6px rgba(0, 0, 0, 0.65)',
  margin: '0 4px 18px',
}

const bookLinkStyle = {
  flex: '0 0 auto',
  width: 148,
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer',
  transition: 'transform 220ms ease',
}

const bookInnerStyle = {
  display: 'flex',
  flexDirection: 'column',
}

// Portrait 2:3, subtle spine-shadow at the sides so covers read as
// books on a shelf rather than flat rectangles.
const coverStyle = {
  width: '100%',
  aspectRatio: '2 / 3',
  background: 'linear-gradient(180deg, rgba(60, 42, 12, 0.85), rgba(28, 20, 6, 0.95))',
  borderRadius: 3,
  boxShadow:
    '0 8px 20px rgba(0,0,0,0.55),' +
    'inset 4px 0 8px -6px rgba(0,0,0,0.55),' +
    'inset -4px 0 8px -6px rgba(0,0,0,0.55)',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'flex-end',
}

const coverFallbackTextStyle = {
  padding: '10px 10px 14px',
  color: 'rgba(242, 236, 220, 0.92)',
  width: '100%',
}
const coverFallbackTitleStyle = {
  margin: '0 0 6px',
  fontFamily: 'Fraunces, Georgia, serif',
  fontStyle: 'italic',
  fontWeight: 700,
  fontSize: 15,
  lineHeight: 1.2,
}
const coverFallbackAuthorStyle = {
  margin: 0,
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10,
  letterSpacing: 1,
  color: 'rgba(242, 236, 220, 0.65)',
  textTransform: 'uppercase',
}

const metaStyle = { padding: '10px 2px 4px' }
const titleStyle = {
  fontFamily: 'Fraunces, Georgia, serif',
  fontStyle: 'italic',
  fontSize: 13,
  color: 'rgba(242, 236, 220, 0.94)',
  lineHeight: 1.3,
  marginBottom: 2,
}
const authorStyle = {
  fontFamily: 'var(--font-ibm-plex-sans), "IBM Plex Sans", system-ui, sans-serif',
  fontSize: 11,
  color: 'rgba(242, 236, 220, 0.68)',
  letterSpacing: '0.03em',
}
const yearStyle = {
  fontFamily: '"IBM Plex Mono", Menlo, monospace',
  fontSize: 10,
  color: 'rgba(242, 236, 220, 0.5)',
  letterSpacing: '0.1em',
  marginTop: 2,
}

// Empty portrait slot — dashed 2:3 rectangle.
const bookSlotStyle = {
  flex: '0 0 auto',
  width: 148,
  aspectRatio: '2 / 3',
  border: '1px dashed rgba(242, 236, 220, 0.12)',
  borderRadius: 3,
  background: 'rgba(46, 33, 8, 0.18)',
}
