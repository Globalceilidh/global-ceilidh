import TestSurface from '../_components/TestSurface'
import CeolCharts from './CeolCharts'

// /AnTonn/ceol — Ceòl (Music). The music CHART: the ledger-scored artist
// Top-10s, one per surfaced (tier × genre) list under An Tonn doctrine v2.
// Fetched server-side from sruth-backend and rendered inside the navy
// TestSurface (wave shader + An Tonn chrome). ISR-cached at the edge.

export const metadata = {
  title: 'Ceòl · An Tonn',
  description: 'Ceòl (Music) — the An Tonn music charts: Gael & Celtic Top 10s by genre.',
}

const RAILWAY_URL =
  process.env.NEXT_PUBLIC_SRUTH_API ||
  'https://insightful-purpose-production-faf9.up.railway.app'

async function loadCharts() {
  try {
    const res = await fetch(`${RAILWAY_URL}/antonn/ceol/charts?days=90&min_entries=10`, {
      next: { revalidate: 300 }, // edge-cached 5 min
    })
    if (res.ok) return await res.json()
  } catch (err) {
    console.error('[ceol] loadCharts failed:', err)
  }
  return { lists: [] }
}

export default async function Ceol() {
  const data = await loadCharts()
  return (
    <TestSurface background="#0B1739" waveMod="#3A6ACF">
      <CeolCharts data={data} />
    </TestSurface>
  )
}
