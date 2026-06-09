import ComingSoon from "../_components/ComingSoon";

export const metadata = {
  title: "An Tonn — Vote & Suggest",
  description: "Vote for next week's wave and suggest artists, books, and podcasts we should be tracking.",
};

export default function AnTonnVote() {
  return (
    <ComingSoon
      activeSlug="Vote"
      eta="Opening with Issue 002 · 16 June 2026"
      title="Vote & Suggest"
      subtitle="Help shape next week's wave"
      body={
        <>
          <p style={{ margin: "0 0 16px" }}>
            Two things, both on their way. <strong>Vote</strong> — pick your favourite artist,
            song, book or podcast from the week's listings. <strong>Suggest</strong> — tell us
            who we should be tracking next: artists, releases, festivals, books, podcasts we
            haven't featured.
          </p>
          <p style={{ margin: 0 }}>
            Not a comment section — a structured way for the diaspora to push real names into
            the editorial pool. Approved suggestions surface in the following week's rankings
            and shape what we cover in the verticals.
          </p>
        </>
      }
    />
  );
}
