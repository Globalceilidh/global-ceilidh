// app/rooms/[slug]/roomStages.js
// The Ceilidh Room "stage" engine config. Each room is just a photoreal
// background + seat coordinates (+ later, clickable hotspots). One
// <CeilidhStage> renders them all — An Cidsin, the Boardroom, the classroom,
// the pub, the children's room — by swapping this config only.
//
// Seat coords are PERCENTAGES of the background image box (not the viewport),
// so tiles stay glued to the render as the stage letterboxes to fit. x/y are
// the seat centre; width is the tile width as a % of the stage; rotation tilts
// the portrait into the room's perspective. Tune these by eye against the art.

const BOARDROOM = {
  background: '/rooms/boardroom.png',
  // Three seats per side, mirrored across the room's centre line. Order
  // interleaves sides so people fill in facing each other: you front-left,
  // then the seat across from you, then working back down each bench.
  // Nearer seats sit lower + wider; they recede toward the door.
  seats: [
    { x: 11, y: 71, width: 17, rotation: 6 },   // 1 — you (front-left)
    { x: 89, y: 71, width: 17, rotation: -6 },  // 2 — across from you (mirror)
    { x: 26, y: 58, width: 13, rotation: 4 },   // 3 — mid-left
    { x: 74, y: 58, width: 13, rotation: -4 },  // 4 — mid-right
    { x: 38, y: 47, width: 10, rotation: 2 },   // 5 — back-left
    { x: 62, y: 47, width: 10, rotation: -2 },  // 6 — back-right
  ],
};

const STAGES = {
  'coinneamh-a-bhuird': BOARDROOM,
  'an-cidsin': BOARDROOM, // reuse for now until An Cidsin gets its own art
};

export function getRoomStage(slug) {
  return STAGES[slug] || BOARDROOM;
}
