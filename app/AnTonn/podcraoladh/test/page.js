import TestSurface from '../../_components/TestSurface'

// /AnTonn/podcraoladh/test — Pod-chraoladh (Podcasts) vertical sandbox.
// Tonal quality: deep purple — the studio after hours, the mic still hot.
// URL segment uses the un-hyphenated Gàidhlig id (matches marble's PILL ids).

export const metadata = {
  title: 'Pod-chraoladh · An Tonn — sandbox',
  description: 'Pod-chraoladh (Podcasts) vertical test surface for the An Tonn wing.',
}

// Palette: deep purple still water, ripples peak toward a lit violet —
// mixing console after hours, glowing keys.
export default function PodcraoladhTest() {
  return <TestSurface background="#180831" waveMod="#7139D6" />
}
