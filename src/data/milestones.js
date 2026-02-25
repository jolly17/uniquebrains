// Milestone configuration for Care Roadmap feature
// This is the single source of truth for all milestones
// To add a new milestone: add it to this array with the next order number
export const MILESTONES = [
  {
    id: 'diagnosis',
    title: 'Diagnosis',
    description: 'Find diagnostic centers, specialists, and assessment services for neurodiversity evaluation.',
    icon: '🔍',
    path: '/care/diagnosis',
    order: 1
  },
  {
    id: 'therapies',
    title: 'Therapies',
    description: 'Discover therapy options including occupational, speech, behavioral, and specialized interventions.',
    icon: '🧩',
    path: '/care/therapies',
    order: 2
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Find schools, special education programs, and educational resources from early intervention through college.',
    icon: '📚',
    path: '/care/education',
    order: 3
  },
  {
    id: 'trainings',
    title: 'Trainings',
    description: 'Access vocational training, skill development programs, and certification courses.',
    icon: '🎓',
    path: '/care/trainings',
    order: 4
  },
  {
    id: 'ngo-advocacy',
    title: 'NGO/Advocacy',
    description: 'Connect with NGOs, advocacy groups, and support organizations working for neurodivergent rights.',
    icon: '🤝',
    path: '/care/ngo-advocacy',
    order: 5
  },
  {
    id: 'care-home',
    title: 'Care Home',
    description: 'Find residential care facilities, group homes, and supported living arrangements for neurodivergent individuals.',
    icon: '🏡',
    path: '/care/care-home',
    order: 6
  },
  {
    id: 'jobs-livelihood',
    title: 'Jobs/Livelihood',
    description: 'Connect with employers, job placement services, and career support for neurodivergent individuals.',
    icon: '💼',
    path: '/care/jobs-livelihood',
    order: 7
  }
];

// Helper function to get all valid milestone IDs (for validation)
export function getValidMilestoneIds() {
  return MILESTONES.map(m => m.id);
}

// Helper function to check if a milestone ID is valid
export function isValidMilestone(milestoneId) {
  return MILESTONES.some(m => m.id === milestoneId);
}

export function getMilestoneByPath(path) {
  return MILESTONES.find(m => m.path === path);
}

export function getMilestoneById(id) {
  return MILESTONES.find(m => m.id === id);
}

export function getNextMilestone(currentId) {
  const current = MILESTONES.find(m => m.id === currentId);
  if (!current || current.order === MILESTONES.length) return null;
  return MILESTONES.find(m => m.order === current.order + 1);
}

export function getPreviousMilestone(currentId) {
  const current = MILESTONES.find(m => m.id === currentId);
  if (!current || current.order === 1) return null;
  return MILESTONES.find(m => m.order === current.order - 1);
}
