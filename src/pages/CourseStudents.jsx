import ComingSoonBanner from '../components/ComingSoonBanner'
import './CourseStudents.css'

function CourseStudents({ course }) {
  return (
    <div className="course-students">
      <ComingSoonBanner featureName="student management" />
    </div>
  )
}

export default CourseStudents
