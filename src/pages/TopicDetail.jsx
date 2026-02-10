import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTopicBySlug, getQuestionsByTopic } from '../services/communityService'
import './TopicDetail.css'

function TopicDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [topic, setTopic] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    fetchTopicAndQuestions()
  }, [slug, sortBy])

  const fetchTopicAndQuestions = async () => {
    try {
      setLoading(true)
      const [topicData, questionsData] = await Promise.all([
        getTopicBySlug(slug),
        getQuestionsByTopic(slug, sortBy)
      ])
      setTopic(topicData)
      setQuestions(questionsData)
    } catch (err) {
      console.error('Error fetching topic:', err)
      setError('Failed to load topic')
    } finally {
      setLoading(false)
    }
  }

  const handleAskQuestion = () => {
    if (!user) {
      const redirectUrl = `/community/${slug}/ask`
      sessionStorage.setItem('redirectAfterLogin', redirectUrl)
      navigate('/login', { state: { from: redirectUrl } })
      return
    }
    navigate(`/community/${slug}/ask`)
  }

  if (loading) {
    return (
      <div className="topic-detail-page">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="topic-detail-page">
        <div className="error-message">{error || 'Topic not found'}</div>
        <Link to="/community" className="btn-secondary">Back to Community</Link>
      </div>
    )
  }

  return (
    <div className="topic-detail-page">
      <div className="topic-header" style={{ backgroundImage: `url(${topic.cover_image_url})` }}>
        <div className="topic-header-overlay">
          <div className="topic-header-content">
            <Link to="/community" className="back-link">← Back to Community</Link>
            <h1>{topic.name}</h1>
            <p className="topic-description">{topic.description}</p>
            <button onClick={handleAskQuestion} className="btn-ask-question">
              Ask a Question
            </button>
          </div>
        </div>
      </div>

      <div className="topic-content">
        <div className="questions-header">
          <h2>{questions.length} Questions</h2>
          <div className="sort-buttons">
            <button 
              className={`sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
              onClick={() => setSortBy('recent')}
            >
              Recent
            </button>
            <button 
              className={`sort-btn ${sortBy === 'popular' ? 'active' : ''}`}
              onClick={() => setSortBy('popular')}
            >
              Popular
            </button>
            <button 
              className={`sort-btn ${sortBy === 'unanswered' ? 'active' : ''}`}
              onClick={() => setSortBy('unanswered')}
            >
              Unanswered
            </button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="no-questions">
            <div className="no-questions-icon">💬</div>
            <h3>No questions yet</h3>
            <p>Be the first to ask a question in this topic!</p>
            <button onClick={handleAskQuestion} className="btn-primary">
              Ask the First Question
            </button>
          </div>
        ) : (
          <div className="questions-list">
            {questions.map((question) => (
              <Link 
                key={question.id} 
                to={`/community/${slug}/question/${question.id}`}
                className="question-card"
              >
                <div className="question-content">
                  <h3 className="question-title">{question.title}</h3>
                  <div className="question-meta">
                    <span className="author">
                      {question.profiles?.first_name} {question.profiles?.last_name}
                    </span>
                    <span className="date">
                      {new Date(question.created_at).toLocaleDateString('en-US')}
                    </span>
                  </div>
                </div>
                <div className="question-stats">
                  <div className="stat">
                    <span className="stat-number">{question.vote_count || 0}</span>
                    <span className="stat-label">votes</span>
                  </div>
                  <div className={`stat ${question.is_answered ? 'answered' : ''}`}>
                    <span className="stat-number">{question.answer_count || 0}</span>
                    <span className="stat-label">answers</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{question.view_count || 0}</span>
                    <span className="stat-label">views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TopicDetail
