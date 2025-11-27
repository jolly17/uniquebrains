// Generate a consistent color gradient based on course category
export function generateCourseImage(category) {
  const gradients = {
    parenting: ['#667eea', '#764ba2'],
    music: ['#f093fb', '#f5576c'],
    dance: ['#4facfe', '#00f2fe'],
    drama: ['#43e97b', '#38f9d7'],
    art: ['#fa709a', '#fee140'],
    language: ['#ff6b6b', '#feca57'],
    default: ['#667eea', '#764ba2']
  }

  const gradient = gradients[category] || gradients.default
  
  return {
    gradient: gradient,
    style: {
      background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }
  }
}

// Generate category icon emoji
export function getCategoryIcon(category) {
  const icons = {
    parenting: '👨‍👩‍👧‍👦',
    music: '🎵',
    dance: '💃',
    drama: '🎭',
    art: '🎨',
    language: '🌍',
    default: '📚'
  }
  
  return icons[category] || icons.default
}
