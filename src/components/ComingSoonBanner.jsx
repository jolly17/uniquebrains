import { useState, useEffect } from 'react'
import './ComingSoonBanner.css'

function ComingSoonBanner({ featureName = 'this feature' }) {
  const [donationLink, setDonationLink] = useState('https://www.gofundme.com/f/help-me-support-autism-awareness-and-families-with-genai')

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Check timezone first (quick check for India)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const isIndia = timezone === 'Asia/Kolkata' || timezone === 'Asia/Calcutta'
        
        if (isIndia) {
          setDonationLink('https://milaap.org/fundraisers/support-autistic-kids-1')
        } else {
          // Optionally, use a geolocation API for more accurate detection
          try {
            const response = await fetch('https://ipapi.co/json/')
            const data = await response.json()
            if (data.country_code === 'IN') {
              setDonationLink('https://milaap.org/fundraisers/support-autistic-kids-1')
            }
          } catch (error) {
            // If API fails, keep default GoFundMe link
            console.log('Geolocation detection failed, using default link')
          }
        }
      } catch (error) {
        console.log('Location detection failed, using default link')
      }
    }

    detectLocation()
  }, [])

  return (
    <div className="coming-soon-banner">
      <div className="coming-soon-icon">🚧</div>
      <div className="coming-soon-content">
        <h3>Coming Soon!</h3>
        <p>
          We're actively developing {featureName}. Your support helps us build these features faster and keep UniqueBrains free for everyone.
        </p>
        <a 
          href={donationLink}
          target="_blank" 
          rel="noopener noreferrer"
          className="donation-button"
        >
          💚 Support Development
        </a>
      </div>
    </div>
  )
}

export default ComingSoonBanner
