// Video catalog for /AnTonn/bhidio/test.
//
// Add videos here — the wall reads from this file, no other edits
// needed. When we're ready to move to database-driven content, only
// the loader here changes; the data shape stays the same.
//
// Shape of each entry:
//   {
//     id:       'YouTube video ID'  (e.g. 'dQw4w9WgXcQ')
//                — the string after "?v=" in a normal youtube.com URL
//                — YouTube gives us the thumbnail free at
//                  https://img.youtube.com/vi/{id}/hqdefault.jpg
//     title:    'Display title'
//     duration: 'H:MM' or 'M:SS' — shown on the card corner
//     artist:   'Optional artist / creator name'
//     source:   'youtube' | 'own' | 'submitted'
//                — 'youtube' plays via a YouTube iframe
//                — 'own' and 'submitted' will play via a <video>
//                  element once the storage pipeline is wired
//     videoUrl: 'https://…' — only needed for 'own' / 'submitted'
//                sources; ignored for 'youtube'
//     poster:   'https://…' — only needed if source !== 'youtube';
//                 for 'youtube' the thumbnail is derived from `id`
//   }
//
// Category keys must match the slugs in VideoWallCurved.js:
//   music · educational · comedy · drama · documentary · live

export const VIDEO_CATALOG = {
  music: [],
  educational: [],
  comedy: [],
  drama: [],
  documentary: [],
  live: [
    // First live-sessions video — drop the real ID + title in here.
    // {
    //   id: 'REPLACE_WITH_YOUTUBE_ID',
    //   title: '',
    //   duration: '0:00',
    //   artist: '',
    //   source: 'youtube',
    // },
  ],
}
