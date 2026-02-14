import { useNavigate } from 'react-router-dom'
import './Content.css'

function Content() {
  const navigate = useNavigate()

  const contentCards = [
    {
      id: 'neurodiversity',
      title: '🧠 Understanding Neurodiversity',
      description: 'Explore how neurotypical and neurodivergent individuals experience different aspects of cognition and daily life.',
      path: '/content/neurodiversity'
    },
    {
      id: 'sensory',
      title: '🌈 Sensory Differences',
      description: 'Learn about hyposensitivity and hypersensitivity across all eight senses in neurodivergent individuals.',
      path: '/content/sensory-differences'
    }
  ]

  return (
    <div className="content-landing-page">
      <div className="content-landing-container">
        <h1>📚 Content & Resources</h1>
        <p className="content-landing-subtitle">
          Learn more about neurodiversity, inclusive education, and our community values
        </p>

        <div className="content-cards-grid">
          {contentCards.map(card => (
            <div
              key={card.id}
              className="content-landing-card"
              onClick={() => navigate(card.path)}
            >
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <div className="card-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Content
