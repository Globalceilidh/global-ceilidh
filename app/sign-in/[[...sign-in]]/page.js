// Embedded Clerk sign-in — replaces the Account Portal flow on
// accounts.globalceilidh.com because the __session cookie from that
// subdomain doesn't propagate to apex/www, so the /rooms auth gate
// (and everything else that needs a signed-in user server-side) was
// getting null. Embedded sign-in on the app domain means cookies land
// on globalceilidh.com directly and every server component can read
// them via auth().
//
// The [[...sign-in]] catch-all is required by Clerk so its internal
// steps (verifications, factor selection, MFA) can route as
// /sign-in/factor-one etc. without a 404.

import { SignIn } from '@clerk/nextjs';

export const metadata = {
  title: 'Sign in — GlobalCeilidh.com',
  description: 'Fàilte air ais. Sign in to your Global Ceilidh account.',
};

export default function Page() {
  return (
    <main style={wrapStyle}>
      <div style={fkStyle}>
        <h1 style={welcomeStyle}>Fàilte air ais</h1>
        <p style={subtitleStyle}>Sign in to Global Ceilidh</p>
      </div>
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        appearance={{
          variables: {
            colorPrimary: '#1A3A2A',
            colorText: '#1A1A1A',
            colorBackground: '#FFFFFF',
            fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
            borderRadius: '4px',
          },
          elements: {
            card: { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
            formButtonPrimary: {
              backgroundColor: '#1A3A2A',
              fontFamily: '"Bebas Neue", Impact, sans-serif',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontSize: '16px',
            },
          },
        }}
      />
    </main>
  );
}

const wrapStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 24px',
  background: '#F5F0E8',
  fontFamily: 'Georgia, serif',
};

const fkStyle = {
  textAlign: 'center',
  marginBottom: 28,
};

const welcomeStyle = {
  fontFamily: '"Fraunces", "EB Garamond", Georgia, serif',
  fontStyle: 'italic',
  fontWeight: 700,
  fontSize: 34,
  color: '#1A3A2A',
  margin: 0,
};

const subtitleStyle = {
  marginTop: 6,
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: 11,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '#6B4E1F',
};
