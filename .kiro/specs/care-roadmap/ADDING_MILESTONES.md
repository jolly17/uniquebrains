# How to Add New Milestones

The care roadmap milestone system is designed to be flexible and easy to extend. Follow these simple steps to add new milestones.

## Quick Guide

To add a new milestone, you only need to edit **ONE file**: `src/data/milestones.js`

Everything else updates automatically!

## Step-by-Step Instructions

### 1. Edit `src/data/milestones.js`

Add your new milestone to the `MILESTONES` array:

```javascript
export const MILESTONES = [
  // ... existing milestones ...
  {
    id: 'your-milestone-id',           // Lowercase, hyphenated (e.g., 'care-home')
    title: 'Your Milestone Title',     // Display name (e.g., 'Care Home')
    description: 'Brief description',  // Shown on timeline cards
    icon: '🏡',                        // Emoji icon
    path: '/care/your-milestone-id',   // URL path (must match id)
    order: 8                           // Sequential order number
  }
];
```

### 2. That's It!

Once you add the milestone to `milestones.js`, the following automatically update:

✅ **Database validation** - Accepts the new milestone value  
✅ **CSV upload validation** - Validates against new milestone  
✅ **Admin UI** - Shows new milestone in valid list  
✅ **Timeline page** - Displays new milestone card  
✅ **Navigation** - Previous/Next buttons work correctly  
✅ **Routing** - URL `/care/your-milestone-id` works  

## Example: Adding "Care Home" Milestone

Here's how we added the "care-home" milestone:

```javascript
{
  id: 'care-home',
  title: 'Care Home',
  description: 'Find residential care facilities, group homes, and supported living arrangements for neurodivergent individuals.',
  icon: '🏡',
  path: '/care/care-home',
  order: 6  // Inserted before jobs-livelihood (which became order 7)
}
```

## Important Notes

### Milestone ID Rules

- Use lowercase letters
- Use hyphens for spaces (e.g., `care-home`, not `care_home` or `careHome`)
- Keep it short and descriptive
- Must be unique

### Order Numbers

- Must be sequential (1, 2, 3, 4...)
- Determines display order on timeline
- Determines Previous/Next navigation order
- When inserting a milestone, update order numbers of following milestones

### Path Format

- Must start with `/care/`
- Must match the milestone ID
- Example: if `id: 'care-home'`, then `path: '/care/care-home'`

## What Gets Updated Automatically

### 1. Database
The database has NO hardcoded milestone constraints. It accepts any milestone value, so no migration needed.

### 2. Validation
The bulk upload service imports `getValidMilestoneIds()` from `milestones.js`, so validation automatically includes new milestones.

### 3. Admin UI
The admin page imports `MILESTONES` and dynamically displays all valid milestones.

### 4. CSV Template
Update the template manually to include examples of new milestones (optional but recommended).

### 5. Documentation
Update documentation files to mention new milestones (optional but recommended).

## Testing Your New Milestone

After adding a milestone:

1. **Check Timeline**: Visit `/care` - your new milestone card should appear
2. **Check Navigation**: Click the card - should navigate to `/care/your-milestone-id`
3. **Check Upload**: Go to Admin → Care Resources - new milestone should be in valid list
4. **Test CSV Upload**: Upload a CSV with the new milestone value - should validate successfully

## Removing a Milestone

To remove a milestone:

1. Remove it from the `MILESTONES` array in `src/data/milestones.js`
2. Update order numbers of remaining milestones to be sequential
3. **Important**: Existing resources in the database with that milestone will still exist but won't be accessible through the UI

## Reordering Milestones

To change the order:

1. Update the `order` property of affected milestones
2. Ensure order numbers remain sequential (1, 2, 3, 4...)
3. The timeline and navigation will automatically reflect the new order

## Architecture Benefits

This design provides:

- **Single Source of Truth**: All milestone data in one file
- **No Database Changes**: Add milestones without migrations
- **Automatic Validation**: Validation uses the same source
- **Easy Maintenance**: One file to update, everything else follows
- **Type Safety**: Helper functions ensure consistency

## Common Mistakes to Avoid

❌ **Don't** hardcode milestone values anywhere else  
❌ **Don't** skip order numbers (e.g., 1, 2, 4, 5)  
❌ **Don't** use uppercase or underscores in IDs  
❌ **Don't** forget to update order numbers when inserting  

✅ **Do** use the helper functions (`getValidMilestoneIds()`, `isValidMilestone()`)  
✅ **Do** keep order numbers sequential  
✅ **Do** use lowercase-hyphenated IDs  
✅ **Do** test after adding a new milestone  

## Need Help?

If you encounter issues:

1. Check that `id` and `path` match (except for `/care/` prefix)
2. Verify order numbers are sequential
3. Ensure no duplicate IDs
4. Check browser console for errors
5. Verify the milestone appears in `getValidMilestoneIds()` output

## Future Enhancements

Possible improvements:

- Admin UI to add milestones without code changes
- Database table to store milestone configuration
- Milestone categories or groupings
- Conditional milestone visibility based on user location
- Milestone dependencies (e.g., "Diagnosis" must come before "Therapies")
