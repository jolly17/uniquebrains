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
    id: 'daycare',
    title: 'Daycare',
    description: 'Locate inclusive daycare centers and early childhood programs with neurodiversity support.',
    icon: '🏠',
    path: '/care/daycare',
    order: 3
  },
  {
    id: 'primary-school',
    title: 'Primary School',
    description: 'Find elementary schools, special education programs, and educational resources for K-5 students.',
    icon: '📖',
    path: '/care/primary-school',
    order: 4
  },
  {
    id: 'secondary-school',
    title: 'Secondary School',
    description: 'Explore middle and high schools with support services and inclusive programs for grades 6-12.',
    icon: '🎒',
    path: '/care/secondary-school',
    order: 5
  },
  {
    id: 'college',
    title: 'College',
    description: 'Explore colleges with disability services, support programs, and inclusive learning environments.',
    icon: '🎓',
    path: '/care/college',
    order: 6
  },
  {
    id: 'trainings',
    title: 'Trainings',
    description: 'Access vocational training, skill development programs, and certification courses.',
    icon: '📚',
    path: '/care/trainings',
    order: 7
  },
  {
    id: 'jobs',
    title: 'Jobs',
    description: 'Connect with employers, job placement services, and career support for neurodivergent individuals.',
    icon: '💼',
    path: '/care/jobs',
    order: 8
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
