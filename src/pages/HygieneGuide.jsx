import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HygieneGuide.css'

function HygieneGuide() {
  const navigate = useNavigate()
  const [activeTopic, setActiveTopic] = useState('toilet')

  const topicData = {
    toilet: {
      type: 'shared',
      icon: '🚽',
      title: 'Toilet Training',
      priority: '🔴 Top Priority',
      age: 'As soon as possible',
      sensory: {
        title: 'Sensory Side',
        subtitle: 'How the body and environment feel',
        challenges: [
          'May not feel the internal sensation of needing to go (interoception difficulty)',
          'Toilet seat may feel cold, hard, or uncomfortable',
          'Sound of flushing can be frightening or overwhelming',
          'Bathroom echoes, fan noise, or hand dryers may cause distress',
          'Texture of toilet paper may feel scratchy or unpleasant',
          'Sensation of clothes being pulled down/up can be uncomfortable'
        ],
        strategies: [
          'Use a padded, warm toilet seat cover to reduce discomfort',
          'Allow the child to leave before flushing, or use a visual "flush timer"',
          'Try different toilet paper brands, or use wet wipes for comfort',
          'Use noise-cancelling headphones in echoey bathrooms',
          'Practice sitting on the toilet fully clothed first, then gradually undress'
        ]
      },
      cognitive: {
        title: 'Cognitive Side',
        subtitle: 'Understanding the why, when, and how',
        challenges: [
          'May not understand the connection between body signals and needing the toilet',
          'Difficulty with the sequence of steps (pull down, sit, wipe, flush, wash)',
          'Transitioning from a preferred activity to go to the bathroom',
          'Understanding the difference between wee and poop routines',
          'Generalising toilet skills to different bathrooms (school, public, relatives)',
          'Night-time dryness requires a different cognitive awareness'
        ],
        strategies: [
          'Use visual schedules showing each step with pictures on the bathroom wall',
          'Set regular timers (every 60-90 mins) to build routine — reduce gradually',
          'Use social stories explaining "my body tells me when to go"',
          'Start with daytime wee → daytime poop → then nighttime',
          'Practice in different bathrooms to build generalisation',
          'Consult a doctor if no progress — rule out medical issues first'
        ]
      },
      steps: [
        { num: '1', text: 'Rule out medical issues' },
        { num: '2', text: 'Daytime wee' },
        { num: '3', text: 'Daytime poop' },
        { num: '4', text: 'Nighttime training' }
      ]
    },
    odour: {
      type: 'shared',
      icon: '🧴',
      title: 'Body Odour Management',
      priority: '🟡 Important',
      age: 'Pre-puberty onwards (~age 8-10)',
      sensory: {
        title: 'Sensory Side',
        subtitle: 'How products feel and smell on the body',
        challenges: [
          'Strong scent of deodorant may be overwhelming (hyper-smell)',
          'Cold spray sensation can be startling or unpleasant',
          'Wet/sticky feeling of roll-on may cause discomfort',
          'Texture of deodorant residue on skin or clothing',
          'May not notice their own body odour (hypo-smell)',
          'Shower water temperature and pressure sensitivity'
        ],
        strategies: [
          'Explore both spray and roll-on — let them choose what feels better',
          'Start with unscented or lightly scented options',
          'Warm the roll-on in hands first to reduce cold shock',
          'Try natural/crystal deodorants if chemical ones cause irritation',
          'Model it yourself — "watch me put mine on" normalises the routine',
          'Use a visual "sniff check" chart to build self-awareness of odour'
        ]
      },
      cognitive: {
        title: 'Cognitive Side',
        subtitle: 'Understanding why and when to use it',
        challenges: [
          'May not understand why body odour matters socially',
          'Difficulty remembering to apply deodorant daily',
          'Not understanding when to reapply (after sports, hot days)',
          'Connecting puberty changes to new hygiene needs',
          'Understanding that others can smell what they cannot',
          'Knowing the difference between deodorant and perfume/cologne'
        ],
        strategies: [
          'Use social stories about "my body is changing and that\'s okay"',
          'Add deodorant to a visual morning routine chart',
          'Teach the rule: "After shower = deodorant" as a fixed pair',
          'Use concrete language: "Sweat makes a smell. Deodorant stops the smell."',
          'Practice the routine together daily until it becomes automatic',
          'Keep deodorant next to toothbrush so it\'s part of the same sequence'
        ]
      },
      steps: [
        { num: '1', text: 'Model on yourself' },
        { num: '2', text: 'Explore spray vs roll-on' },
        { num: '3', text: 'Find preferred product' },
        { num: '4', text: 'Build into daily routine' }
      ]
    },
    privacy: {
      type: 'shared',
      icon: '🔒',
      title: 'Privacy & Changing Clothes',
      priority: '🟡 Important',
      age: 'From age 4-5 onwards',
      sensory: {
        title: 'Sensory Side',
        subtitle: 'Physical comfort during changing',
        challenges: [
          'Certain fabrics or clothing types may cause distress during changes',
          'Temperature change when undressed can be uncomfortable',
          'Buttons, zips, and fasteners may be difficult with fine motor challenges',
          'Tags, seams, and waistbands may cause sensory overload',
          'Rushing to change (e.g., PE at school) adds sensory pressure',
          'Changing rooms may have overwhelming lighting, sounds, or smells'
        ],
        strategies: [
          'Choose clothing with easy fastenings (elastic waists, velcro, pull-on)',
          'Allow extra time for changing — never rush',
          'Provide a warm, quiet space for changing when possible',
          'Remove tags and choose seamless, soft fabrics',
          'Practice changing at home in a calm environment first',
          'Use a consistent changing spot at home to build comfort'
        ]
      },
      cognitive: {
        title: 'Cognitive Side',
        subtitle: 'Understanding privacy rules and boundaries',
        challenges: [
          'May not understand why nudity is private',
          'Difficulty learning "where" is appropriate to change',
          'Understanding the concept of "safe circles" — who can see you undressed',
          'Generalising rules across settings (home vs school vs swimming pool)',
          'Remembering to close doors, draw curtains, or use changing rooms',
          'Understanding that rules change with age (toddler vs teenager)'
        ],
        strategies: [
          'Teach designated changing areas: bedroom, bathroom — door closed, curtains drawn',
          'Use the "Safe Circles" model: Circle 1 (parents/carers), Circle 2 (doctor with parent), Circle 3 (nobody else)',
          'Create a visual rule card: "Before I change: Door closed ✓ Curtains closed ✓"',
          'Use social stories about "private body, private places"',
          'Practice the routine: enter room → close door → draw curtains → change',
          'Revisit and update safe circles as the child grows and understands more'
        ]
      },
      steps: [
        { num: '1', text: 'Teach designated areas' },
        { num: '2', text: 'Door & curtain routine' },
        { num: '3', text: 'Safe circles concept' },
        { num: '4', text: 'Generalise to all settings' }
      ]
    },
    grooming: {
      type: 'shared',
      icon: '✂️',
      title: 'Hair Cuts & Nail Cutting',
      priority: '🟡 Important',
      age: 'Ongoing from early childhood',
      sensory: {
        title: 'Sensory Side',
        subtitle: 'Why these tasks can feel unbearable',
        challenges: [
          'Vibration and buzzing of clippers can be extremely distressing',
          'Scissors near the face/ears triggers fight-or-flight response',
          'Loose hair on skin feels itchy, prickly, and overwhelming',
          'Nail clipping sensation — pressure, vibration, and the "snap" feeling',
          'Water spraying on hair can be startling',
          'Being touched on the head/hands by a stranger (hairdresser)'
        ],
        strategies: [
          'Desensitise gradually: start with touching hair, then combing, then pretend cutting',
          'Use vibration toys on hands/arms first to build tolerance to buzzing',
          'Try a cape that covers completely to prevent loose hair on skin',
          'For nails: try filing instead of clipping, or cut during sleep/bath when nails are soft',
          'Use deep pressure (firm hand on shoulder) during the process for calming',
          'Find a sensory-friendly hairdresser or cut hair at home in a familiar space'
        ]
      },
      cognitive: {
        title: 'Cognitive Side',
        subtitle: 'Understanding and cooperating with grooming',
        challenges: [
          'May not understand why hair/nails need cutting',
          'Difficulty sitting still for the duration required',
          'Fear of the unknown — "how much will they cut?"',
          'Not understanding that hair/nails grow back',
          'Anxiety about looking different after a haircut',
          'Difficulty communicating discomfort during the process'
        ],
        strategies: [
          'Use visual timers showing "5 more minutes" to make it predictable',
          'Show before/after photos of themselves to normalise the change',
          'Create a social story: "My hair grows. When it\'s long, we cut it. It grows again."',
          'Use a reward system: preferred activity immediately after grooming',
          'Let them watch videos of other children getting haircuts',
          'Teach a "stop" signal (hand up, red card) they can use if overwhelmed'
        ]
      },
      steps: [
        { num: '1', text: 'Desensitise gradually' },
        { num: '2', text: 'Practice at home first' },
        { num: '3', text: 'Use visual supports' },
        { num: '4', text: 'Build tolerance over time' }
      ]
    },
    privatetouch: {
      type: 'boys',
      icon: '🔵',
      title: 'Private Touch Education',
      priority: '🟠 Plan Ahead',
      age: 'Around age 6-7',
      sensory: {
        title: 'Sensory Side',
        subtitle: 'Understanding body sensations',
        challenges: [
          'May discover self-touching feels pleasant without understanding context',
          'Sensory-seeking behaviour may lead to touching in public spaces',
          'Difficulty distinguishing between sensory seeking and sexual behaviour',
          'Clothing textures or pressure may inadvertently trigger touching',
          'May not recognise the difference between private and public sensations',
          'Hyposensitivity may lead to more intense or frequent seeking'
        ],
        strategies: [
          'Acknowledge that the sensation is normal — never shame or punish',
          'Redirect calmly: "That\'s a private touch. Private touches happen in your bedroom."',
          'Ensure clothing is comfortable to reduce sensory-driven touching',
          'Provide alternative sensory input (fidget tools, weighted lap pad)',
          'If sensory-seeking is the driver, address the underlying sensory need',
          'Consult an OT if the behaviour seems primarily sensory rather than exploratory'
        ]
      },
      cognitive: {
        title: 'Cognitive Side',
        subtitle: 'Teaching rules about private behaviour',
        challenges: [
          'May not understand the concept of "private" vs "public" behaviour',
          'Difficulty understanding why something that feels okay isn\'t okay everywhere',
          'Abstract social rules are hard to grasp',
          'May not read social cues that others are uncomfortable',
          'Generalising the rule across all settings (home, school, car, park)',
          'Understanding that this rule applies even when they think no one is watching'
        ],
        strategies: [
          'Teach a clear, simple rule: "Touching private parts = your bedroom, alone, door closed"',
          'Use visual rule cards placed in the bedroom as a reminder',
          'Practice the sequence: "Am I in my bedroom? Is the door closed? Am I alone? Then it\'s okay."',
          'Use social stories about public vs private behaviour',
          'Be matter-of-fact and calm — treat it like any other rule (like wearing shoes outside)',
          'Revisit the rule regularly as they grow — adjust language for their comprehension level'
        ]
      },
      steps: [
        { num: '1', text: 'Acknowledge it\'s normal' },
        { num: '2', text: 'Teach the "where" rule' },
        { num: '3', text: 'Visual reminders' },
        { num: '4', text: 'Consistent, calm redirection' }
      ]
    },
    bra: {
      type: 'girls',
      icon: '🩱',
      title: 'Bra Tolerance',
      priority: '🟠 Plan Ahead',
      age: 'Pre-puberty (~age 8-10)',
      sensory: {
        title: 'Sensory Side',
        subtitle: 'Why bras can feel unbearable',
        challenges: [
          'Straps digging into shoulders cause constant irritation',
          'Band around the ribcage feels restrictive — like being squeezed',
          'Fabric texture against sensitive skin (especially seams and lace)',
          'Tags and labels cause intense itching or scratching',
          'Hooks and clasps press into the back uncomfortably',
          'Feeling of constriction can trigger anxiety or meltdowns'
        ],
        strategies: [
          'Start with a soft crop top — no hooks, no wires, no clasps',
          'Progress gradually: crop top → sports bra → soft-cup bra (if needed)',
          'Choose seamless, tagless options in soft cotton or bamboo fabric',
          'Let them wear it for short periods at home first (10 mins → 30 mins → longer)',
          'Try compression-style tops if they prefer firm, even pressure over light touch',
          'Allow them to choose the fabric and style — autonomy reduces resistance'
        ]
      },
      cognitive: {
        title: 'Cognitive Side',
        subtitle: 'Understanding why and building acceptance',
        challenges: [
          'May not understand why they need to wear something new and uncomfortable',
          'Difficulty connecting body changes to new clothing needs',
          'Resistance to change in routine (never wore this before, why now?)',
          'May not understand social expectations around developing bodies',
          'Difficulty with the motor skills of putting on/taking off a bra',
          'Anxiety about looking or feeling different from before'
        ],
        strategies: [
          'Use a social story: "My body is growing. A crop top helps me feel comfortable."',
          'Frame it positively: "This is like a soft vest that\'s just for you"',
          'Show them that you wear one too — normalise through modelling',
          'Practice putting it on and taking it off as a skill (like learning to tie shoes)',
          'Add it to the visual morning routine chart alongside other clothing',
          'Never force it — if today is a "no" day, try again tomorrow. Consistency without pressure.'
        ]
      },
      steps: [
        { num: '1', text: 'Start with soft crop top' },
        { num: '2', text: 'Short periods at home' },
        { num: '3', text: 'Gradually increase wear time' },
        { num: '4', text: 'Progress to sports bra if needed' }
      ]
    },
    periods: {
      type: 'girls',
      icon: '🌸',
      title: 'Period Management',
      priority: '🔴 Essential',
      age: 'Before first period (~age 9-11)',
      sensory: {
        title: 'Sensory Side',
        subtitle: 'Why pads and periods feel overwhelming',
        challenges: [
          'Pad feels bulky, sticky, and foreign against the skin',
          'Adhesive pulling on underwear or skin causes discomfort',
          'Wetness sensation can be distressing or confusing',
          'Cramps and abdominal pain are new, unpredictable sensations',
          'Blood sight/smell may cause anxiety or sensory overload',
          'Changing pads in unfamiliar bathrooms adds sensory stress'
        ],
        strategies: [
          'Start practising with pads BEFORE the first period — wear them dry at home',
          'Try different types: thin pads, cloth pads, period underwear — find what\'s tolerable',
          'Period underwear can eliminate the pad sensation entirely — excellent first option',
          'Use unscented pads to reduce smell sensitivity',
          'For cramps: introduce a heat pack or warm water bottle as a comfort tool',
          'Practice the full routine: unwrap → place → wear → remove → dispose in a calm setting'
        ]
      },
      cognitive: {
        title: 'Cognitive Side',
        subtitle: 'Understanding periods and building independence',
        challenges: [
          'May not understand what a period is or why it happens',
          'Difficulty with the multi-step process of changing a pad',
          'Tracking when a period might come (cycle awareness)',
          'Understanding that periods are normal and not an injury',
          'Knowing when to change a pad (time-based vs sensation-based)',
          'Managing periods at school independently'
        ],
        strategies: [
          'Use simple, concrete language: "Once a month, your body releases blood. It\'s healthy and normal."',
          'Create a visual step-by-step guide for the bathroom: unwrap → stick → wear → check → change',
          'Use a visual calendar or app to track and predict periods',
          'Set timers for pad changes (every 3-4 hours) until they learn to self-monitor',
          'Prepare a "period kit" for school: pad, spare underwear, wipes, small bag',
          'Practice the routine monthly even before the first period so it\'s familiar when it arrives'
        ]
      },
      steps: [
        { num: '1', text: 'Explain simply & early' },
        { num: '2', text: 'Practice wearing pads dry' },
        { num: '3', text: 'Build the change routine' },
        { num: '4', text: 'Prepare a school kit' }
      ]
    }
  }

  const currentData = topicData[activeTopic]

  const getHeaderClass = () => {
    switch (currentData.type) {
      case 'boys': return 'hg-topic-header boys-header'
      case 'girls': return 'hg-topic-header girls-header'
      default: return 'hg-topic-header shared-header'
    }
  }

  const getBtnClass = (topic) => {
    const data = topicData[topic]
    const baseClass = `hg-sense-btn ${data.type}-btn`
    return activeTopic === topic ? `${baseClass} active` : baseClass
  }

  return (
    <div className="hg-page">
      <div className="hg-page-bg">
        <div className="hg-container">
          <button className="hg-back-button" onClick={() => navigate('/content')}>
            ← Back to Content
          </button>

          <h1>🧼 Hygiene & Body Care Guide</h1>
          <p className="hg-subtitle">
            A practical guide for supporting autistic individuals through hygiene milestones. 
            Every skill has both a sensory and cognitive component — both must be addressed for success. 
            Select a topic below to explore challenges and strategies.
          </p>

          <div className="hg-dual-approach-banner">
            <div className="hg-banner-icon">⚖️</div>
            <div className="hg-banner-text">
              <strong>Dual Approach Required</strong>
              Each hygiene skill requires addressing both sensory barriers (how things feel) and cognitive understanding (why and how). 
              Success comes from tackling both sides together.
            </div>
          </div>

          <div className="hg-sense-category">
            <div className="hg-category-title shared">🔄 Shared — Both Boys & Girls</div>
            <div className="hg-sense-selector">
              <button
                className={getBtnClass('toilet')}
                onClick={() => setActiveTopic('toilet')}
              >
                <span className="hg-sense-icon">🚽</span>
                <span>Toilet Training</span>
              </button>
              <button
                className={getBtnClass('odour')}
                onClick={() => setActiveTopic('odour')}
              >
                <span className="hg-sense-icon">🧴</span>
                <span>Body Odour</span>
              </button>
              <button
                className={getBtnClass('privacy')}
                onClick={() => setActiveTopic('privacy')}
              >
                <span className="hg-sense-icon">🔒</span>
                <span>Privacy & Changing</span>
              </button>
              <button
                className={getBtnClass('grooming')}
                onClick={() => setActiveTopic('grooming')}
              >
                <span className="hg-sense-icon">✂️</span>
                <span>Hair & Nails</span>
              </button>
            </div>
          </div>

          <div className="hg-sense-category">
            <div className="hg-category-title boys">👦 Boys — Specific</div>
            <div className="hg-sense-selector">
              <button
                className={getBtnClass('privatetouch')}
                onClick={() => setActiveTopic('privatetouch')}
              >
                <span className="hg-sense-icon">🔵</span>
                <span>Private Touch Education</span>
              </button>
            </div>
          </div>

          <div className="hg-sense-category">
            <div className="hg-category-title girls">👧 Girls — Specific</div>
            <div className="hg-sense-selector">
              <button
                className={getBtnClass('bra')}
                onClick={() => setActiveTopic('bra')}
              >
                <span className="hg-sense-icon">🩱</span>
                <span>Bra Tolerance</span>
              </button>
              <button
                className={getBtnClass('periods')}
                onClick={() => setActiveTopic('periods')}
              >
                <span className="hg-sense-icon">🌸</span>
                <span>Period Management</span>
              </button>
            </div>
          </div>

          <div className={getHeaderClass()}>
            <div className="hg-header-icon">{currentData.icon}</div>
            <div className="hg-header-info">
              <h2>{currentData.title}</h2>
              <div className="hg-meta">
                <span>{currentData.priority}</span>
                <span>📅 {currentData.age}</span>
              </div>
            </div>
          </div>

          {currentData.steps && currentData.steps.length > 0 && (
            <div className="hg-steps-section">
              <h3>📋 Recommended Progression</h3>
              <div className="hg-step-flow">
                {currentData.steps.map((step, index) => (
                  <span key={index}>
                    <span className="hg-step-item">
                      <span className="hg-step-num">{step.num}</span>
                      {step.text}
                    </span>
                    {index < currentData.steps.length - 1 && (
                      <span className="hg-step-arrow">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="hg-comparison-section">
            <div className="hg-comparison-card sensory">
              <div className="hg-card-header">
                <div className="hg-card-icon">🧠</div>
                <div>
                  <div className="hg-card-title">{currentData.sensory.title}</div>
                  <div className="hg-card-subtitle">{currentData.sensory.subtitle}</div>
                </div>
              </div>
              <div className="hg-card-content">
                <div className="hg-section-title">Common Challenges</div>
                <ul className="hg-feature-list">
                  {currentData.sensory.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
                <div className="hg-strategy-box sensory">
                  <div className="hg-section-title">✅ Strategies That Help</div>
                  <ul className="hg-feature-list">
                    {currentData.sensory.strategies.map((strategy, index) => (
                      <li key={index}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="hg-comparison-card cognitive">
              <div className="hg-card-header">
                <div className="hg-card-icon">💡</div>
                <div>
                  <div className="hg-card-title">{currentData.cognitive.title}</div>
                  <div className="hg-card-subtitle">{currentData.cognitive.subtitle}</div>
                </div>
              </div>
              <div className="hg-card-content">
                <div className="hg-section-title">Common Challenges</div>
                <ul className="hg-feature-list">
                  {currentData.cognitive.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
                <div className="hg-strategy-box cognitive">
                  <div className="hg-section-title">✅ Strategies That Help</div>
                  <ul className="hg-feature-list">
                    {currentData.cognitive.strategies.map((strategy, index) => (
                      <li key={index}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="hg-note">
            <strong>💡 Important Reminders:</strong><br />
            • Every child is different — adapt timelines and strategies to the individual, not the calendar.<br />
            • Regression is normal during stress, illness, or transitions — go back a step and rebuild.<br />
            • Model the behaviour yourself whenever possible — "watch me do it" is more powerful than "let me tell you."<br />
            • Celebrate small wins — each step forward is meaningful progress.<br />
            • Consult an occupational therapist for persistent sensory barriers and a behavioural specialist for cognitive strategies.<br />
            • Always approach these topics with dignity, patience, and respect for the individual's experience.
          </div>
        </div>
      </div>
    </div>
  )
}

export default HygieneGuide