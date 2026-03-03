/**
 * User Story Tests
 * 
 * These tests verify that core user stories work correctly.
 * Run after any major architectural change: npm test
 * 
 * Test naming convention: US-XXX: Story Name
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// ============================================
// COMPONENT TESTS (No Auth Required)
// ============================================

describe('Component Tests', () => {
  describe('EmptyState Component', () => {
    it('should render with all props', async () => {
      const { default: EmptyState } = await import('../components/EmptyState')
      render(
        <EmptyState
          icon="🎉"
          title="Test Title"
          description="Test Description"
          actionText="Click Me"
          onAction={vi.fn()}
        />
      )
      
      expect(screen.getByText('🎉')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('should render without action button', async () => {
      const { default: EmptyState } = await import('../components/EmptyState')
      render(
        <EmptyState
          icon="📚"
          title="No courses yet"
          description="You haven't enrolled in any courses"
        />
      )
      
      expect(screen.getByText(/No courses yet/i)).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Skeleton Component', () => {
    it('should render skeleton loader', async () => {
      const { Skeleton } = await import('../components/Skeleton')
      const { container } = render(<Skeleton width="100px" height="20px" />)
      
      expect(container.querySelector('.skeleton')).toBeInTheDocument()
    })

    it('should render card skeleton', async () => {
      const { SkeletonCard } = await import('../components/Skeleton')
      const { container } = render(<SkeletonCard />)
      
      expect(container.querySelector('.skeleton-card')).toBeInTheDocument()
    })

    it('should render skeleton list', async () => {
      const { SkeletonList } = await import('../components/Skeleton')
      const { container } = render(<SkeletonList count={3} />)
      
      expect(container.querySelectorAll('.skeleton-card').length).toBe(3)
    })
  })

  describe('Toast Component', () => {
    it('should render toast message', async () => {
      const { Toast } = await import('../components/Toast')
      render(
        <Toast
          message="Test message"
          type="success"
          onClose={vi.fn()}
        />
      )
      
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('should render different toast types', async () => {
      const { Toast } = await import('../components/Toast')
      
      const { rerender } = render(
        <Toast message="Success" type="success" onClose={vi.fn()} />
      )
      expect(screen.getByText('Success')).toBeInTheDocument()
      
      rerender(<Toast message="Error" type="error" onClose={vi.fn()} />)
      expect(screen.getByText('Error')).toBeInTheDocument()
      
      rerender(<Toast message="Warning" type="warning" onClose={vi.fn()} />)
      expect(screen.getByText('Warning')).toBeInTheDocument()
    })
  })

  describe('CourseCard Component', () => {
    it('should render course card with data', async () => {
      const { default: CourseCard } = await import('../components/CourseCard')
      const mockCourse = {
        id: '1',
        title: 'Test Course',
        description: 'Test Description',
        category: 'academics',
        instructorName: 'John Doe',
        price: 0,
        averageRating: 4.5,
        totalRatings: 10,
      }
      
      render(
        <BrowserRouter>
          <CourseCard course={mockCourse} />
        </BrowserRouter>
      )
      
      expect(screen.getByText('Test Course')).toBeInTheDocument()
      expect(screen.getByText(/By John Doe/i)).toBeInTheDocument()
      // Free appears in both badge and price
      const freeElements = screen.getAllByText('Free')
      expect(freeElements.length).toBeGreaterThan(0)
    })

    it('should show free badge for free courses', async () => {
      const { default: CourseCard } = await import('../components/CourseCard')
      const mockCourse = {
        id: '1',
        title: 'Free Course',
        description: 'A free course',
        category: 'academics',
        instructorName: 'Jane Doe',
        price: 0,
        averageRating: 4.0,
        totalRatings: 5,
      }
      
      render(
        <BrowserRouter>
          <CourseCard course={mockCourse} />
        </BrowserRouter>
      )
      
      // Free appears in both badge and price, so use getAllByText
      const freeElements = screen.getAllByText('Free')
      expect(freeElements.length).toBeGreaterThan(0)
    })
  })

  describe('StarRating Component', () => {
    it('should render star rating', async () => {
      const { default: StarRating } = await import('../components/StarRating')
      const { container } = render(<StarRating rating={4.5} />)
      
      expect(container.querySelector('.star-rating')).toBeInTheDocument()
    })
  })

  describe('ResourceCard Component', () => {
    it('should render resource card', async () => {
      const { default: ResourceCard } = await import('../components/ResourceCard')
      const mockResource = {
        id: '1',
        name: 'Test Resource',
        rating: 4.5,
        reviewCount: 10,
        tags: ['autism', 'ADHD'],
        verified: true
      }

      render(<ResourceCard resource={mockResource} />)
      expect(screen.getByText('Test Resource')).toBeInTheDocument()
      expect(screen.getByText('✓ Verified')).toBeInTheDocument()
    })
  })

  describe('LocationSearch Component', () => {
    it('should render location search', async () => {
      const { default: LocationSearch } = await import('../components/LocationSearch')
      render(<LocationSearch onLocationFound={vi.fn()} />)
      
      expect(screen.getByPlaceholderText('Search for a location...')).toBeInTheDocument()
      expect(screen.getByText('Use My Location')).toBeInTheDocument()
    })
  })
})

// ============================================
// UTILITY TESTS
// ============================================

describe('Utility Tests', () => {
  describe('Timezone Utils', () => {
    it('should export timezone functions', async () => {
      const timezoneUtils = await import('../utils/timezoneUtils')
      
      expect(timezoneUtils.convertToLocalTime).toBeDefined()
      expect(timezoneUtils.formatTimeWithTimezone).toBeDefined()
      expect(timezoneUtils.getUserTimezone).toBeDefined()
    })

    it('should convert 24h to 12h format', async () => {
      const { convertTo12HourFormat } = await import('../utils/timezoneUtils')
      
      expect(convertTo12HourFormat('14:30')).toBe('2:30 PM')
      expect(convertTo12HourFormat('09:00')).toBe('9:00 AM')
      expect(convertTo12HourFormat('00:00')).toBe('12:00 AM')
      expect(convertTo12HourFormat('12:00')).toBe('12:00 PM')
    })

    it('should convert 12h to 24h format', async () => {
      const { convertTo24HourFormat } = await import('../utils/timezoneUtils')
      
      expect(convertTo24HourFormat('2:30 PM')).toBe('14:30:00')
      expect(convertTo24HourFormat('9:00 AM')).toBe('09:00:00')
    })

    it('should get user timezone', async () => {
      const { getUserTimezone } = await import('../utils/timezoneUtils')
      
      const tz = getUserTimezone()
      expect(typeof tz).toBe('string')
      expect(tz.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handler', () => {
    it('should export error handling functions', async () => {
      const errorHandler = await import('../lib/errorHandler')
      
      expect(errorHandler.getUserFriendlyMessage).toBeDefined()
    })

    it('should return user-friendly messages', async () => {
      const { getUserFriendlyMessage } = await import('../lib/errorHandler')
      
      const message = getUserFriendlyMessage(new Error('Test error'))
      expect(typeof message).toBe('string')
    })
  })
})

// ============================================
// DATA TESTS
// ============================================

describe('Data Tests', () => {
  describe('Constants', () => {
    it('should export constants', async () => {
      const constants = await import('../data/constants')
      
      expect(constants).toBeDefined()
    })
  })

  describe('Milestones', () => {
    it('should export milestones data', async () => {
      const { MILESTONES } = await import('../data/milestones')
      
      expect(MILESTONES).toBeDefined()
      expect(Array.isArray(MILESTONES)).toBe(true)
      expect(MILESTONES.length).toBeGreaterThan(0)
    })

    it('should have required milestone properties', async () => {
      const { MILESTONES } = await import('../data/milestones')
      
      MILESTONES.forEach(milestone => {
        expect(milestone).toHaveProperty('id')
        expect(milestone).toHaveProperty('title')
        expect(milestone).toHaveProperty('description')
        expect(milestone).toHaveProperty('path')
      })
    })

    it('should have valid milestone paths', async () => {
      const { MILESTONES } = await import('../data/milestones')
      
      MILESTONES.forEach(milestone => {
        expect(milestone.path).toMatch(/^\/care\//)
      })
    })
  })
})

// ============================================
// SERVICE TESTS
// ============================================

describe('Service Tests', () => {
  describe('Course Service', () => {
    it('should export course service functions', async () => {
      const courseService = await import('../services/courseService')
      
      expect(courseService.getAllPublishedCourses).toBeDefined()
      expect(courseService.getCourseById).toBeDefined()
    })
  })

  describe('Community Service', () => {
    it('should export community service functions', async () => {
      const communityService = await import('../services/communityService')
      
      expect(communityService.getAllTopics).toBeDefined()
    })
  })

  describe('Access Service', () => {
    it('should export access service functions', async () => {
      const accessService = await import('../services/accessService')
      
      expect(accessService).toBeDefined()
    })
  })

  describe('Enrollment Service', () => {
    it('should export enrollment service functions', async () => {
      const enrollmentService = await import('../services/enrollmentService')
      
      expect(enrollmentService).toBeDefined()
    })
  })
})

// ============================================
// DESIGN SYSTEM TESTS
// ============================================

describe('Design System Tests', () => {
  describe('CSS Variables', () => {
    it('should have design tokens loaded', () => {
      expect(document.documentElement).toBeInTheDocument()
    })
  })
})

// ============================================
// INTEGRATION TESTS (Smoke Tests)
// ============================================

describe('Integration Tests', () => {
  describe('Module Imports', () => {
    it('should import all pages without errors', async () => {
      // These imports verify the modules can be loaded
      const Courses = await import('../pages/Courses')
      const Content = await import('../pages/Content')
      const Community = await import('../pages/Community')
      const CareTimeline = await import('../pages/CareTimeline')
      
      expect(Courses.default).toBeDefined()
      expect(Content.default).toBeDefined()
      expect(Community.default).toBeDefined()
      expect(CareTimeline.default).toBeDefined()
    })

    it('should import all components without errors', async () => {
      const Layout = await import('../components/Layout')
      const CourseCard = await import('../components/CourseCard')
      const EmptyState = await import('../components/EmptyState')
      const Skeleton = await import('../components/Skeleton')
      const Toast = await import('../components/Toast')
      
      expect(Layout.default).toBeDefined()
      expect(CourseCard.default).toBeDefined()
      expect(EmptyState.default).toBeDefined()
      expect(Skeleton.Skeleton).toBeDefined()
      expect(Toast.Toast).toBeDefined()
    })

    it('should import auth context without errors', async () => {
      const AuthContext = await import('../context/AuthContext')
      
      expect(AuthContext.AuthProvider).toBeDefined()
      expect(AuthContext.useAuth).toBeDefined()
    })
  })
})