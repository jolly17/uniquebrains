import ComingSoonBanner from '../components/ComingSoonBanner'
import './CourseResources.css'

function CourseResources({ course }) {
  return (
    <div className="course-resources">
      <ComingSoonBanner featureName="course resources" />
    </div>
  )
}

export default CourseResources
