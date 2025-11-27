import './StarRating.css'

function StarRating({ rating, onRate, size = 'medium' }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className={`star-rating ${size}`}>
      {stars.map(star => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : ''} ${onRate ? 'interactive' : ''}`}
          onClick={() => onRate && onRate(star)}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default StarRating
