/**
 * Reusable File Upload Component
 * 
 * Supports drag-and-drop, file validation, and progress tracking
 * Requirements: 4.1, 4.3, 4.4
 */

import { useState, useRef } from 'react'
import './FileUpload.css'

function FileUpload({ 
  onUpload, 
  accept, 
  maxSize = 100 * 1024 * 1024, // 100MB default
  multiple = false,
  label = 'Upload File',
  description = 'Drag and drop or click to browse'
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = async (files) => {
    setError(null)
    
    const file = files[0] // For now, handle single file
    
    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
      setError(`File size exceeds ${maxSizeMB}MB limit`)
      return
    }

    setSelectedFile(file)
    setUploading(true)
    setProgress(0)

    try {
      // Call the upload function with progress callback
      const result = await onUpload(file, (progressEvent) => {
        if (progressEvent.loaded && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          setProgress(percent)
        }
      })

      if (result.error) {
        setError(result.error.message || 'Upload failed')
      } else {
        // Success - reset after a moment
        setTimeout(() => {
          setSelectedFile(null)
          setProgress(0)
        }, 2000)
      }
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="file-upload">
      <label className="file-upload-label">{label}</label>
      
      <div
        className={`file-upload-dropzone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {!uploading && !selectedFile && (
          <div className="file-upload-content">
            <svg className="file-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="file-upload-text">{description}</p>
            <p className="file-upload-hint">Max size: {formatFileSize(maxSize)}</p>
          </div>
        )}

        {selectedFile && !uploading && progress === 100 && (
          <div className="file-upload-success">
            <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p>{selectedFile.name}</p>
            <p className="success-text">Upload complete!</p>
          </div>
        )}

        {uploading && (
          <div className="file-upload-progress">
            <p className="file-name">{selectedFile?.name}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="progress-text">{progress}%</p>
          </div>
        )}
      </div>

      {error && (
        <div className="file-upload-error">
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default FileUpload
