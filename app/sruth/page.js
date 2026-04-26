import SruthForm from '@/components/SruthForm';

export default function SruthSignup() {
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
          src="/sruth_sign_up.png"
          alt="sruth. — Sign up"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center center',
            display: 'block',
          }}
        />
        <SruthForm />
      </div>
    </div>
  );
}
