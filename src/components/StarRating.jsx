import './StarRating.css'

function StarRating({ rating, onRate, size = 'medium' }) {
  const stars = [1, 2, 3, 4, 5]

  const getStarClass = (star) => {
    if (rating >= star) {
      return 'filled'
    } else if (rating > star - 1 && rating < star) {
      return 'half-filled'
    }
    return ''
  }

  return (
    <div className={`star-rating ${size}`}>
      {stars.map(star => (
        <span
          key={star}
          className={`star ${getStarClass(star)} ${onRate ? 'interactive' : ''}`}
          onClick={() => onRate && onRate(star)}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default StarRating
