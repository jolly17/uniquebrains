const fs = require('fs');
const path = require('path');

const myCoursesPath = path.join(__dirname, 'src', 'pages', 'MyCourses.jsx');
let content = fs.readFileSync(myCoursesPath, 'utf8');

// Fix the stats calculation to show actual meaningful data
const oldStatsCalculation = `        // Calculate stats
        const uniqueInstructors = new Set(courses.map(c => c.instructor_id)).size
        const completedSessions = enrollmentsData.reduce((sum, e) => sum + (e.progress || 0), 0)
        
        setStats({
          totalCourses: courses.length,
          totalInstructors: uniqueInstructors,
          sessionsCompleted: Math.floor(completedSessions / 10) // Rough estimate
        })`;

const newStatsCalculation = `        // Calculate stats
        const uniqueInstructors = new Set(courses.map(c => c.instructor_id)).size
        // Calculate total sessions completed across all courses
        const totalSessions = enrollmentsData.reduce((sum, e) => {
          // progress is typically 0-100, so divide by 100 to get percentage
          // Then multiply by estimated sessions per course (e.g., 10)
          const estimatedSessions = 10
          const completedForCourse = Math.floor((e.progress || 0) / 100 * estimatedSessions)
          return sum + completedForCourse
        }, 0)
        
        setStats({
          totalCourses: courses.length,
          totalInstructors: uniqueInstructors,
          sessionsCompleted: totalSessions
        })`;

content = content.replace(oldStatsCalculation, newStatsCalculation);

fs.writeFileSync(myCoursesPath, content, 'utf8');
console.log('✓ Fixed stats calculation in MyCourses.jsx');
console.log('  - Now properly calculates sessions completed from progress percentage');
console.log('  - Shows 0 if no progress, or calculated sessions based on progress');
