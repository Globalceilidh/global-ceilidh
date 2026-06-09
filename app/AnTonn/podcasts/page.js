import ComingSoon from "../_components/ComingSoon";

export const metadata = {
  title: "An Tonn — Podcasts",
  description: "Podcast rankings and reviews for the Gaelic and Scottish-trad world.",
};

export default function AnTonnPodcasts() {
  return (
    <ComingSoon
      activeSlug="Podcasts"
      eta="Week 4 · Opening 30 June 2026"
      title="Podcasts"
      subtitle="The listen list — what's worth your ears this week"
      body={
        <>
          <p style={{ margin: "0 0 16px" }}>
            Fad Botal Fìon. Big Gaels Don't Cry. Litir do Luchd-ionnsachaidh. SpeakGaelic. The
            Gaelic podcast landscape is small but unreasonably good, and the wider Scottish-
            cultural podcast world keeps growing. The podcasts vertical will rank, review, and
            link every one of them worth your time.
          </p>
          <p style={{ margin: 0 }}>
            Opens with Issue 004.
          </p>
        </>
      }
    />
  );
}
