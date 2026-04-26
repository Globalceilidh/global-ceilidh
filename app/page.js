export default function ComingSoon() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000',
      overflow: 'hidden',
    }}>
      {/* Full-screen image with object-fit cover so it always fills the screen */}
      <img
        src="/GC-Comingsoon_1.png"
        alt="sruth. — GlobalCeilidh is coming soon"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          display: 'block',
        }}
      />

      {/* Hotspot: large "sruth." wordmark at top */}
      <a href="/sruth" aria-label="Sign up for sruth."
        style={{
          position: 'absolute',
          top: '3%',
          left: '20%',
          width: '60%',
          height: '20%',
          display: 'block',
          cursor: 'pointer',
        }}
      />

      {/* Hotspot: "t-srutha" in the sentence */}
      <a href="/sruth" aria-label="Sign up for sruth."
        style={{
          position: 'absolute',
          top: '64%',
          left: '62%',
          width: '24%',
          height: '8%',
          display: 'block',
          cursor: 'pointer',
        }}
      />

      {/* Hotspot: "sruth." in "Sign up for sruth." at bottom */}
      <a href="/sruth" aria-label="Sign up for sruth."
        style={{
          position: 'absolute',
          top: '81%',
          left: '50%',
          width: '18%',
          height: '6%',
          display: 'block',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
