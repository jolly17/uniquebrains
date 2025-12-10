/**
 * Neurodiversity Badges Component
 * 
 * Displays neurodiversity profile badges for instructors and students
 */

import './NeurodiversityBadges.css'

const neurodiversityLabels = {
  autism: 'Autism Spectrum',
  adhd: 'ADHD',
  dyslexia: 'Dyslexia',
  dysgraphia: 'Dysgraphia',
  dyscalculia: 'Dyscalculia',
  other: 'Other'
}

const neurodiversityColors = {
  autism: '#4A90E2',
  adhd: '#F5A623',
  dyslexia: '#7ED321',
  dysgraphia: '#9013FE',
  dyscalculia: '#FF6B6B',
  other: '#6C757D'
}

function NeurodiversityBadges({ profile, size = 'medium', showLabel = true }) {
  if (!profile || !profile.length) {
    return null
  }

  return (
    <div className={`neurodiversity-badges ${size}`}>
      {showLabel && <span className="badges-label">Neurodiversity Profile:</span>}
      <div className="badges-list">
        {profile.map((item, index) => (
          <span 
            key={index}
            className="neurodiversity-badge"
            style={{ 
              backgroundColor: neurodiversityColors[item] || neurodiversityColors.other,
              color: 'white'
            }}
          >
            {neurodiversityLabels[item] || item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default NeurodiversityBadges