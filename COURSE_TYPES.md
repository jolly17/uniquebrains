# Course Types in UniqueBrains

## Overview
UniqueBrains supports two types of courses to accommodate different teaching styles and student needs.

## Group Courses 👥

**Best for:** Classes where all students learn together

**Features:**
- Single shared schedule for all enrolled students
- All students attend the same sessions at the same time
- Instructor manages one set of sessions for the entire group
- Session topics and meeting links are the same for everyone
- Examples: Dance classes, drama workshops, group music theory

**Session Management:**
- View course statistics (enrolled students, spots remaining, upcoming sessions)
- Set topics and meeting links for each group session
- All students see the same schedule and session details

## One-on-One Courses 👤

**Best for:** Personalized instruction tailored to each student

**Features:**
- Individual sessions scheduled separately for each student
- Each student has their own session times
- Instructor can customize topics based on individual progress
- Separate meeting links for each student's sessions
- Examples: Private piano lessons, personalized tutoring, individual coaching

**Session Management:**
- View all enrolled students with their neurodiversity profiles
- Manage sessions separately for each student
- Set custom topics based on each student's progress and needs
- Individual meeting links for each student's sessions
- Track progress per student

## Choosing the Right Type

### Choose Group Course when:
- Content is the same for all students
- Students benefit from peer interaction
- You want to teach multiple students simultaneously
- The curriculum follows a fixed progression

### Choose One-on-One when:
- Each student needs personalized attention
- Progress varies significantly between students
- Curriculum adapts to individual needs
- Students require different pacing or approaches

## Technical Implementation

### Data Structure

**Group Course:**
```javascript
{
  courseType: 'group',
  sessions: [
    {
      id: 1,
      date: '2024-01-15',
      time: '10:00 AM',
      topic: 'Introduction to scales',
      meetingLink: 'https://zoom.us/j/123',
      attendees: 8
    }
  ]
}
```

**One-on-One Course:**
```javascript
{
  courseType: 'one-on-one',
  sessions: [
    {
      id: 1,
      studentId: '1',
      studentName: 'Emma Thompson',
      date: '2024-01-15',
      time: '10:00 AM',
      topic: 'Review scales - Emma's pace',
      meetingLink: 'https://zoom.us/j/123'
    },
    {
      id: 2,
      studentId: '2',
      studentName: 'Liam Chen',
      date: '2024-01-15',
      time: '11:00 AM',
      topic: 'Chord progressions - Liam's level',
      meetingLink: 'https://zoom.us/j/456'
    }
  ]
}
```

## Future Enhancements

- Hybrid courses (mix of group and individual sessions)
- Small group sessions (2-4 students)
- Breakout rooms within group sessions
- Student-to-student collaboration features
- Progress tracking and comparison (with privacy controls)
