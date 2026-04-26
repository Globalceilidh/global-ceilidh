'use client';

export default function ComingSoon() {
  function goToSruth(e) {
    e.preventDefault();
    window.location.href = '/sruth';
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img
          src="/GC-Comingsoon_2.png"
          alt="sruth. — GlobalCeilidh is coming soon"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center center',
            display: 'block',
          }}
        />

        {/* Hotspot: "sruth." wordmark at top */}
        <a href="/sruth" onClick={goToSruth} aria-label="Sign up for sruth."
          style={{
            position: 'absolute',
            top: '5%', left: '25%',
            width: '50%', height: '16%',
            display: 'block', cursor: 'pointer',
          }}
        />

        {/* Hotspot: "t-srutha" in the sentence */}
        <a href="/sruth" onClick={goToSruth} aria-label="Sign up for sruth."
          style={{
            position: 'absolute',
            top: '62%', left: '66%',
            width: '22%', height: '7%',
            display: 'block', cursor: 'pointer',
          }}
        />

        {/* Hotspot: entire lower text block (t-srutha sentence through sruth. tagline) */}
        <a href="/sruth" onClick={goToSruth} aria-label="Sign up for sruth."
          style={{
            position: 'absolute',
            top: '60%', left: '20%',
            width: '60%', height: '30%',
            display: 'block', cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
}
