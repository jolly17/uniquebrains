/**
 * Profile Picture Upload Component
 * 
 * Specialized component for uploading user profile pictures
 * Requirements: 4.1
 */

import { useState } from 'react'
import { uploadProfilePicture } from '../lib/storage'
import { useAuth } from '../context/AuthContext'
import './ProfilePictureUpload.css'

function ProfilePictureUpload({ currentImageUrl, onUploadComplete }) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImageUrl)
  const [error, setError] = useState(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setError(null)
    setUploading(true)

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    try {
      const { url, error: uploadError } = await uploadProfilePicture(user.id, file)

      if (uploadError) {
        setError(uploadError.message || 'Upload failed')
        setPreview(currentImageUrl) // Revert preview
      } else {
        // Update profile in database
        if (onUploadComplete) {
          onUploadComplete(url)
        }
      }
    } catch (err) {
      setError(err.message || 'Upload failed')
      setPreview(currentImageUrl)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="profile-picture-upload">
      <div className="profile-picture-container">
        <div className="profile-picture">
          {preview ? (
            <img src={preview} alt="Profile" />
          ) : (
            <div className="profile-picture-placeholder">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          {uploading && (
            <div className="profile-picture-overlay">
              <div className="spinner"></div>
            </div>
          )}
        </div>
        
        <label className="profile-picture-button">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {uploading ? 'Uploading...' : 'Change Photo'}
        </label>
      </div>

      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}

      <p className="upload-hint">
        JPG, PNG, WebP or GIF. Max size 5MB.
      </p>
    </div>
  )
}

export default ProfilePictureUpload
