import ComingSoonBanner from '../components/ComingSoonBanner'
import './CourseHomework.css'

function CourseHomework({ course }) {
  return (
    <div className="course-homework">
      <ComingSoonBanner featureName="homework assignments" />
    </div>
  )
}

export default CourseHomework
