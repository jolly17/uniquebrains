// Generate a consistent color gradient based on course category
export function generateCourseImage(category) {
  const gradients = {
    'performing-arts': ['#f093fb', '#f5576c'],
    'visual-arts': ['#fa709a', '#fee140'],
    'parenting': ['#667eea', '#764ba2'],
    'academics': ['#4facfe', '#00f2fe'],
    'language': ['#ff6b6b', '#feca57'],
    'spirituality': ['#43e97b', '#38f9d7'],
    'lifeskills': ['#feca57', '#ff6b6b'],
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
    'performing-arts': '🎭',
    'visual-arts': '🎨',
    'parenting': '👨‍👩‍👧‍👦',
    'academics': '📚',
    'language': '🌍',
    'spirituality': '🧘',
    'lifeskills': '🐷',
    default: '📚'
  }
  
  return icons[category] || icons.default
}
