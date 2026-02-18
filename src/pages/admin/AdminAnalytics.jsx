import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  fetchUserSignups,
  fetchCoursesCreated,
  fetchActiveStudents,
  fetchCommunityQuestions,
  fetchCommunityAnswers,
  calculatePercentageChange
} from '../../services/analyticsService'
import './AdminAnalytics.css'

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [userSignupsData, setUserSignupsData] = useState([])
  const [coursesCreatedData, setCoursesCreatedData] = useState([])
  const [activeStudentsData, setActiveStudentsData] = useState([])
  const [communityQuestionsData, setCommunityQuestionsData] = useState([])
  const [communityAnswersData, setCommunityAnswersData] = useState([])
  
  const [percentageChanges, setPercentageChanges] = useState({
    userSignups: 0,
    coursesCreated: 0,
    activeStudents: 0,
    communityQuestions: 0,
    communityAnswers: 0
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [signups, courses, students, questions, answers] = await Promise.all([
        fetchUserSignups(timeRange),
        fetchCoursesCreated(timeRange),
        fetchActiveStudents(timeRange),
        fetchCommunityQuestions(timeRange),
        fetchCommunityAnswers(timeRange)
      ])
      
      setUserSignupsData(signups)
      setCoursesCreatedData(courses)
      setActiveStudentsData(students)
      setCommunityQuestionsData(questions)
      setCommunityAnswersData(answers)
      
      // Calculate percentage changes
      calculateChanges(signups, courses, students, questions, answers)
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateChanges = (signups, courses, students, questions, answers) => {
    const calculateChange = (data) => {
      if (data.length === 0) return 0
      
      const midpoint = Math.floor(data.length / 2)
      const firstHalf = data.slice(0, midpoint)
      const secondHalf = data.slice(midpoint)
      
      const firstSum = firstHalf.reduce((sum, item) => sum + item.value, 0)
      const secondSum = secondHalf.reduce((sum, item) => sum + item.value, 0)
      
      return calculatePercentageChange(secondSum, firstSum)
    }
    
    setPercentageChanges({
      userSignups: calculateChange(signups),
      coursesCreated: calculateChange(courses),
      activeStudents: calculateChange(students),
      communityQuestions: calculateChange(questions),
      communityAnswers: calculateChange(answers)
    })
  }

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">{`Value: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  const renderMetricCard = (title, data, percentageChange, ChartComponent, chartColor, isBarChart = false) => {
    const hasData = data && data.length > 0
    
    return (
      <div className="metric-card">
        <div className="metric-header">
          <h3>{title}</h3>
          {hasData && (
            <span className={`percentage-change ${percentageChange >= 0 ? 'positive' : 'negative'}`}>
              {formatPercentage(percentageChange)}
            </span>
          )}
        </div>
        
        {hasData ? (
          <ResponsiveContainer width="100%" height={250}>
            <ChartComponent data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              {isBarChart ? (
                <Bar dataKey="value" fill={chartColor} />
              ) : (
                <Line type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">
            <p>No data available for this time range</p>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-analytics">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-analytics">
        <div className="analytics-header">
          <h1>Analytics Dashboard</h1>
        </div>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadAnalyticsData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        
        <div className="time-range-selector">
          <button
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button
            className={timeRange === '30d' ? 'active' : ''}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button
            className={timeRange === '90d' ? 'active' : ''}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </button>
          <button
            className={timeRange === '1y' ? 'active' : ''}
            onClick={() => setTimeRange('1y')}
          >
            1 Year
          </button>
          <button
            className={timeRange === 'all' ? 'active' : ''}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        {renderMetricCard(
          'User Signups',
          userSignupsData,
          percentageChanges.userSignups,
          LineChart,
          '#4f46e5',
          false
        )}
        
        {renderMetricCard(
          'Courses Created',
          coursesCreatedData,
          percentageChanges.coursesCreated,
          BarChart,
          '#10b981',
          true
        )}
        
        {renderMetricCard(
          'Active Students',
          activeStudentsData,
          percentageChanges.activeStudents,
          LineChart,
          '#f59e0b',
          false
        )}
        
        {renderMetricCard(
          'Community Questions',
          communityQuestionsData,
          percentageChanges.communityQuestions,
          BarChart,
          '#8b5cf6',
          true
        )}
        
        {renderMetricCard(
          'Community Answers',
          communityAnswersData,
          percentageChanges.communityAnswers,
          BarChart,
          '#ec4899',
          true
        )}
      </div>
    </div>
  )
}
