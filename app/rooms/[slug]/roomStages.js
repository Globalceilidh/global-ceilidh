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
  background: '/rooms/boardroom-north.png',
  // Two benches receding toward the door — nearer seats lower + wider.
  seats: [
    { x: 17, y: 62, width: 15, rotation: 4 },
    { x: 29, y: 53, width: 12, rotation: 3 },
    { x: 38, y: 47, width: 10, rotation: 2 },
    { x: 83, y: 62, width: 15, rotation: -4 },
    { x: 71, y: 53, width: 12, rotation: -3 },
    { x: 62, y: 47, width: 10, rotation: -2 },
  ],
};

const STAGES = {
  'coinneamh-a-bhuird': BOARDROOM,
  'an-cidsin': BOARDROOM, // reuse for now until An Cidsin gets its own art
};

export function getRoomStage(slug) {
  return STAGES[slug] || BOARDROOM;
}
