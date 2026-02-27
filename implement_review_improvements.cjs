const fs = require('fs');

// 1. Update ResourceDetailPage.jsx
let resourceDetail = fs.readFileSync('src/pages/ResourceDetailPage.jsx', 'utf8');

// Add useAuth import
resourceDetail = resourceDetail.replace(
  "import { useParams, useNavigate } from 'react-router-dom';",
  "import { useParams, useNavigate } from 'react-router-dom';\nimport { useAuth } from '../context/AuthContext';"
);

// Add state for user's existing review and average rating
resourceDetail = resourceDetail.replace(
  'const [reviews, setReviews] = useState([]);',
  `const [reviews, setReviews] = useState([]);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const { user } = useAuth();`
);

// Update fetchReviews to calculate average and check if user reviewed
resourceDetail = resourceDetail.replace(
  /async function fetchReviews\(\) \{[\s\S]*?console\.error\('Error fetching reviews:', err\);\s+\}\s+\}/,
  `async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('care_reviews')
          .select('*')
          .eq('resource_id', resourceId)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setReviews(data || []);
        
        // Calculate average rating
        if (data && data.length > 0) {
          const sum = data.reduce((acc, review) => acc + review.rating, 0);
          const avg = sum / data.length;
          setAverageRating(avg);
        } else {
          setAverageRating(0);
        }
        
        // Check if current user has already reviewed
        if (user && data) {
          const userReview = data.find(review => review.user_id === user.id);
          setUserHasReviewed(!!userReview);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    }`
);

// Update the useEffect dependency to include user
resourceDetail = resourceDetail.replace(
  '}, [resourceId]);',
  '}, [resourceId, user]);'
);

// Replace the resource rating display with average rating
resourceDetail = resourceDetail.replace(
  `<div className="resource-detail-rating">
          <StarRating rating={resource.rating} size="large" />
          <span className="review-count">({resource.review_count} reviews)</span>
        </div>`,
  `<div className="resource-detail-rating">
          <StarRating rating={averageRating} size="large" />
          <span className="review-count">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
        </div>`
);

// Update review display to show star ratings
resourceDetail = resourceDetail.replace(
  `<div className="review-header">
                    <span className="review-author">{review.reviewer_name}</span>
                    <span className="review-rating">{''.repeat(review.rating)}</span>
                  </div>`,
  `<div className="review-header">
                    <span className="review-author">{review.reviewer_name}</span>
                    <StarRating rating={review.rating} size="small" />
                  </div>`
);

// Update Write Review button to disable if user already reviewed
resourceDetail = resourceDetail.replace(
  '<button className="write-review-btn" onClick={() => setShowReviewModal(true)}>',
  '<button className="write-review-btn" onClick={() => setShowReviewModal(true)} disabled={userHasReviewed}>'
);

resourceDetail = resourceDetail.replace(
  'Write a Review',
  '{userHasReviewed ? "You\'ve already reviewed this resource" : "Write a Review"}'
);

fs.writeFileSync('src/pages/ResourceDetailPage.jsx', resourceDetail, 'utf8');

// 2. Update StarRating.jsx to support partial stars
let starRating = fs.readFileSync('src/components/StarRating.jsx', 'utf8');

starRating = `import './StarRating.css'

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
    <div className={\`star-rating \${size}\`}>
      {stars.map(star => (
        <span
          key={star}
          className={\`star \${getStarClass(star)} \${onRate ? 'interactive' : ''}\`}
          onClick={() => onRate && onRate(star)}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default StarRating
`;

fs.writeFileSync('src/components/StarRating.jsx', starRating, 'utf8');

// 3. Update StarRating.css to support partial stars
let starRatingCSS = fs.readFileSync('src/components/StarRating.css', 'utf8');

// Add half-filled star style if not present
if (!starRatingCSS.includes('half-filled')) {
  starRatingCSS += `

.star.half-filled {
  background: linear-gradient(90deg, var(--primary-color) 50%, #ddd 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
`;
  fs.writeFileSync('src/components/StarRating.css', starRatingCSS, 'utf8');
}

// 4. Update ResourceDetailPage.css for disabled button
let resourceDetailCSS = fs.readFileSync('src/pages/ResourceDetailPage.css', 'utf8');

if (!resourceDetailCSS.includes('.write-review-btn:disabled')) {
  resourceDetailCSS += `

.write-review-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.write-review-btn:disabled:hover {
  background-color: #ccc;
  transform: none;
}
`;
  fs.writeFileSync('src/pages/ResourceDetailPage.css', resourceDetailCSS, 'utf8');
}

console.log('✓ Updated ResourceDetailPage.jsx - added user review check and average rating');
console.log('✓ Updated StarRating.jsx - added partial star support');
console.log('✓ Updated StarRating.css - added half-filled star styles');
console.log('✓ Updated ResourceDetailPage.css - added disabled button styles');
