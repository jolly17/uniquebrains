// Milestone configuration for Care Roadmap feature
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
    id: 'jobs-livelihood',
    title: 'Jobs/Livelihood',
    description: 'Connect with employers, job placement services, and career support for neurodivergent individuals.',
    icon: '💼',
    path: '/care/jobs-livelihood',
    order: 6
  }
];

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
