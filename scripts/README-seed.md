# Care Resources Seed Script

This script populates the `care_resources` table with test data from `src/data/dummyCareResources.js`.

## Prerequisites

1. Ensure your `.env` file contains:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (required to bypass RLS)

2. The `care_resources` table must exist in your database

## Usage

Run the seed script:

```bash
node scripts/seed-care-resources.js
```

## What it does

1. Loads dummy data from `src/data/dummyCareResources.js` (15 resources)
2. Transforms the data to match the database schema:
   - Converts `zipCode` → `zip_code`
   - Converts `experienceYears` → `experience_years`
   - Converts `reviewCount` → `review_count`
   - Transforms coordinates to PostGIS POINT format
3. Inserts each resource into the database
4. Reports success/failure for each resource

## Output

The script provides detailed output:
- ✅ Success messages for each inserted resource
- ❌ Error messages if any insertions fail
- 📊 Summary with total counts

Example output:
```
🌱 Starting care resources seed...

📊 Found 15 resources to seed

🔍 Checking database connection...
✅ Database connection successful

✅ [1/15] Inserted: Autism Diagnostic Center
✅ [2/15] Inserted: Neurodevelopmental Assessment Clinic
...

============================================================
📊 Seed Summary
============================================================
✅ Successfully inserted: 15
❌ Failed: 0
📝 Total: 15

✨ Seed complete!
```

## Re-running the script

If you run the script multiple times, it will insert duplicate resources (with different UUIDs). To avoid duplicates, you can:

1. Clear the table first:
   ```sql
   DELETE FROM care_resources WHERE milestone = 'diagnosis';
   ```

2. Or modify the script to check for existing resources before inserting

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure your `.env` file exists and contains the required variables
- Make sure you're using `SUPABASE_SERVICE_ROLE_KEY` (not `VITE_SUPABASE_ANON_KEY`)

### "new row violates row-level security policy"
- This means you're using the anon key instead of the service role key
- Update your `.env` to use `SUPABASE_SERVICE_ROLE_KEY`

### "invalid input syntax for type uuid"
- This was fixed by removing the ID field from dummy data
- The database now generates proper UUIDs automatically

### "Table 'care_resources' does not exist"
- Run the database migration first to create the table
- Check that you're connected to the correct Supabase project
