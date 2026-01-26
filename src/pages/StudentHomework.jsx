import ComingSoonBanner from '../components/ComingSoonBanner'
import './StudentHomework.css'

function StudentHomework({ courseId, userId }) {
  return (
    <div className="student-homework">
      <ComingSoonBanner featureName="homework assignments" />
    </div>
  )
}

export default StudentHomework
