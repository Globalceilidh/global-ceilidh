import ComingSoon from "../_components/ComingSoon";

export const metadata = {
  title: "An Tonn — Film & TV",
  description: "Coverage of Gàidhlig and Scottish film and television — coming later this year.",
};

export default function AnTonnFilm() {
  return (
    <ComingSoon
      activeSlug="An Tonn"
      eta="Later in 2026"
      title="Film & TV"
      subtitle="The screen current — coming later this year"
      body={
        <p style={{ margin: 0 }}>
          BBC Alba productions, Gàidhlig short films, festival picks, streaming releases —
          everything moving on the screen for the Scottish-interested viewer anywhere. This
          vertical opens once the music, books, and podcasts sections are running cleanly.
        </p>
      }
    />
  );
}
