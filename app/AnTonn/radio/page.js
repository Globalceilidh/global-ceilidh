import ComingSoon from "../_components/ComingSoon";

export const metadata = {
  title: "An Tonn — Radio",
  description: "An Tonn Radio — the future streaming station for the global Gaelic current.",
};

export default function AnTonnRadio() {
  return (
    <ComingSoon
      eta="In planning — later in 2026"
      title="An Tonn Radio"
      subtitle="A 24/7 streaming current for Gaelic and Scottish music"
      body={
        <>
          <p style={{ margin: "0 0 16px" }}>
            The station you'd want playing all day in a café in Sydney, a kitchen in Cape
            Breton, or a car between Inverness and Skye. Curated by Sruth editorial, with
            scheduled programmes, live sessions, and the Top 50 in heavy rotation.
          </p>
          <p style={{ margin: 0 }}>
            We're scoping licensing (PRS / PPL / SoundExchange) and infrastructure now. If
            you've worked in small-broadcaster licensing and want to help shape this, write to{" "}
            <a
              href="mailto:sruth_editors@globalceilidh.com?subject=An Tonn Radio"
              style={{ color: "#6B4E1F" }}
            >
              sruth_editors@globalceilidh.com
            </a>
            .
          </p>
        </>
      }
    />
  );
}
