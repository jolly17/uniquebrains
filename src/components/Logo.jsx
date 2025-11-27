function Logo({ size = 'medium' }) {
  const sizes = {
    small: { width: 120, height: 40, fontSize: '1.25rem' },
    medium: { width: 180, height: 50, fontSize: '1.75rem' },
    large: { width: 240, height: 60, fontSize: '2.25rem' }
  }

  const { width, height, fontSize } = sizes[size]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg width={height} height={height} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Colorful brain illustration */}
        <g>
          {/* Left hemisphere - Purple/Blue */}
          <path
            d="M30 50 Q25 35, 35 25 Q45 20, 50 25 Q50 30, 45 35 Q40 40, 35 45 Q30 50, 30 55 Q28 60, 30 65 Q32 70, 35 72 Q30 75, 28 70 Q25 65, 25 60 Q23 55, 25 50 Q27 45, 30 50Z"
            fill="#6366f1"
            opacity="0.9"
          />
          <path
            d="M35 30 Q40 25, 45 28 Q48 32, 45 36 Q42 38, 38 36 Q35 34, 35 30Z"
            fill="#8b5cf6"
            opacity="0.8"
          />
          
          {/* Right hemisphere - Pink/Orange */}
          <path
            d="M70 50 Q75 35, 65 25 Q55 20, 50 25 Q50 30, 55 35 Q60 40, 65 45 Q70 50, 70 55 Q72 60, 70 65 Q68 70, 65 72 Q70 75, 72 70 Q75 65, 75 60 Q77 55, 75 50 Q73 45, 70 50Z"
            fill="#ec4899"
            opacity="0.9"
          />
          <path
            d="M65 30 Q60 25, 55 28 Q52 32, 55 36 Q58 38, 62 36 Q65 34, 65 30Z"
            fill="#f59e0b"
            opacity="0.8"
          />
          
          {/* Center connection - Teal */}
          <ellipse cx="50" cy="50" rx="8" ry="15" fill="#14b8a6" opacity="0.7" />
          
          {/* Neural connections - dots */}
          <circle cx="40" cy="40" r="3" fill="#6366f1" />
          <circle cx="60" cy="40" r="3" fill="#ec4899" />
          <circle cx="35" cy="55" r="2.5" fill="#8b5cf6" />
          <circle cx="65" cy="55" r="2.5" fill="#f59e0b" />
          <circle cx="50" cy="35" r="2" fill="#14b8a6" />
          
          {/* Sparkle effect */}
          <path d="M50 15 L52 20 L57 20 L53 23 L55 28 L50 25 L45 28 L47 23 L43 20 L48 20 Z" fill="#fbbf24" opacity="0.9" />
          <circle cx="75" cy="35" r="2" fill="#fbbf24" opacity="0.7" />
          <circle cx="25" cy="35" r="2" fill="#fbbf24" opacity="0.7" />
        </g>
      </svg>
      
      <span style={{ 
        fontSize, 
        fontWeight: '700',
        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        UniqueBrains
      </span>
    </div>
  )
}

export default Logo
