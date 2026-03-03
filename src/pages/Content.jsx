import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
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
    <>
      <SEO 
        title="Neurodiversity Content & Resources | UniqueBrains"
        description="Curated articles and resources to help explain neurodiversity to family, teachers, and friends. Understanding autism, ADHD, dyslexia, and other neurodivergent conditions."
        keywords="neurodiversity explained, autism resources, ADHD information, understanding neurodivergence, sensory differences, neurodiversity education"
      />
      <div className="content-landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>📖 Content & Resources</h1>
          <p className="hero-subtitle">
            Tired of explaining neurodiversity? Share our curated articles and resources 
            with family, teachers, and friends—so they can finally understand your world.
          </p>
        </div>
      </div>

      <div className="content-landing-container">
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
    </>
  )
}

export default Content
