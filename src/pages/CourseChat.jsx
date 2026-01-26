import ComingSoonBanner from '../components/ComingSoonBanner'
import './CourseChat.css'

function CourseChat({ course }) {
  return (
    <div className="course-chat">
      <ComingSoonBanner featureName="course chat" />
    </div>
  )
}

export default CourseChat
