import './NeurodiversityBadge.css'

function NeurodiversityBadge({ profile, otherNeeds }) {
  const profileLabels = {
    autism: 'Autism',
    adhd: 'ADHD',
    dyslexia: 'Dyslexia',
    multiple: 'Multiple',
    other: 'Other'
  }

  if (!profile || profile.length === 0) {
    return null
  }

  return (
    <div className="neurodiversity-badges">
      {profile.map(item => (
        <span key={item} className="neurodiversity-badge" title={item === 'other' && otherNeeds ? otherNeeds : ''}>
          {profileLabels[item] || item}
        </span>
      ))}
    </div>
  )
}

export default NeurodiversityBadge
