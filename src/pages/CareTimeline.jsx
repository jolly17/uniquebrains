import { useNavigate } from 'react-router-dom';
import { MILESTONES } from '../data/milestones';
import './CareTimeline.css';

function CareTimeline() {
  const navigate = useNavigate();

  const handleMilestoneClick = (milestone) => {
    navigate(milestone.path);
  };

  return (
    <div className="care-timeline">
      <div className="care-hero">
        <div className="hero-content">
          <h1>🏥 Your Care Journey</h1>
          <p className="hero-subtitle">
            From diagnosis to college and beyond—navigate your care journey with our interactive roadmap. 
            Find therapists, schools, and services that actually work.
          </p>
        </div>
      </div>

      <div className="roadmap-container">
        {/* Desktop curvy path */}
        <svg className="roadmap-path roadmap-path-desktop" viewBox="0 0 1200 2400" preserveAspectRatio="xMidYMid meet">
          {/* Curvy path connecting all milestones */}
          <path
            d="M 600 100 
               Q 800 200, 600 300
               Q 400 400, 600 500
               Q 800 600, 600 700
               Q 400 800, 600 900
               Q 800 1000, 600 1100
               Q 400 1200, 600 1300
               Q 800 1400, 600 1500
               Q 400 1600, 600 1700"
            className="roadmap-line"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="20,10"
          />
        </svg>

        {/* Mobile vertical path */}
        <svg className="roadmap-path roadmap-path-mobile" viewBox="0 0 100 2000" preserveAspectRatio="xMidYMid meet">
          <path
            d="M 50 0 L 50 2000"
            className="roadmap-line"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="15,8"
          />
        </svg>

        <div className="milestones-wrapper">
          {MILESTONES.map((milestone, index) => {
            // Alternate left and right positioning
            const isLeft = index % 2 === 0;
            const topPosition = 100 + (index * 200);
            
            return (
              <div
                key={milestone.id}
                className={`milestone-card ${isLeft ? 'milestone-left' : 'milestone-right'}`}
                style={{ top: `${topPosition}px` }}
                onClick={() => handleMilestoneClick(milestone)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleMilestoneClick(milestone);
                  }
                }}
                aria-label={`Navigate to ${milestone.title}: ${milestone.description}`}
              >
                <div className="milestone-number">{milestone.order}</div>
                <div className="milestone-icon">{milestone.icon}</div>
                <div className="milestone-content">
                  <h3 className="milestone-title">{milestone.title}</h3>
                  <p className="milestone-description">{milestone.description}</p>
                </div>
                <div className="milestone-arrow">→</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CareTimeline;
