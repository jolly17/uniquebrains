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
        src={`${import.meta.env.BASE_URL}uniquebrains-logo.png.png`}
        alt="UniqueBrains" 
        style={{ height: `${height}px`, width: 'auto' }}
        onError={(e) => {
          e.target.style.display = 'none'
          e.target.parentElement.innerHTML = '<span style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">UniqueBrains</span>'
        }}
      />
    </div>
  )
}

export default Logo
