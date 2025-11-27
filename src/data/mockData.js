export const mockCourses = [
  {
    id: '1',
    title: 'Positive Parenting Fundamentals',
    description: 'Learn evidence-based strategies for raising confident, resilient children through positive discipline and emotional connection.',
    category: 'parenting',
    price: 49.99,
    instructorId: '1',
    instructorName: 'Dr. Sarah Johnson',
    isPublished: true,
    averageRating: 4.8,
    totalRatings: 127,
    thumbnail: null,
    sessionDuration: 60,
    sessionFrequency: 'weekly',
    selectedDays: ['Monday', 'Wednesday'],
    dayTimes: { Monday: '10:00', Wednesday: '10:00' },
    isSelfPaced: false,
    enrollmentLimit: 15,
    currentEnrollment: 12,
    learningObjectives: [
      'Understand child development stages and age-appropriate expectations',
      'Master effective communication techniques for connecting with your child',
      'Learn positive discipline strategies that build cooperation',
      'Set healthy boundaries while maintaining emotional connection',
      'Handle challenging behaviors with confidence and compassion',
      'Build your child\'s self-esteem and emotional intelligence'
    ]
  },
  {
    id: '2',
    title: 'Piano for Beginners',
    description: 'Start your musical journey with comprehensive piano lessons designed for absolute beginners.',
    category: 'music',
    price: 79.99,
    instructorId: '2',
    instructorName: 'Michael Chen',
    isPublished: true,
    averageRating: 4.9,
    totalRatings: 89,
    thumbnail: null,
    sessionDuration: 45,
    sessionFrequency: 'biweekly',
    selectedDays: [],
    isSelfPaced: false,
    enrollmentLimit: 8,
    currentEnrollment: 8,
    learningObjectives: [
      'Develop proper posture and hand position at the piano',
      'Learn to read sheet music and understand musical notation',
      'Master basic scales, chords, and finger exercises',
      'Play simple melodies and popular songs',
      'Understand rhythm, tempo, and musical expression',
      'Build confidence in performance and practice habits'
    ]
  },
  {
    id: '3',
    title: 'Creative Dance for Kids',
    description: 'Fun and engaging dance classes that help children express themselves through movement.',
    category: 'dance',
    price: 0,
    instructorId: '3',
    instructorName: 'Emma Rodriguez',
    isPublished: true,
    averageRating: 4.7,
    totalRatings: 156,
    thumbnail: null,
    sessionDuration: 30,
    sessionFrequency: 'weekly',
    selectedDays: ['Tuesday', 'Thursday'],
    dayTimes: { Tuesday: '15:30', Thursday: '15:30' },
    isSelfPaced: false,
    enrollmentLimit: 20,
    currentEnrollment: 15,
    learningObjectives: [
      'Explore creative movement and self-expression through dance',
      'Learn basic dance techniques and coordination',
      'Develop rhythm, musicality, and body awareness',
      'Build confidence and stage presence',
      'Create and perform original dance routines',
      'Have fun while staying active and healthy'
    ]
  },
  {
    id: '4',
    title: 'Drama and Theater Arts',
    description: 'Build confidence and creativity through theatrical performance and improvisation.',
    category: 'drama',
    price: 59.99,
    instructorId: '4',
    instructorName: 'James Williams',
    isPublished: true,
    averageRating: 4.6,
    totalRatings: 73,
    thumbnail: null,
    sessionDuration: 0,
    sessionFrequency: '',
    selectedDays: [],
    isSelfPaced: true,
    enrollmentLimit: null,
    currentEnrollment: 45,
    learningObjectives: [
      'Develop voice projection and clear articulation',
      'Master character development and emotional expression',
      'Learn improvisation techniques and quick thinking',
      'Build confidence in public speaking and performance',
      'Understand stage presence and audience engagement',
      'Collaborate effectively in ensemble performances'
    ]
  }
]

export const mockStudents = [
  {
    id: '1',
    firstName: 'Emma',
    lastName: 'Thompson',
    email: 'emma@example.com',
    neurodiversityProfile: ['autism'],
    otherNeeds: null
  },
  {
    id: '2',
    firstName: 'Liam',
    lastName: 'Chen',
    email: 'liam@example.com',
    neurodiversityProfile: ['adhd', 'dyslexia'],
    otherNeeds: null
  },
  {
    id: '3',
    firstName: 'Sophia',
    lastName: 'Rodriguez',
    email: 'sophia@example.com',
    neurodiversityProfile: ['other'],
    otherNeeds: 'Sensory processing differences'
  }
]

export const mockHomework = [
  {
    id: '1',
    courseId: '1',
    title: 'Practice Active Listening',
    description: 'Practice active listening with your child for 10 minutes daily and record your observations.',
    submissionType: 'audio',
    dueDate: '2024-12-31',
    isComplete: false
  },
  {
    id: '2',
    courseId: '1',
    title: 'Create a Behavior Chart',
    description: 'Design and implement a positive behavior chart for your family.',
    submissionType: 'checkmark',
    dueDate: '2024-12-25',
    isComplete: false
  }
]

export const mockReviews = [
  {
    id: '1',
    courseId: '1',
    studentName: 'Jennifer Smith',
    rating: 5,
    reviewText: 'This course completely transformed my parenting approach. Dr. Johnson\'s techniques are practical and effective!',
    createdAt: '2024-11-15'
  },
  {
    id: '2',
    courseId: '1',
    studentName: 'Robert Brown',
    rating: 4,
    reviewText: 'Great content and well-structured lessons. Would have liked more real-world examples.',
    createdAt: '2024-11-10'
  }
]
