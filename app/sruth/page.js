import SruthForm from '../../components/SruthForm';

export default function SruthSignup() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundImage: 'url(/sruth_sign_up.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, "Times New Roman", serif',
    }}>

      {/* sruth. wordmark — top, matching the graphic */}
      <div style={{
        position: 'absolute',
        top: 0,
        width: '100%',
        textAlign: 'center',
        paddingTop: '2vh',
        lineHeight: 1,
      }}>
        <span style={{
          fontSize: 'clamp(64px, 11vw, 130px)',
          fontStyle: 'italic',
          fontWeight: '900',
          color: '#111',
          borderBottom: '3px solid #111',
          paddingBottom: '4px',
          display: 'inline-block',
        }}>sruth.</span>
      </div>

      {/* Main content — centred over the deckchair area */}
      <div style={{
        textAlign: 'center',
        color: '#fff',
        maxWidth: '660px',
        width: '90%',
        marginTop: '8vh',
        textShadow: '0 1px 6px rgba(0,0,0,0.55)',
      }}>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontStyle: 'italic',
          fontWeight: '400',
          margin: '0 0 18px',
        }}>Sin sibh!</h1>

        <p style={{
          fontSize: 'clamp(13px, 1.6vw, 17px)',
          fontStyle: 'italic',
          lineHeight: 1.75,
          margin: '0 0 16px',
        }}>
          &lsquo;S math gu bheil sibh an seo. Cuir do chasan anns an uisge bhlàth&hellip;<br />
          gabh snàmh beag. Tha e saor an-asgaidh &lsquo;s chan eil duine<br />
          a&rsquo; coimhead (fhathast). Bidh an Cèilidh a&rsquo; tòiseachadh<br />
          a dh&rsquo;aithghearr&mdash;agus gus an uairsin, rach leis an t-sruth!
        </p>

        <p style={{
          fontSize: 'clamp(12px, 1.4vw, 15px)',
          margin: '0 0 24px',
          opacity: 0.92,
        }}>
          A daily current of Gàidhlig language news, culture, learning, and events.
        </p>

        <SruthForm />

        <p style={{
          marginTop: '14px',
          fontSize: '14px',
          opacity: 0.85,
        }}>
          No noise. Just the current. Daily.
        </p>

        <p style={{
          marginTop: '28px',
          fontSize: '13px',
          opacity: 0.65,
        }}>
          Globalceilidh.com launches soon.
        </p>
      </div>
    </div>
  );
}
