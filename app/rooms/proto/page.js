// app/rooms/proto/page.js
// The PixiJS room-engine prototype. A static /rooms/proto segment takes
// precedence over the [slug] room route, so this never collides with a real
// room. Client-rendered (Pixi is browser-only).

import PixiRoom from './PixiRoom';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Room prototype · Global Ceilidh',
  robots: { index: false, follow: false },
};

export default function RoomProtoPage() {
  return <PixiRoom />;
}
