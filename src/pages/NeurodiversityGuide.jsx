import { useState } from 'react'
import './NeurodiversityGuide.css'

function NeurodiversityGuide() {
  const [activeDomain, setActiveDomain] = useState('social')

  const domainData = {
    sensory: {
      neurotypical: {
        icon: '🔵',
        title: 'Neurotypical Experience',
        characteristics: [
          'Automatic filtering of background stimuli and noise',
          'Moderate, consistent sensitivity to sensory input',
          'Stable sensory thresholds across environments',
          'Gradual adaptation to new sensory environments',
          'Balanced response to multiple simultaneous stimuli'
        ],
        strengths: [
          'Environmental Flexibility',
          'Sensory Consistency',
          'Quick Adaptation',
          'Multi-sensory Integration'
        ]
      },
      neurodivergent: {
        icon: '🟣',
        title: 'Neurodivergent Experience',
        characteristics: [
          'Heightened awareness of environmental details and patterns',
          'Variable sensitivity - can be hyper-sensitive or hypo-sensitive',
          'Rich, detailed sensory experiences with deep processing',
          'Enhanced ability to notice subtle changes in environment',
          'Unique sensory preferences and self-regulation needs'
        ],
        strengths: [
          'Detail Recognition',
          'Pattern Detection',
          'Sensory Expertise',
          'Quality Discernment'
        ]
      }
    },
    multitasking: {
      neurotypical: {
        icon: '🔵',
        title: 'Neurotypical Experience',
        characteristics: [
          'Sequential task processing with smooth transitions',
          'Linear planning and step-by-step prioritization',
          'Consistent attention distribution across tasks',
          'Comfortable switching between multiple tasks',
          'Standard time perception and deadline awareness'
        ],
        strengths: [
          'Task Flexibility',
          'Time Management',
          'Organized Planning',
          'Steady Progress',
          'Deadline Adherence'
        ]
      },
      neurodivergent: {
        icon: '🟣',
        title: 'Neurodivergent Experience',
        characteristics: [
          'Non-linear, parallel thought processing across multiple ideas',
          'Interest-based attention with intense focus on engaging tasks',
          'Deep focus capabilities (hyperfocus) on compelling subjects',
          'Creative, innovative problem-solving approaches',
          'Ability to see connections and patterns others might miss'
        ],
        strengths: [
          'Hyperfocus Ability',
          'Creative Innovation',
          'Deep Expertise',
          'Pattern Recognition',
          'Out-of-box Thinking'
        ]
      }
    },
    communication: {
      neurotypical: {
        icon: '🔵',
        title: 'Neurotypical Experience',
        characteristics: [
          'Implicit social cue interpretation without conscious effort',
          'Comfortable with indirect communication patterns',
          'Automatic reading of nonverbal signals and body language',
          'Context-dependent language use and interpretation',
          'Intuitive understanding of conversational subtext'
        ],
        strengths: [
          'Social Fluency',
          'Implicit Understanding',
          'Conversational Ease',
          'Nonverbal Reading',
          'Context Adaptation'
        ]
      },
      neurodivergent: {
        icon: '🟣',
        title: 'Neurodivergent Experience',
        characteristics: [
          'Literal, precise language processing and interpretation',
          'Direct, explicit communication preference - values clarity',
          'Rich, detailed internal monologue and thought processes',
          'Unique, authentic expression styles without social masking',
          'Honest, straightforward communication approach'
        ],
        strengths: [
          'Clarity & Precision',
          'Authentic Expression',
          'Written Communication',
          'Logical Analysis',
          'Honesty & Directness'
        ]
      }
    },
    social: {
      neurotypical: {
        icon: '🔵',
        title: 'Neurotypical Experience',
        characteristics: [
          'Intuitive navigation of unspoken social rules',
          'Automatic reading of group dynamics and hierarchies',
          'Comfortable in varied social settings and group sizes',
          'Implicit understanding of social expectations',
          'Natural small talk and casual conversation'
        ],
        strengths: [
          'Social Intuition',
          'Group Navigation',
          'Networking Ease',
          'Casual Interaction',
          'Social Flexibility'
        ]
      },
      neurodivergent: {
        icon: '🟣',
        title: 'Neurodivergent Experience',
        characteristics: [
          'Analytical approach to learning social patterns and contexts',
          'Authentic, genuine self-expression in relationships',
          'Deep, focused interests and specialized expertise',
          'Preference for meaningful one-on-one connections',
          'Loyalty and depth in close relationships'
        ],
        strengths: [
          'Deep Connections',
          'Authentic Relationships',
          'Specialized Knowledge',
          'Independent Thinking',
          'Loyalty & Dedication'
        ]
      }
    }
  }

  const domains = [
    { value: 'sensory', label: 'Sensory Processing', icon: '✨' },
    { value: 'multitasking', label: 'Multitasking', icon: '🎯' },
    { value: 'communication', label: 'Communication', icon: '💬' },
    { value: 'social', label: 'Social Processing', icon: '👥' }
  ]

  const currentData = domainData[activeDomain]

  return (
    <div className="neurodiversity-guide">
      <div className="nd-container">
        <h1>🧠 Understanding Neurodiversity</h1>
        <p className="nd-subtitle">
          Explore how neurotypical and neurodivergent individuals experience different aspects of cognition and daily life. 
          Select a domain below to learn about the unique characteristics and strengths of each experience.
        </p>
        
        <div className="nd-domain-selector">
          {domains.map(domain => (
            <button
              key={domain.value}
              className={`nd-domain-btn ${activeDomain === domain.value ? 'active' : ''}`}
              onClick={() => setActiveDomain(domain.value)}
            >
              <span className="nd-icon">{domain.icon}</span>
              <span>{domain.label}</span>
            </button>
          ))}
        </div>
        
        <div className="nd-comparison-section">
          <div className="nd-comparison-card neurotypical">
            <div className="nd-card-header">
              <div className="nd-card-icon">{currentData.neurotypical.icon}</div>
              <div className="nd-card-title">{currentData.neurotypical.title}</div>
            </div>
            <div className="nd-card-content">
              <div className="nd-section-title">Characteristics</div>
              <ul className="nd-feature-list">
                {currentData.neurotypical.characteristics.map((char, index) => (
                  <li key={index}>{char}</li>
                ))}
              </ul>
              <div className="nd-strengths-section">
                <div className="nd-section-title">Key Strengths</div>
                <div>
                  {currentData.neurotypical.strengths.map((strength, index) => (
                    <span key={index} className="nd-strength-badge">{strength}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="nd-comparison-card neurodivergent">
            <div className="nd-card-header">
              <div className="nd-card-icon">{currentData.neurodivergent.icon}</div>
              <div className="nd-card-title">{currentData.neurodivergent.title}</div>
            </div>
            <div className="nd-card-content">
              <div className="nd-section-title">Characteristics</div>
              <ul className="nd-feature-list">
                {currentData.neurodivergent.characteristics.map((char, index) => (
                  <li key={index}>{char}</li>
                ))}
              </ul>
              <div className="nd-strengths-section">
                <div className="nd-section-title">Key Strengths</div>
                <div>
                  {currentData.neurodivergent.strengths.map((strength, index) => (
                    <span key={index} className="nd-strength-badge">{strength}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="nd-note">
          <strong><span className="nd-note-icon">💡</span>Important Note:</strong> This comparison represents general patterns in brain processing styles. Every brain is unique, and neurodivergence encompasses a wide spectrum including ADHD, autism, dyslexia, and more. These differences are variations in human neurology, not deficits. Many neurodivergent individuals experience strengths such as enhanced pattern recognition, creative problem-solving, hyperfocus abilities, and unique perspectives that contribute valuable diversity to our world. Both neurotypical and neurodivergent experiences have inherent value and strengths.
        </div>
      </div>
    </div>
  )
}

export default NeurodiversityGuide
