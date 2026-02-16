# Calendar Invites Solution for Reducing Absenteeism

## Problem
Students are missing sessions due to lack of calendar reminders. We need to automatically add sessions to their calendars when they enroll and update them when schedules change.

## Solution
Send calendar invites (.ics files) via email that students can add to their calendar apps (Google Calendar, Outlook, Apple Calendar, etc.)

## Implementation Approach

### 1. When to Send Calendar Invites

**Scenario A: Student Enrolls in Course**
- Send calendar invites for all upcoming sessions
- Include course details, meeting link, and instructor info

**Scenario B: Instructor Updates Course Schedule**
- Send updated calendar invites to all enrolled students
- Calendar apps will automatically update existing events

**Scenario C: New Session Created**
- Send calendar invite for the new session to all enrolled students

**Scenario D: Session Deleted/Cancelled**
- Send cancellation notice to all enrolled students
- Calendar apps will remove the event

### 2. Technical Implementation

We'll use:
- **iCalendar (.ics) format** - Universal calendar standard
- **Supabase Edge Functions** - To generate and send invites
- **Email with .ics attachment** - Works with all email clients
- **VEVENT components** - For individual session events

### 3. Benefits

✅ **Universal Compatibility** - Works with all major calendar apps
✅ **Automatic Updates** - When schedule changes, calendar updates automatically
✅ **No Phone Required** - Only needs email address
✅ **Built-in Reminders** - Calendar apps provide their own notifications
✅ **Professional** - Standard business practice for meetings/classes

## Files Created

1. `supabase/functions/send-calendar-invite/index.ts` - Edge function to send invites
2. `supabase/migrations/072_add_calendar_invite_triggers.sql` - Database triggers
3. `src/utils/calendarInvite.js` - Frontend utility (optional)

## How It Works

### Flow Diagram

```
Student Enrolls
    ↓
Database Trigger Fires
    ↓
Edge Function Called
    ↓
Generate .ics File for Each Session
    ↓
Send Email with .ics Attachments
    ↓
Student Clicks "Add to Calendar"
    ↓
Sessions Added to Their Calendar
```

### iCalendar Format Example

```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//UniqueBrains//Course Session//EN
METHOD:REQUEST
BEGIN:VEVENT
UID:session-123@uniquebrains.org
DTSTAMP:20250216T120000Z
DTSTART:20250220T140000Z
DTEND:20250220T150000Z
SUMMARY:Introduction to Python - Session 1
DESCRIPTION:Join us for the first session of Introduction to Python
LOCATION:https://meet.google.com/abc-defg-hij
ORGANIZER;CN=Instructor Name:mailto:instructor@example.com
ATTENDEE;CN=Student Name:mailto:student@example.com
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Class starts in 15 minutes
END:VALARM
END:VEVENT
END:VCALENDAR
```

## Next Steps

1. Review the implementation files
2. Test with a few students first
3. Deploy to production
4. Monitor email delivery rates
5. Gather feedback from students

## Alternative: Calendar Links

If email attachments don't work well, we can also provide:
- **Google Calendar Add Link** - Direct link to add to Google Calendar
- **Outlook Calendar Link** - Direct link for Outlook users
- **Download .ics Button** - Let students download the file manually

## Cost Considerations

- Edge function calls: ~$0.00002 per invocation
- Email sending: Depends on your email provider
- Estimated cost: <$5/month for 1000 students

## Privacy & Compliance

- Only send to enrolled students
- Include unsubscribe option
- Store minimal data in calendar events
- Comply with email regulations (CAN-SPAM, GDPR)
