import ComingSoonBanner from '../components/ComingSoonBanner'
import './StudentChat.css'

function StudentChat({ courseId, userId, course }) {
  return (
    <div className="student-chat">
      <ComingSoonBanner featureName="course chat" />
    </div>
  )
}

export default StudentChat
