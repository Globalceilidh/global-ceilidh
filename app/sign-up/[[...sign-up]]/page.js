// Embedded Clerk sign-up — pair to /sign-in. See that file's header
// for the reason we're not using the Account Portal.

import { SignUp } from '@clerk/nextjs';

export const metadata = {
  title: 'Join — GlobalCeilidh.com',
  description: 'Fàilte. Create your Global Ceilidh account.',
};

export default function Page() {
  return (
    <main style={wrapStyle}>
      <div style={fkStyle}>
        <h1 style={welcomeStyle}>Fàilte</h1>
        <p style={subtitleStyle}>Join Global Ceilidh</p>
      </div>
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
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
