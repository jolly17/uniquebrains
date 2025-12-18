import { Link } from 'react-router-dom'

function ComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            UniqueBrains
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Holiday Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          <div className="text-6xl mb-6">🎄✨</div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Happy Holidays!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            We're taking a short break to celebrate the season with our families.
          </p>
          <p className="text-xl font-semibold text-blue-600 mb-2">
            We'll be back soon with exciting new courses!
          </p>
          <p className="text-gray-500">
            Thank you for your patience and support.
          </p>
        </div>

        {/* Support Options */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Support Our Mission
          </h3>
          <div className="space-y-4">
            <a
              href="https://wa.me/YOUR_PHONE_NUMBER?text=I'd%20like%20to%20support%20UniqueBrains"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              💚 Make a Donation
            </a>
            <a
              href="https://wa.me/YOUR_PHONE_NUMBER?text=I'm%20interested%20in%20becoming%20an%20instructor"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
            >
              🎓 Volunteer as Instructor
            </a>
            <a
              href="https://wa.me/?text=Check%20out%20UniqueBrains%20-%20Free%20courses%20for%20parents!%20https://uniquebrains.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
            >
              📢 Spread the Word
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-sm">
          Questions? Reach out to us on WhatsApp
        </p>
      </div>
    </div>
  )
}

export default ComingSoon