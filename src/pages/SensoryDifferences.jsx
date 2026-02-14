import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SensoryDifferences.css'

function SensoryDifferences() {
  const navigate = useNavigate()
  const [activeSense, setActiveSense] = useState('sight')

  const senseDefinitions = {
    interoception: 'The sense of internal body signals like hunger, thirst, pain, temperature, heart rate, and emotions.',
    proprioception: 'The sense of body position and movement in space—knowing where your body parts are without looking.',
    vestibular: 'The sense of balance, spatial orientation, and movement—processed by the inner ear.'
  }

  const sensoryData = {
    sight: {
      hypo: {
        icon: '🔵',
        title: 'Hyposensitivity (Under-responsive)',
        subtitle: 'Reduced sensitivity to visual input',
        characteristics: [
          'May not notice visual details others see easily',
          'Attracted to bright lights, colorful objects, and high-contrast patterns',
          'Enjoys looking at spinning objects or moving lights',
          'May have difficulty noticing when things are dirty or messy',
          'Seeks out visually stimulating environments and activities',
          'May struggle with reading or tracking text on a page'
        ],
        examples: ['Staring at lights', 'Preferring bright colors', 'Watching spinning fans', 'Missing visual cues', 'Difficulty with reading'],
        accommodations: 'Provide colorful, high-contrast materials and well-lit workspaces. Use visual timers, highlighters, and colored overlays for reading. Incorporate movement breaks with visually engaging activities like kaleidoscopes or light tables.'
      },
      hyper: {
        icon: '🟣',
        title: 'Hypersensitivity (Over-responsive)',
        subtitle: 'Heightened sensitivity to visual input',
        characteristics: [
          'Overwhelmed by fluorescent lights or bright sunlight',
          'Distracted by visual clutter or busy patterns',
          'Sensitive to flickering lights or screens',
          'Prefers dim lighting and calm visual environments',
          'May experience headaches or eye strain from visual stimulation',
          'Notices small visual details others miss'
        ],
        examples: ['Wearing sunglasses indoors', 'Avoiding fluorescent lights', 'Discomfort in busy stores', 'Preferring minimal decor', 'Light-triggered migraines'],
        accommodations: 'Use natural lighting or lamps instead of fluorescent lights. Reduce visual clutter, provide sunglasses or tinted lenses, and use blue light filters on screens. Create calm, minimalist workspaces with neutral colors and organized storage.'
      }
    },
    hearing: {
      hypo: {
        icon: '🔵',
        title: 'Hyposensitivity (Under-responsive)',
        subtitle: 'Reduced sensitivity to auditory input',
        characteristics: [
          'May not respond when name is called',
          'Enjoys loud music or environmental sounds',
          'Speaks loudly without realizing it',
          'Seeks out noisy environments',
          'May not notice background sounds others find distracting',
          'Difficulty distinguishing between different sounds'
        ],
        examples: ['Playing music loudly', 'Not hearing alarms', 'Talking over others', 'Enjoying concerts', 'Missing verbal instructions'],
        accommodations: 'Use visual cues alongside verbal instructions (written notes, gestures). Face the person when speaking and check for understanding. Provide opportunities for music or sound-based activities, and use vibrating alarms or visual timers.'
      },
      hyper: {
        icon: '🟣',
        title: 'Hypersensitivity (Over-responsive)',
        subtitle: 'Heightened sensitivity to auditory input',
        characteristics: [
          'Overwhelmed by background noise (fans, traffic, conversations)',
          'Covers ears in loud or crowded environments',
          'Distracted by sounds others filter out (clock ticking, humming)',
          'Difficulty concentrating in noisy spaces',
          'May experience physical pain from certain sounds',
          'Startled easily by unexpected noises'
        ],
        examples: ['Using noise-cancelling headphones', 'Avoiding crowded places', 'Distressed by sirens', 'Needing quiet workspaces', 'Misophonia triggers'],
        accommodations: 'Provide noise-cancelling headphones or earplugs, and access to quiet spaces. Give advance warning before loud sounds (fire drills, alarms). Use carpets, curtains, and acoustic panels to reduce echo. Allow breaks in quiet areas during overwhelming situations.'
      }
    },
    touch: {
      hypo: {
        icon: '🔵',
        title: 'Hyposensitivity (Under-responsive)',
        subtitle: 'Reduced sensitivity to tactile input',
        characteristics: [
          'High pain tolerance - may not notice injuries',
          'Seeks out strong physical sensations (tight hugs, heavy blankets)',
          'May touch objects or people excessively',
          'Enjoys rough play or intense physical activities',
          'May not notice when hands or face are dirty',
          'Difficulty with fine motor tasks due to reduced feedback'
        ],
        examples: ['Preferring weighted blankets', 'Not noticing cuts', 'Seeking bear hugs', 'Chewing on objects', 'Rough play'],
        accommodations: 'Provide weighted blankets, lap pads, or compression clothing. Offer fidget tools, stress balls, and opportunities for "heavy work" activities (pushing, pulling, carrying). Use textured materials for learning and regularly check for injuries.'
      },
      hyper: {
        icon: '🟣',
        title: 'Hypersensitivity (Over-responsive)',
        subtitle: 'Heightened sensitivity to tactile input',
        characteristics: [
          'Bothered by clothing tags, seams, or certain fabrics',
          'Dislikes light touch or unexpected physical contact',
          'Avoids messy activities (finger painting, sand, slime)',
          'Sensitive to temperature changes',
          'May find hugs or handshakes uncomfortable',
          'Prefers specific textures and avoids others'
        ],
        examples: ['Removing clothing tags', 'Avoiding certain fabrics', 'Disliking sticky hands', 'Preferring firm touch', 'Texture aversions'],
        accommodations: 'Choose soft, tagless clothing in preferred fabrics. Respect personal space and ask before touching. Provide tools for messy activities (brushes, gloves) and allow hand-washing breaks. Use firm pressure instead of light touch, and give advance warning before physical contact.'
      }
    },
    taste: {
      hypo: {
        icon: '🔵',
        title: 'Hyposensitivity (Under-responsive)',
        subtitle: 'Reduced sensitivity to taste input',
        characteristics: [
          'Prefers strong, intense flavors (spicy, sour, salty)',
          'May eat non-food items (pica)',
          'Enjoys very hot or very cold foods',
          'Adds excessive seasoning to meals',
          'May not notice when food has gone bad',
          'Seeks out crunchy or chewy textures for oral stimulation'
        ],
        examples: ['Loving spicy food', 'Adding extra salt', 'Chewing ice', 'Eating hot peppers', 'Preferring sour candy'],
        accommodations: 'Offer foods with strong flavors and varied textures (crunchy vegetables, sour fruits, spicy options). Provide safe oral sensory tools like chewable jewelry or gum. Supervise closely if pica behaviors are present and ensure food safety.'
      },
      hyper: {
        icon: '🟣',
        title: 'Hypersensitivity (Over-responsive)',
        subtitle: 'Heightened sensitivity to taste input',
        characteristics: [
          'Limited food preferences - "picky eating"',
          'Sensitive to food textures (mushy, slimy, mixed)',
          'Avoids foods with strong flavors',
          'Prefers bland or familiar foods',
          'May gag easily from certain tastes or textures',
          'Difficulty trying new foods'
        ],
        examples: ['Eating same foods daily', 'Avoiding mixed textures', 'Preferring plain foods', 'Separating food on plate', 'Strong texture aversions'],
        accommodations: 'Respect food preferences and avoid pressure to try new foods. Keep foods separated on the plate and offer familiar options. Introduce new foods gradually alongside preferred ones. Focus on nutrition through accepted foods rather than forcing variety.'
      }
    },
    smell: {
      hypo: {
        icon: '🔵',
        title: 'Hyposensitivity (Under-responsive)',
        subtitle: 'Reduced sensitivity to olfactory input',
        characteristics: [
          'May not notice strong odors others find obvious',
          'Seeks out strong smells (perfumes, spices, markers)',
          'May smell objects, food, or people frequently',
          'Difficulty detecting spoiled food or gas leaks',
          'Enjoys activities with strong scents',
          'May not notice own body odor'
        ],
        examples: ['Smelling objects', 'Loving strong perfumes', 'Not noticing odors', 'Seeking scented items', 'Enjoying aromatherapy'],
        accommodations: 'Use scented markers or stickers for organization and learning. Provide aromatherapy options or scented fidget tools. Set reminders for personal hygiene and teach safety awareness about gas leaks or spoiled food through visual/auditory alarms.'
      },
      hyper: {
        icon: '🟣',
        title: 'Hypersensitivity (Over-responsive)',
        subtitle: 'Heightened sensitivity to olfactory input',
        characteristics: [
          'Overwhelmed by perfumes, cleaning products, or food smells',
          'Can detect faint odors others don\'t notice',
          'Avoids places with strong scents (restaurants, stores)',
          'May experience nausea from certain smells',
          'Prefers unscented products',
          'Sensitive to body odors and environmental smells'
        ],
        examples: ['Avoiding perfume sections', 'Nausea from cooking smells', 'Using unscented products', 'Detecting gas leaks early', 'Scent-triggered migraines'],
        accommodations: 'Use unscented or lightly scented products (soaps, detergents, lotions). Ensure good ventilation in living and work spaces. Create scent-free zones and give advance warning about strong smells. Allow breaks in fresh air when overwhelmed.'
      }
    },
    interoception: {
      hypo: {
        icon: '🔵',
        title: 'Hyposensitivity (Under-responsive)',
        subtitle: 'Reduced awareness of internal body signals',
        characteristics: [
          'Difficulty recognizing hunger, thirst, or need to use bathroom',
          'May not notice when feeling sick or in pain',
          'Trouble identifying emotions and their physical sensations',
          'May forget to eat, drink, or take bathroom breaks',
          'Difficulty recognizing when tired or needing rest',
          'May not notice rapid heartbeat or breathing changes'
        ],
        examples: ['Forgetting to eat', 'Not feeling thirst', 'Missing bathroom cues', 'Ignoring illness signs', 'Difficulty naming emotions'],
        accommodations: 'Set regular timers for meals, water breaks, and bathroom visits. Use visual schedules and body scan exercises to build awareness. Teach emotion recognition through charts and check-ins. Monitor for signs of illness or injury and establish routine health checks.'
      },
      hyper: {
        icon: '🟣',
        title: 'Hypersensitivity (Over-responsive)',
        subtitle: 'Heightened awareness of internal body signals',
        characteristics: [
          'Acutely aware of heartbeat, breathing, or digestion',
          'May experience anxiety from noticing internal sensations',
          'Highly attuned to pain or discomfort',
          'Notices subtle changes in body temperature or energy',
          'May become preoccupied with bodily functions',
          'Strong awareness of emotions and their physical manifestations'
        ],
        examples: ['Feeling heartbeat constantly', 'Anxiety about digestion', 'Noticing every ache', 'Temperature sensitivity', 'Hypervigilance to body'],
        accommodations: 'Teach grounding techniques and mindfulness practices to manage awareness. Provide reassurance about normal bodily functions and validate concerns. Use breathing exercises and progressive muscle relaxation. Create a calm environment and offer access to healthcare professionals when needed.'
      }
    },
    proprioception: {
      hypo: {
        icon: '🔵',
        title: 'Hyposensitivity (Under-responsive)',
        subtitle: 'Reduced awareness of body position and movement',
        characteristics: [
          'Appears clumsy or uncoordinated',
          'Bumps into furniture or people frequently',
          'Difficulty judging personal space',
          'Uses too much or too little force (breaks toys, writes too hard)',
          'Seeks out heavy work activities (pushing, pulling, carrying)',
          'May sit or stand in unusual positions'
        ],
        examples: ['Bumping into things', 'Breaking objects', 'Seeking heavy lifting', 'Difficulty with stairs', 'Unusual postures'],
        accommodations: 'Provide "heavy work" activities throughout the day (carrying books, pushing carts, wall pushes). Use resistance bands, weighted vests, or therapy putty. Clearly mark boundaries and pathways. Teach body awareness through yoga, martial arts, or obstacle courses.'
      },
      hyper: {
        icon: '🟣',
        title: 'Hypersensitivity (Over-responsive)',
        subtitle: 'Heightened awareness of body position and movement',
        characteristics: [
          'Very aware of body position in space',
          'May appear stiff or rigid in movements',
          'Cautious with physical activities',
          'Prefers predictable, controlled movements',
          'Excellent body awareness and control',
          'May avoid activities requiring balance or coordination'
        ],
        examples: ['Precise movements', 'Avoiding sports', 'Careful walking', 'Disliking surprises', 'Controlled gestures'],
        accommodations: 'Provide clear, step-by-step instructions for physical activities. Allow extra time for movement tasks and avoid sudden position changes. Create predictable routines and safe spaces for movement exploration. Respect preferences for controlled, deliberate movements.'
      }
    },
    vestibular: {
      hypo: {
        icon: '🔵',
        title: 'Hyposensitivity (Under-responsive)',
        subtitle: 'Reduced sensitivity to movement and balance',
        characteristics: [
          'Constantly seeks movement (spinning, swinging, jumping)',
          'Enjoys fast-paced activities and thrill-seeking',
          'May rock, fidget, or move constantly',
          'Difficulty sitting still',
          'Rarely gets dizzy or motion sick',
          'Craves intense vestibular input'
        ],
        examples: ['Spinning in circles', 'Loving roller coasters', 'Constant fidgeting', 'Rocking in chair', 'Seeking swings'],
        accommodations: 'Provide frequent movement breaks with swinging, spinning, or jumping activities. Use rocking chairs, therapy balls, or standing desks. Incorporate movement into learning (walking while reading, fidget tools). Allow safe opportunities for intense movement like trampolines or swings.'
      },
      hyper: {
        icon: '🟣',
        title: 'Hypersensitivity (Over-responsive)',
        subtitle: 'Heightened sensitivity to movement and balance',
        characteristics: [
          'Easily becomes dizzy or nauseous from movement',
          'Avoids playground equipment (swings, slides, merry-go-rounds)',
          'Dislikes elevators, escalators, or car rides',
          'Prefers feet firmly on ground',
          'May experience motion sickness easily',
          'Anxious about activities involving balance or height'
        ],
        examples: ['Avoiding swings', 'Motion sickness', 'Fear of heights', 'Disliking elevators', 'Preferring stable ground'],
        accommodations: 'Provide stable seating with back support and feet flat on floor. Give advance warning before movement activities and allow opt-out options. Use gradual exposure to movement in controlled settings. Keep motion sickness remedies available and allow frequent breaks during travel.'
      }
    }
  }

  const currentData = sensoryData[activeSense]

  return (
    <div className="sd-page">
      <div className="sd-page-bg">
        <div className="sd-container">
          <button className="sd-back-button" onClick={() => navigate('/content')}>
            ← Back to Content
          </button>

          <h1>🌈 Sensory Differences in Neurodivergent Individuals</h1>
          <p className="sd-subtitle">
            Neurodivergent people may experience sensory input differently than neurotypical individuals. 
            This can manifest as hyposensitivity (under-responsiveness) or hypersensitivity (over-responsiveness) to sensory stimuli. 
            Select a sense below to explore how these differences appear in daily life.
          </p>

          <div className="sd-sense-category">
            <div className="sd-category-title">🌍 Environmental Senses</div>
            <div className="sd-sense-selector">
              <button
                className={`sd-sense-btn ${activeSense === 'sight' ? 'active' : ''}`}
                onClick={() => setActiveSense('sight')}
              >
                <span className="sd-sense-icon">👁️</span>
                <span>Sight</span>
              </button>
              <button
                className={`sd-sense-btn ${activeSense === 'hearing' ? 'active' : ''}`}
                onClick={() => setActiveSense('hearing')}
              >
                <span className="sd-sense-icon">👂</span>
                <span>Hearing</span>
              </button>
              <button
                className={`sd-sense-btn ${activeSense === 'touch' ? 'active' : ''}`}
                onClick={() => setActiveSense('touch')}
              >
                <span className="sd-sense-icon">✋</span>
                <span>Touch</span>
              </button>
              <button
                className={`sd-sense-btn ${activeSense === 'taste' ? 'active' : ''}`}
                onClick={() => setActiveSense('taste')}
              >
                <span className="sd-sense-icon">👅</span>
                <span>Taste</span>
              </button>
              <button
                className={`sd-sense-btn ${activeSense === 'smell' ? 'active' : ''}`}
                onClick={() => setActiveSense('smell')}
              >
                <span className="sd-sense-icon">👃</span>
                <span>Smell</span>
              </button>
            </div>
          </div>

          <div className="sd-sense-category">
            <div className="sd-category-title">🧠 Internal Senses</div>
            <div className="sd-sense-selector">
              <button
                className={`sd-sense-btn ${activeSense === 'interoception' ? 'active' : ''}`}
                onClick={() => setActiveSense('interoception')}
              >
                <span className="sd-sense-icon">💓</span>
                <span>Interoception</span>
              </button>
              <button
                className={`sd-sense-btn ${activeSense === 'proprioception' ? 'active' : ''}`}
                onClick={() => setActiveSense('proprioception')}
              >
                <span className="sd-sense-icon">🦴</span>
                <span>Proprioception</span>
              </button>
              <button
                className={`sd-sense-btn ${activeSense === 'vestibular' ? 'active' : ''}`}
                onClick={() => setActiveSense('vestibular')}
              >
                <span className="sd-sense-icon">🌀</span>
                <span>Vestibular</span>
              </button>
            </div>
          </div>

          {senseDefinitions[activeSense] && (
            <div className="sd-sense-definition">
              <strong>{activeSense.charAt(0).toUpperCase() + activeSense.slice(1)}:</strong> {senseDefinitions[activeSense]}
            </div>
          )}

          <div className="sd-comparison-section">
            <div className="sd-comparison-card hypo">
              <div className="sd-card-header">
                <div className="sd-card-icon">{currentData.hypo.icon}</div>
                <div>
                  <div className="sd-card-title">{currentData.hypo.title}</div>
                  <div className="sd-card-subtitle">{currentData.hypo.subtitle}</div>
                </div>
              </div>
              <div className="sd-card-content">
                <div className="sd-section-title">Common Experiences</div>
                <ul className="sd-feature-list">
                  {currentData.hypo.characteristics.map((char, index) => (
                    <li key={index}>{char}</li>
                  ))}
                </ul>
                <div className="sd-examples-section">
                  <div className="sd-section-title">Real-World Examples</div>
                  <div>
                    {currentData.hypo.examples.map((example, index) => (
                      <span key={index} className="sd-example-badge hypo">{example}</span>
                    ))}
                  </div>
                </div>
                <div className="sd-accommodations-section hypo">
                  <div className="sd-section-title">💡 Helpful Accommodations</div>
                  <p className="sd-accommodations-text">{currentData.hypo.accommodations}</p>
                </div>
              </div>
            </div>

            <div className="sd-comparison-card hyper">
              <div className="sd-card-header">
                <div className="sd-card-icon">{currentData.hyper.icon}</div>
                <div>
                  <div className="sd-card-title">{currentData.hyper.title}</div>
                  <div className="sd-card-subtitle">{currentData.hyper.subtitle}</div>
                </div>
              </div>
              <div className="sd-card-content">
                <div className="sd-section-title">Common Experiences</div>
                <ul className="sd-feature-list">
                  {currentData.hyper.characteristics.map((char, index) => (
                    <li key={index}>{char}</li>
                  ))}
                </ul>
                <div className="sd-examples-section">
                  <div className="sd-section-title">Real-World Examples</div>
                  <div>
                    {currentData.hyper.examples.map((example, index) => (
                      <span key={index} className="sd-example-badge hyper">{example}</span>
                    ))}
                  </div>
                </div>
                <div className="sd-accommodations-section hyper">
                  <div className="sd-section-title">💡 Helpful Accommodations</div>
                  <p className="sd-accommodations-text">{currentData.hyper.accommodations}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sd-note">
            <strong><span className="sd-note-icon">💡</span>Important Note:</strong> Sensory processing differences exist on a spectrum, and every neurodivergent person's experience is unique. Some individuals may be hypersensitive to certain stimuli while hyposensitive to others. These differences are neurological variations, not behavioral choices. Understanding and accommodating sensory needs can significantly improve quality of life and reduce sensory overload or seeking behaviors. If you recognize these patterns in yourself or someone you care about, consider consulting with an occupational therapist who specializes in sensory processing.
          </div>
        </div>
      </div>
    </div>
  )
}

export default SensoryDifferences
