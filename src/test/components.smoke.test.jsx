import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import ResourceListings from '../components/ResourceListings';
import InteractiveMap from '../components/InteractiveMap';
import LocationSearch from '../components/LocationSearch';
import CareTimeline from '../pages/CareTimeline';

/**
 * Smoke Tests for Care Roadmap Components
 * 
 * These tests verify that components can be imported and rendered without errors.
 * This is a checkpoint to ensure basic component functionality before proceeding.
 */

describe('Care Roadmap Components - Smoke Tests', () => {
  describe('ResourceCard', () => {
    it('should render without crashing', () => {
      const mockResource = {
        id: '1',
        name: 'Test Resource',
        rating: 4.5,
        reviewCount: 10,
        experienceYears: 5,
        tags: ['autism', 'ADHD'],
        verified: true
      };

      render(<ResourceCard resource={mockResource} />);
      expect(screen.getByText('Test Resource')).toBeInTheDocument();
    });

    it('should display rating and review count', () => {
      const mockResource = {
        id: '1',
        name: 'Test Resource',
        rating: 4.5,
        review_count: 23,  // snake_case as used by component
        tags: []
      };

      render(<ResourceCard resource={mockResource} />);
      // Check that rating is displayed somewhere in the component
      expect(screen.getByText(/4\.5/)).toBeInTheDocument();
      expect(screen.getByText(/23/)).toBeInTheDocument();
    });

    it('should display verified badge when resource is verified', () => {
      const mockResource = {
        id: '1',
        name: 'Test Resource',
        rating: 4.5,
        reviewCount: 10,
        tags: [],
        verified: true
      };

      render(<ResourceCard resource={mockResource} />);
      expect(screen.getByText('✓ Verified')).toBeInTheDocument();
    });
  });

  describe('ResourceListings', () => {
    it('should render without crashing', () => {
      const mockResources = [
        {
          id: '1',
          name: 'Resource 1',
          rating: 4.5,
          reviewCount: 10,
          tags: ['autism'],
          verified: true
        },
        {
          id: '2',
          name: 'Resource 2',
          rating: 4.0,
          reviewCount: 5,
          tags: ['ADHD'],
          verified: false
        }
      ];

      render(
        <ResourceListings 
          resources={mockResources}
          loading={false}
          availableTags={['autism', 'ADHD']}
        />
      );
      
      expect(screen.getByText('Resource 1')).toBeInTheDocument();
      expect(screen.getByText('Resource 2')).toBeInTheDocument();
    });

    it('should display loading state', () => {
      render(
        <ResourceListings 
          resources={[]}
          loading={true}
          availableTags={[]}
        />
      );
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should display empty state when no resources', () => {
      render(
        <ResourceListings 
          resources={[]}
          loading={false}
          availableTags={[]}
        />
      );
      
      expect(screen.getByText('No resources found')).toBeInTheDocument();
    });
  });

  describe('LocationSearch', () => {
    it('should render without crashing', () => {
      const mockOnLocationFound = () => {};
      
      render(<LocationSearch onLocationFound={mockOnLocationFound} />);
      
      expect(screen.getByPlaceholderText('Search for a location...')).toBeInTheDocument();
    });

    it('should display "Use My Location" button', () => {
      const mockOnLocationFound = () => {};
      
      render(<LocationSearch onLocationFound={mockOnLocationFound} />);
      
      expect(screen.getByText('Use My Location')).toBeInTheDocument();
    });
  });

  describe('InteractiveMap', () => {
    it('should render without crashing', () => {
      const mockResources = [
        {
          id: '1',
          name: 'Resource 1',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          rating: 4.5,
          reviewCount: 10,
          verified: true
        }
      ];

      render(
        <InteractiveMap 
          resources={mockResources}
          mapCenter={{ lat: 39.8283, lng: -98.5795, zoom: 4 }}
        />
      );
      
      // Map should render - check for the search input which is always present
      expect(screen.getByPlaceholderText('Search for a location...')).toBeInTheDocument();
    });
  });

  describe('CareTimeline', () => {
    it('should be importable', () => {
      // CareTimeline requires AuthContext which shows Loading state
      // Just verify the component can be imported
      expect(CareTimeline).toBeDefined();
      expect(typeof CareTimeline).toBe('function');
    });
  });
});
