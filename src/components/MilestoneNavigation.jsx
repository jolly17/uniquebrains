import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getNextMilestone, getPreviousMilestone } from '../data/milestones';
import './MilestoneNavigation.css';

/**
 * MilestoneNavigation Component
 * 
 * Provides navigation controls for moving between milestones:
 * - Previous button (disabled on first milestone)
 * - Back to Timeline button
 * - Next button (disabled on last milestone)
 * 
 * Preserves location in URL when navigating between milestones.
 * 
 * @param {Object} props
 * @param {string} props.currentMilestone - The current milestone ID
 */
export default function MilestoneNavigation({ currentMilestone }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get previous and next milestones
  const previousMilestone = getPreviousMilestone(currentMilestone);
  const nextMilestone = getNextMilestone(currentMilestone);
  
  // Preserve location parameters when navigating
  const preserveLocationParams = () => {
    const params = {};
    if (searchParams.has('lat')) params.lat = searchParams.get('lat');
    if (searchParams.has('lng')) params.lng = searchParams.get('lng');
    if (searchParams.has('zoom')) params.zoom = searchParams.get('zoom');
    return new URLSearchParams(params).toString();
  };
  
  const locationQuery = preserveLocationParams();
  const queryString = locationQuery ? `?${locationQuery}` : '';
  
  const handlePrevious = () => {
    if (previousMilestone) {
      navigate(`${previousMilestone.path}${queryString}`);
    }
  };
  
  const handleNext = () => {
    if (nextMilestone) {
      navigate(`${nextMilestone.path}${queryString}`);
    }
  };
  
  return (
    <nav className="milestone-navigation" aria-label="Milestone navigation">
      <button
        className="milestone-nav-button milestone-nav-previous"
        onClick={handlePrevious}
        disabled={!previousMilestone}
        aria-label={previousMilestone ? `Go to ${previousMilestone.title}` : 'No previous milestone'}
      >
        <span className="milestone-nav-icon">←</span>
        <span className="milestone-nav-text">
          {previousMilestone ? previousMilestone.title : 'Previous'}
        </span>
      </button>
      
      <Link
        to="/care"
        className="milestone-nav-button milestone-nav-timeline"
        aria-label="Back to Care Timeline"
      >
        <span className="milestone-nav-icon">⊞</span>
        <span className="milestone-nav-text">Timeline</span>
      </Link>
      
      <button
        className="milestone-nav-button milestone-nav-next"
        onClick={handleNext}
        disabled={!nextMilestone}
        aria-label={nextMilestone ? `Go to ${nextMilestone.title}` : 'No next milestone'}
      >
        <span className="milestone-nav-text">
          {nextMilestone ? nextMilestone.title : 'Next'}
        </span>
        <span className="milestone-nav-icon">→</span>
      </button>
    </nav>
  );
}
