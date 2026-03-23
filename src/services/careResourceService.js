import { supabase } from '../lib/supabase'
import { handleSupabaseError } from '../lib/errorHandler'
import { geocodeAddress } from '../lib/geocoding'

/**
 * Care Resource Service - Backend API functions for care resource management
 * Handles all care resource-related database operations with proper error handling
 * Requirements: 6.1, 6.2, 6.4, 6.5
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in miles
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Fallback function when RPC is not available
 */
async function getResourcesFallback({
  milestone,
  latitude,
  longitude,
  radiusMiles,
  tags,
  verifiedOnly,
  limit,
  offset
}) {
  try {
    let query = supabase
      .from('care_resources')
      .select('*')
      .eq('milestone', milestone)

    // Apply tag filter if provided
    if (tags.length > 0) {
      query = query.contains('tags', tags)
    }

    // Apply verified filter
    if (verifiedOnly) {
      query = query.eq('verified', true)
    }

    // Apply pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true })

    const { data, error } = await query

    if (error) {
      throw handleSupabaseError(error, {
        operation: 'getResourcesByMilestoneAndLocation',
        table: 'care_resources',
      })
    }

    // Transform to include coordinates object from lat/lng columns
    let resources = (data || []).map(resource => {
      return {
        ...resource,
        coordinates: resource.lat && resource.lng 
          ? { lat: resource.lat, lng: resource.lng }
          : null
      }
    })

    // Apply location filter client-side if coordinates provided
    if (latitude && longitude) {
      resources = resources.filter(resource => {
        if (!resource.coordinates) return false
        
        // Calculate distance using Haversine formula
        const distance = calculateDistance(
          latitude,
          longitude,
          resource.coordinates.lat,
          resource.coordinates.lng
        )
        
        // Add distance to resource
        resource.distance = distance
        
        // Filter by radius
        return distance <= radiusMiles
      })
      
      // Sort by distance
      resources.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    return resources
  } catch (error) {
    console.error('Error in getResourcesFallback:', error)
    throw error
  }
}

/**
 * Fetch resources by milestone and optional location
 * Uses PostGIS for geographic queries
 * @param {Object} params - Query parameters
 * @param {string} params.milestone - Milestone type (diagnosis, therapies, etc.)
 * @param {number} [params.latitude] - Latitude for location-based filtering
 * @param {number} [params.longitude] - Longitude for location-based filtering
 * @param {number} [params.radiusMiles=50] - Search radius in miles
 * @param {string[]} [params.tags=[]] - Filter by tags
 * @param {boolean} [params.verifiedOnly=false] - Filter to verified resources only
 * @param {number} [params.limit=50] - Maximum number of results
 * @param {number} [params.offset=0] - Pagination offset
 * @returns {Promise<Array>} List of resources
 */
export async function getResourcesByMilestoneAndLocation({
  milestone,
  latitude,
  longitude,
  radiusMiles = 50,
  tags = [],
  verifiedOnly = false,
  limit = 50,
  offset = 0
}) {
  if (!milestone) {
    throw new Error('Milestone is required')
  }

  // Use fallback for now - RPC has type matching issues
  return await getResourcesFallback({
    milestone,
    latitude,
    longitude,
    radiusMiles,
    tags,
    verifiedOnly,
    limit,
    offset
  })
}

/**
 * Update a resource's address and re-geocode it to get new coordinates.
 * Admin-only operation.
 * 
 * @param {string} resourceId - The resource ID to update
 * @param {Object} addressFields - New address fields
 * @param {string} addressFields.address - Street address
 * @param {string} [addressFields.city] - City
 * @param {string} [addressFields.state] - State/province
 * @param {string} [addressFields.zip_code] - Postal code
 * @param {string} addressFields.country - Country code (2-letter ISO)
 * @returns {Promise<Object>} Updated resource with new coordinates
 */
export async function updateResourceAddress(resourceId, addressFields) {
  if (!resourceId) {
    throw new Error('Resource ID is required')
  }
  if (!addressFields.address) {
    throw new Error('Address is required')
  }
  if (!addressFields.country) {
    throw new Error('Country code is required')
  }

  // Geocode the new address
  const coordinates = await geocodeAddress({
    address: addressFields.address,
    city: addressFields.city || '',
    state: addressFields.state || '',
    zipCode: addressFields.zip_code || '',
    country: addressFields.country
  })

  if (!coordinates) {
    throw new Error('Failed to geocode the new address. Please verify the address is correct.')
  }

  // Update the resource in the database
  const updateData = {
    address: addressFields.address.trim(),
    city: addressFields.city?.trim() || null,
    state: addressFields.state?.trim() || null,
    zip_code: addressFields.zip_code?.trim() || null,
    country: addressFields.country.toUpperCase().trim(),
    coordinates: `POINT(${coordinates.lng} ${coordinates.lat})`,
    lat: coordinates.lat,
    lng: coordinates.lng
  }

  const { data, error } = await supabase
    .from('care_resources')
    .update(updateData)
    .eq('id', resourceId)
    .select()
    .single()

  if (error) {
    throw handleSupabaseError(error, {
      operation: 'updateResourceAddress',
      table: 'care_resources',
    })
  }

  return {
    ...data,
    coordinates: { lat: data.lat, lng: data.lng }
  }
}
