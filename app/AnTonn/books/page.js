import ComingSoon from "../_components/ComingSoon";

export const metadata = {
  title: "An Tonn — Books",
  description: "Leabhraichean Air An Tonn — Books Riding The Wave. Full vertical coming soon.",
};

export default function AnTonnBooks() {
  return (
    <ComingSoon
      eta="Week 3 · Opening 23 June 2026"
      title="Leabhraichean Air An Tonn"
      subtitle="Books Riding The Wave — the full literary current"
      body={
        <>
          <p style={{ margin: "0 0 16px" }}>
            Scottish and Gàidhlig publishing has its own pulse — Birlinn and Acair and the
            Gaelic Books Council, Polygon, John Donald, Stornoway's own presses. The full books
            vertical will hold every title we're tracking with proper purchase links, the
            Leabhar na Bliadhna shortlist as it's announced, author features, and a rolling
            calendar of new releases.
          </p>
          <p style={{ margin: 0 }}>
            The four titles featured on this week's hub are just the cover. The shelf opens
            with Issue 003.
          </p>
        </>
      }
    />
  );
}
