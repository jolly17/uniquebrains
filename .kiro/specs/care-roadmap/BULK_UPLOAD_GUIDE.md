# Care Resources Bulk Upload Guide

## Overview

Admins can upload multiple care resources at once using CSV or Excel files. The system automatically geocodes addresses to coordinates, eliminating the need for manual coordinate entry.

## Features

- ✅ Upload CSV or Excel (.xlsx, .xls) files
- ✅ Automatic address geocoding (no manual coordinates needed)
- ✅ Batch processing with progress tracking
- ✅ Detailed error reporting with row numbers
- ✅ Download error report as CSV
- ✅ Rate limiting to respect API limits
- ✅ Support for multiple geocoding providers (Nominatim, Google, Mapbox)

## File Format

### Required Columns

| Column | Description | Example |
|--------|-------------|---------|
| `milestone` | Care stage | diagnosis, therapies, education, trainings, ngo-advocacy, care-home, jobs-livelihood |
| `name` | Resource name | Autism Diagnostic Center |
| `address` | Street address | 123 Main St |
| `city` | City name | New York |
| `state` | State/province | NY |
| `zip_code` | Postal code | 10001 |
| `country` | ISO 3166-1 alpha-2 code | US, IN, GB, CA, AU |

### Optional Columns

| Column | Description | Example |
|--------|-------------|---------|
| `description` | Full description | Comprehensive autism diagnostic services... |
| `phone` | Phone number | +1 (212) 555-0123 |
| `email` | Email address | info@example.com |
| `website` | Website URL (must start with http:// or https://) | https://example.com |
| `experience_years` | Years of experience (0-100) | 15 |
| `tags` | Comma-separated tags | autism,ADHD,assessment |
| `rating` | Rating 0.0-5.0 | 4.8 |
| `review_count` | Number of reviews | 127 |
| `verified` | Verified status (true/false or 1/0) | true |

## CSV Template

Download the template: `/templates/care-resources-template.csv`

Example:
```csv
milestone,name,address,city,state,zip_code,country,phone,email,website,experience_years,tags,rating,review_count,verified,description
diagnosis,Autism Diagnostic Center,123 Main St,New York,NY,10001,US,+1 (212) 555-0123,info@autismcenter.com,https://autismcenter.com,15,"autism,ADHD,assessment",4.8,127,true,"Comprehensive autism diagnostic services"
therapies,Speech Therapy Clinic,456 Park Ave,Brooklyn,NY,11201,US,+1 (718) 555-0456,contact@speechclinic.com,https://speechclinic.com,10,"speech therapy,autism",4.5,89,true,"Specialized speech therapy for children"
```

## Geocoding

### How It Works

1. Admin uploads CSV/Excel with address fields (no coordinates needed)
2. System reads each row and extracts address components
3. Address is sent to geocoding service (Nominatim by default)
4. Service returns latitude/longitude coordinates
5. Resource is saved with coordinates in PostGIS format

### Geocoding Providers

**Nominatim (Default - Free)**
- No API key required
- Rate limit: 1 request/second
- Good accuracy for most addresses
- Automatic rate limiting built-in

**Google Geocoding API (Optional)**
- Requires API key: Set `VITE_GOOGLE_GEOCODING_API_KEY` in `.env`
- Rate limit: 50 requests/second
- Best accuracy, especially for international addresses
- Paid service

**Mapbox Geocoding API (Optional)**
- Requires API key: Set `VITE_MAPBOX_API_KEY` in `.env`
- Rate limit: 600 requests/minute
- Good balance of accuracy and cost
- Paid service

### Configuration

To use a different geocoding provider, set in `.env`:

```env
# Default: nominatim (free, no key needed)
VITE_GEOCODING_SERVICE=nominatim

# Or use Google (requires API key)
VITE_GEOCODING_SERVICE=google
VITE_GOOGLE_GEOCODING_API_KEY=your_api_key_here

# Or use Mapbox (requires API key)
VITE_GEOCODING_SERVICE=mapbox
VITE_MAPBOX_API_KEY=your_api_key_here
```

## Upload Process

1. Navigate to Admin Dashboard → Care Resources
2. Click "Upload CSV/Excel" or drag & drop file
3. System validates file format and parses data
4. Progress bar shows upload status
5. Each row is:
   - Validated for required fields
   - Geocoded to get coordinates
   - Inserted into database
6. Results summary displays:
   - Total rows processed
   - Successful uploads
   - Failed uploads
   - Skipped rows (empty)
7. If errors occur, download error report CSV with details

## Error Handling

### Common Errors

**Missing Required Fields**
- Error: "Missing required fields: address, city"
- Solution: Ensure all required columns are filled

**Invalid Milestone**
- Error: "Invalid milestone: school"
- Solution: Use one of: diagnosis, therapies, education, trainings, ngo-advocacy, care-home, jobs-livelihood (or check src/data/milestones.js for current list)

**Geocoding Failed**
- Error: "Failed to geocode address"
- Solution: Verify address is correct and complete

**Invalid Email Format**
- Error: "Invalid email format: notanemail"
- Solution: Use valid email format: user@example.com

**Invalid Website URL**
- Error: "Invalid website URL (must start with http:// or https://)"
- Solution: Add http:// or https:// prefix

### Error Report

Download error report CSV to see:
- Row number where error occurred
- Resource name
- Address
- Error message

Fix errors in original file and re-upload.

## Rate Limiting

**Nominatim (Default)**
- 1 request per second
- Automatic 1.1 second delay between rows
- 100 resources = ~2 minutes upload time

**Google/Mapbox**
- Much faster (50-600 requests/minute)
- Minimal delays between rows
- 100 resources = ~10-20 seconds upload time

## Best Practices

1. **Start Small**: Test with 5-10 rows first
2. **Verify Addresses**: Ensure addresses are complete and accurate
3. **Use Template**: Download and use the provided CSV template
4. **Check Results**: Review success/error counts after upload
5. **Fix Errors**: Download error report and fix issues
6. **Batch Upload**: For large datasets, split into batches of 100-200 rows

## Technical Details

### Database Schema

Resources are stored in `care_resources` table with:
- PostGIS `GEOGRAPHY(POINT, 4326)` type for coordinates
- Spatial indexes for efficient geographic queries
- RLS policies (public read, admin write)

### API Endpoints

Bulk upload uses:
- `POST /api/care-resources/bulk` - Upload file
- Geocoding APIs (Nominatim/Google/Mapbox)
- Supabase insert operations

### Performance

- Geocoding: 1-2 seconds per address (Nominatim)
- Database insert: <100ms per resource
- Total time: ~1-2 seconds per resource (Nominatim)

## Troubleshooting

**Upload Stuck at 0%**
- Check file format (CSV or .xlsx/.xls)
- Verify file has header row
- Ensure file is not empty

**All Rows Failing**
- Check column names match template exactly
- Verify milestone values are valid
- Ensure required fields are not empty

**Geocoding Errors**
- Verify addresses are complete
- Check country codes are 2-letter ISO codes
- Try more specific addresses (include street numbers)

**Permission Denied**
- Ensure you're logged in as admin
- Check admin role in profiles table

## Support

For issues or questions:
- Check error report CSV for specific error messages
- Verify file format matches template
- Contact system administrator for API key issues
