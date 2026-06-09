import ComingSoon from "../_components/ComingSoon";

export const metadata = {
  title: "An Tonn — Music",
  description: "The deep vertical for An Tonn's music coverage — coming next week.",
};

export default function AnTonnMusic() {
  return (
    <ComingSoon
      activeSlug="Music"
      eta="Week 2 · Opening 16 June 2026"
      title="Music"
      subtitle="The full vertical — Spotify links, tour calendars, releases, full Top 50"
      body={
        <>
          <p style={{ margin: "0 0 16px" }}>
            The hub page carries the cover. This is the inside of the magazine — the full Top
            50, every Current's full ranking with the streaming and YouTube links you'd
            actually click, a rolling release calendar of upcoming Gaelic and Scottish-trad
            albums, and the touring map for who's playing where this season.
          </p>
          <p style={{ margin: 0 }}>
            Pilot rankings on the hub launch tonight. The deep vertical opens with Issue 002 on
            16 June.
          </p>
        </>
      }
    />
  );
}
