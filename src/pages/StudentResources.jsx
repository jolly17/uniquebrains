import ComingSoonBanner from '../components/ComingSoonBanner'
import './StudentResources.css'

function StudentResources({ courseId, userId }) {
  return (
    <div className="student-resources">
      <ComingSoonBanner featureName="course resources" />
    </div>
  )
}

export default StudentResources
