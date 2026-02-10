import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  getQuestionById, 
  getAnswersByQuestion, 
  createAnswer,
  voteQuestion,
  voteAnswer,
  markBestAnswer
} from '../services/communityService'
import './QuestionDetail.css'

function QuestionDetail() {
  const { slug, id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [answerContent, setAnswerContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  useEffect(() => {
    fetchQuestionAndAnswers()
  }, [id])

  const fetchQuestionAndAnswers = async () => {
    try {
      setLoading(true)
      const [questionData, answersData] = await Promise.all([
        getQuestionById(id),
        getAnswersByQuestion(id)
      ])
      setQuestion(questionData)
      setAnswers(answersData)
    } catch (err) {
      console.error('Error fetching question:', err)
      setError('Failed to load question')
    } finally {
      setLoading(false)
    }
  }

  const handleVoteQuestion = async (voteType) => {
    if (!user) {
      navigate('/login', { state: { from: `/community/${slug}/question/${id}` } })
      return
    }

    try {
      await voteQuestion(id, voteType)
      await fetchQuestionAndAnswers()
    } catch (err) {
      console.error('Error voting:', err)
    }
  }

  const handleVoteAnswer = async (answerId, voteType) => {
    if (!user) {
      navigate('/login', { state: { from: `/community/${slug}/question/${id}` } })
      return
    }

    try {
      await voteAnswer(answerId, voteType)
      await fetchQuestionAndAnswers()
    } catch (err) {
      console.error('Error voting:', err)
    }
  }

  const handleMarkBestAnswer = async (answerId) => {
    if (!user || user.id !== question.author_id) {
      return
    }

    try {
      await markBestAnswer(id, answerId)
      await fetchQuestionAndAnswers()
    } catch (err) {
      console.error('Error marking best answer:', err)
    }
  }

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()

    if (!user) {
      navigate('/login', { state: { from: `/community/${slug}/question/${id}` } })
      return
    }

    if (!answerContent.trim()) {
      return
    }

    try {
      setSubmitting(true)
      await createAnswer({
        question_id: id,
        author_id: user.id,
        content: answerContent.trim()
      })
      setAnswerContent('')
      await fetchQuestionAndAnswers()
    } catch (err) {
      console.error('Error submitting answer:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async (platform) => {
    const url = window.location.href
    const title = question?.title || 'Check out this question'
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      copy: url
    }

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
    
    setShowShareMenu(false)
  }

  if (loading) {
    return (
      <div className="question-detail-page">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="question-detail-page">
        <div className="error-message">{error || 'Question not found'}</div>
        <Link to="/community" className="btn-secondary">Back to Community</Link>
      </div>
    )
  }

  return (
    <div className="question-detail-page">
      <div className="question-detail-container">
        <div className="breadcrumb">
          <Link to="/community">Community</Link>
          <span className="separator">›</span>
          <Link to={`/community/${slug}`}>{question.topics?.name}</Link>
          <span className="separator">›</span>
          <span>Question</span>
        </div>

        <div className="question-card">
          <div className="question-header">
            <h1>{question.title}</h1>
            <div className="question-meta">
              <span className="author">
                Asked by {question.profiles?.first_name} {question.profiles?.last_name}
              </span>
              <span className="date">
                {new Date(question.created_at).toLocaleDateString('en-US')}
              </span>
            </div>
          </div>

          <div className="question-body">
            <div className="question-content">
              {question.content && <p>{question.content}</p>}
              {question.image_url && (
                <div className="question-media">
                  <img src={question.image_url} alt="Question media" />
                </div>
              )}
            </div>

            <div className="vote-section">
              <button 
                className="vote-btn upvote"
                onClick={() => handleVoteQuestion('up')}
              >
                👍 Upvote
              </button>
              <span className="vote-count">{question.vote_count}</span>
              <button 
                className="vote-btn downvote"
                onClick={() => handleVoteQuestion('down')}
              >
                👎 Downvote
              </button>
            </div>
          </div>

          <div className="question-actions">
            <div className="question-stats">
              <span>{question.answer_count} answers</span>
              <span>{question.view_count} views</span>
            </div>
            <div className="action-buttons">
              {user && user.id === question.author_id && (
                <button className="btn-edit">
                  ✏️ Edit
                </button>
              )}
              <div className="share-container">
                <button 
                  className="btn-share"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  🔗 Share
                </button>
                {showShareMenu && (
                  <div className="share-menu">
                    <button onClick={() => handleShare('facebook')}>Facebook</button>
                    <button onClick={() => handleShare('twitter')}>Twitter</button>
                    <button onClick={() => handleShare('linkedin')}>LinkedIn</button>
                    <button onClick={() => handleShare('whatsapp')}>WhatsApp</button>
                    <button onClick={() => handleShare('copy')}>Copy Link</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="answers-section">
          <h2>{answers.length} Answer{answers.length !== 1 ? 's' : ''}</h2>

          {answers.map((answer) => (
            <div 
              key={answer.id} 
              className={`answer-card ${answer.is_best_answer ? 'best-answer' : ''}`}
            >
              {answer.is_best_answer && (
                <div className="best-answer-badge">✓ Best Answer</div>
              )}
              
              <div className="answer-body">
                <div className="answer-content">
                  <p>{answer.content}</p>
                  <div className="answer-meta">
                    <span className="author">
                      {answer.profiles?.first_name} {answer.profiles?.last_name}
                    </span>
                    <span className="date">
                      {new Date(answer.created_at).toLocaleDateString('en-US')}
                    </span>
                    {user && user.id === answer.author_id && (
                      <button className="btn-edit-answer">
                        ✏️ Edit
                      </button>
                    )}
                    {user && user.id === question.author_id && !answer.is_best_answer && (
                      <button 
                        className="btn-mark-best"
                        onClick={() => handleMarkBestAnswer(answer.id)}
                      >
                        Mark as Best Answer
                      </button>
                    )}
                  </div>
                </div>

                <div className="vote-section">
                  <button 
                    className="vote-btn upvote"
                    onClick={() => handleVoteAnswer(answer.id, 'up')}
                  >
                    👍 Upvote
                  </button>
                  <span className="vote-count">{answer.vote_count}</span>
                  <button 
                    className="vote-btn downvote"
                    onClick={() => handleVoteAnswer(answer.id, 'down')}
                  >
                    👎 Downvote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="answer-form-section">
          <h3>Your Answer</h3>
          {user ? (
            <form onSubmit={handleSubmitAnswer} className="answer-form">
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Share your knowledge and help others..."
                rows={8}
                required
              />
              <button 
                type="submit" 
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? 'Posting...' : 'Post Answer'}
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>Please <Link to="/login">log in</Link> to answer this question.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionDetail
