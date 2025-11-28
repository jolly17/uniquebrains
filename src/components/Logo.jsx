function Logo({ size = 'medium' }) {
  const sizes = {
    small: { height: 40 },
    medium: { height: 60 },
    large: { height: 80 }
  }

  const { height } = sizes[size]

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img 
        src="/uniquebrains-logo.png.png" 
        alt="UniqueBrains" 
        style={{ height: `${height}px`, width: 'auto' }}
      />
    </div>
  )
}

export default Logo
