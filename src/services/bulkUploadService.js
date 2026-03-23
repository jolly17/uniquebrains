// Bulk upload service for care resources
import { supabase } from '../lib/supabase';
import { geocodeAddress } from '../lib/geocoding';
import { getValidMilestoneIds } from '../data/milestones';

// Country center coordinates for online services
const COUNTRY_CENTERS = {
  'US': { lat: 39.8283, lng: -98.5795 },
  'IN': { lat: 20.5937, lng: 78.9629 },
  'GB': { lat: 55.3781, lng: -3.4360 },
  'CA': { lat: 56.1304, lng: -106.3468 },
  'AU': { lat: -25.2744, lng: 133.7751 },
  'DEFAULT': { lat: 0, lng: 0 }
};
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Parse CSV/Excel file and upload resources
 * @param {File} file - CSV or Excel file
 * @param {Object} user - Current user object
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<Object>} - Upload results with success/failure counts
 */
export async function bulkUploadResources(file, user, onProgress = null) {
  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }

  // Parse file (CSV or Excel)
  const rows = await parseFile(file);
  
  const results = {
    total: rows.length,
    successful: 0,
    failed: 0,
    errors: [],
    skipped: 0
  };

  // Process each row with rate limiting
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // +2 for header row and 0-index
    
    // Report progress
    if (onProgress) {
      onProgress(i + 1, rows.length);
    }
    
    try {
      // Skip empty rows
      if (!row.name && !row.address) {
        results.skipped++;
        continue;
      }
      
      // Validate required fields
      validateRow(row, rowNumber);
      
      // Geocode address to coordinates
      const coordinates = await geocodeAddress({
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        country: row.country
      });
      
      if (!coordinates) {
        throw new Error('Failed to geocode address. Please verify the address is correct.');
      }
      
      // Parse tags if provided
      const tags = row.tags 
        ? row.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : [];
      
      // Parse condition if provided
      const condition = row.condition 
        ? row.condition.split(',').map(c => c.trim()).filter(c => c.length > 0)
        : [];
      
      // Parse verified field
      const verified = row.verified === 'true' || 
                      row.verified === '1' || 
                      row.verified === true ||
                      row.verified === 'TRUE' ||
                      row.verified === 'True';
      
      // Insert resource
      const { error } = await supabase
        .from('care_resources')
        .insert({
          milestone: row.milestone.toLowerCase().trim(),
          name: row.name.trim(),
          description: row.description?.trim() || null,
          address: row.address.trim(),
          city: row.city?.trim() || null,
          state: row.state?.trim() || null,
          zip_code: row.zip_code?.trim() || null,
          country: row.country.toUpperCase().trim(),
          coordinates: `POINT(${coordinates.lng} ${coordinates.lat})`,
          lat: coordinates.lat,
          lng: coordinates.lng,
          phone: row.phone?.trim() || null,
          email: row.email?.trim() || null,
          website: row.website?.trim() || null,
          experience_years: row.experience_years ? parseInt(row.experience_years) : null,
          tags: tags,
          condition: condition,
          rating: row.rating ? parseFloat(row.rating) : null,
          review_count: row.review_count ? parseInt(row.review_count) : 0,
          verified: verified
        });
      
      if (error) throw error;
      
      results.successful++;
      
      // Note: Rate limiting is now handled internally by the geocoding module
      // (enforceNominatimRateLimit) so no additional delay is needed here.
      
    } catch (error) {
      results.failed++;
      results.errors.push({
        row: rowNumber,
        name: row.name || 'Unknown',
        address: row.address || 'N/A',
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Validate a single row
 * @param {Object} row - Row data
 * @param {number} rowNumber - Row number for error reporting
 * @throws {Error} - Validation error
 */
function validateRow(row, rowNumber) {
  const required = ['milestone', 'name', 'address', 'country'];
  const missing = required.filter(field => !row[field] || row[field].trim() === '');
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  // Validate milestone
  const validMilestones = getValidMilestoneIds();
  const milestone = row.milestone.toLowerCase().trim();
  if (!validMilestones.includes(milestone)) {
    throw new Error(`Invalid milestone: ${row.milestone}. Must be one of: ${validMilestones.join(', ')}`);
  }
  
  // Validate email format if provided
  if (row.email && row.email.trim() !== '') {
    if (!row.email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
      throw new Error(`Invalid email format: ${row.email}`);
    }
  }
  
  // Validate website format if provided
  if (row.website && row.website.trim() !== '') {
    if (!row.website.match(/^https?:\/\//)) {
      throw new Error(`Invalid website URL (must start with http:// or https://): ${row.website}`);
    }
  }
  
  // Validate experience_years if provided
  if (row.experience_years && row.experience_years !== '') {
    const years = parseInt(row.experience_years);
    if (isNaN(years) || years < 0 || years > 100) {
      throw new Error(`Invalid experience_years: ${row.experience_years}. Must be 0-100.`);
    }
  }
  
  // Validate rating if provided
  if (row.rating && row.rating !== '') {
    const rating = parseFloat(row.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      throw new Error(`Invalid rating: ${row.rating}. Must be 0.0-5.0.`);
    }
  }
  
  // Validate review_count if provided
  if (row.review_count && row.review_count !== '') {
    const count = parseInt(row.review_count);
    if (isNaN(count) || count < 0) {
      throw new Error(`Invalid review_count: ${row.review_count}. Must be a positive integer.`);
    }
  }
  
  // Validate country code (2 letters)
  if (row.country.length !== 2) {
    throw new Error(`Invalid country code: ${row.country}. Must be 2-letter ISO code (e.g., US, IN, GB).`);
  }
}

/**
 * Parse CSV or Excel file
 * @param {File} file - File to parse
 * @returns {Promise<Array>} - Array of row objects
 */
async function parseFile(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  
  if (extension === 'csv') {
    return parseCSV(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file);
  } else {
    throw new Error('Unsupported file format. Please upload CSV or Excel (.xlsx, .xls) file.');
  }
}

/**
 * Parse CSV file using PapaParse
 * @param {File} file - CSV file
 * @returns {Promise<Array>} - Array of row objects
 */
function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
        } else {
          // Filter out comment lines (starting with #)
          const rows = results.data.filter(row => {
            const firstValue = Object.values(row)[0];
            return firstValue && !firstValue.toString().startsWith('#');
          });
          resolve(rows);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
}

/**
 * Parse Excel file using XLSX
 * @param {File} file - Excel file
 * @returns {Promise<Array>} - Array of row objects
 */
async function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          raw: false, // Get formatted strings
          defval: '' // Default value for empty cells
        });
        
        // Normalize headers to lowercase
        const normalizedRows = rows.map(row => {
          const normalizedRow = {};
          for (const [key, value] of Object.entries(row)) {
            normalizedRow[key.trim().toLowerCase()] = value;
          }
          return normalizedRow;
        });
        
        resolve(normalizedRows);
      } catch (error) {
        reject(new Error(`Failed to parse Excel: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate error report CSV
 * @param {Array} errors - Array of error objects
 * @returns {string} - CSV string
 */
export function generateErrorReport(errors) {
  const headers = ['Row', 'Name', 'Address', 'Error'];
  const rows = errors.map(e => [e.row, e.name, e.address, e.error]);
  
  return Papa.unparse({
    fields: headers,
    data: rows
  });
}
