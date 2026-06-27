'use client'

// Shared close button used by every overlay (detail panel, Air an Tonn,
// filter panel). Cribs from Phantom's signature 45° rotation on hover —
// uses a CSS variable for the rotation amount so we can also animate it
// during the closing transition.

export default function CloseButton({ onClick, size = 'md', label = 'Close', position = 'top-right' }) {
  const dims = size === 'lg' ? 44 : size === 'sm' ? 32 : 38

  const positionStyle = {
    'top-right':    { position: 'absolute', top: 18, right: 18 },
    'top-left':     { position: 'absolute', top: 18, left: 18 },
    'bottom-right': { position: 'absolute', bottom: 18, right: 18 },
    'none':         {},
  }[position]

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="antonn-close-btn"
      style={{
        ...positionStyle,
        width: dims, height: dims,
        borderRadius: '50%',
        background: 'rgba(242, 236, 220, 0.06)',
        border: '1px solid rgba(242, 236, 220, 0.45)',
        color: '#F2ECDC',
        fontSize: size === 'lg' ? 22 : 16,
        lineHeight: 1,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), background 200ms ease, border-color 200ms ease',
        padding: 0,
        zIndex: 100,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'rotate(45deg)'
        e.currentTarget.style.background = 'rgba(201, 160, 71, 0.18)'
        e.currentTarget.style.borderColor = 'rgba(201, 160, 71, 0.7)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'rotate(0)'
        e.currentTarget.style.background = 'rgba(242, 236, 220, 0.06)'
        e.currentTarget.style.borderColor = 'rgba(242, 236, 220, 0.45)'
      }}
    >
      ×
    </button>
  )
}
