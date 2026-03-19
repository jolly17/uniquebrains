import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { bulkUploadResources, generateErrorReport } from '../../services/bulkUploadService';
import { MILESTONES } from '../../data/milestones';
import './AdminCareResources.css';

function AdminCareResources() {
  const { user } = useAuth();
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(extension)) {
      toast.warning('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }
    setFile(selectedFile);
    setResults(null);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning('Please select a file first');
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: 0 });
    setResults(null);

    try {
      const uploadResults = await bulkUploadResources(
        file,
        user,
        (current, total) => {
          setProgress({ current, total });
        }
      );
      
      setResults(uploadResults);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadErrorReport = () => {
    if (!results || results.errors.length === 0) return;

    const csv = generateErrorReport(results.errors);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'care-resources-errors.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const a = document.createElement('a');
    a.href = '/templates/care-resources-template.csv';
    a.download = 'care-resources-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="admin-care-resources">
      <div className="page-header">
        <h1>Care Resources Management</h1>
        <p>Upload and manage care roadmap resources</p>
      </div>

      <div className="upload-section">
        <div className="upload-card">
          <h2>Bulk Upload Resources</h2>
          
          <div className="upload-instructions">
            <h3>📋 Instructions</h3>
            <ol>
              <li>Download the CSV template below</li>
              <li>Fill in resource details (coordinates will be auto-generated from addresses)</li>
              <li>Upload the completed file</li>
              <li>Review results and fix any errors</li>
            </ol>
            
            <button 
              className="btn-secondary"
              onClick={handleDownloadTemplate}
            >
              📥 Download CSV Template
            </button>
          </div>

          <div 
            className={`dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
            
            {file ? (
              <div className="file-info">
                <span className="file-icon">📄</span>
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            ) : (
              <div className="dropzone-content">
                <span className="upload-icon">📤</span>
                <p>Drag & drop your CSV or Excel file here</p>
                <p className="dropzone-hint">or click to browse</p>
                <p className="dropzone-formats">Supports: .csv, .xlsx, .xls</p>
              </div>
            )}
          </div>

          {file && !uploading && (
            <div className="upload-actions">
              <button 
                className="btn-primary"
                onClick={handleUpload}
              >
                🚀 Upload Resources
              </button>
              <button 
                className="btn-secondary"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                ✕ Clear
              </button>
            </div>
          )}

          {uploading && (
            <div className="upload-progress">
              <div className="progress-header">
                <span>Uploading resources...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <p className="progress-note">
                ⏱️ This may take 1-2 seconds per resource for geocoding
              </p>
            </div>
          )}

          {results && (
            <div className="upload-results">
              <h3>Upload Results</h3>
              
              <div className="results-summary">
                <div className="result-stat success">
                  <span className="stat-icon">✅</span>
                  <div>
                    <p className="stat-value">{results.successful}</p>
                    <p className="stat-label">Successful</p>
                  </div>
                </div>
                
                <div className="result-stat failed">
                  <span className="stat-icon">❌</span>
                  <div>
                    <p className="stat-value">{results.failed}</p>
                    <p className="stat-label">Failed</p>
                  </div>
                </div>
                
                <div className="result-stat skipped">
                  <span className="stat-icon">⏭️</span>
                  <div>
                    <p className="stat-value">{results.skipped}</p>
                    <p className="stat-label">Skipped</p>
                  </div>
                </div>
                
                <div className="result-stat total">
                  <span className="stat-icon">📊</span>
                  <div>
                    <p className="stat-value">{results.total}</p>
                    <p className="stat-label">Total</p>
                  </div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="errors-section">
                  <div className="errors-header">
                    <h4>⚠️ Errors ({results.errors.length})</h4>
                    <button 
                      className="btn-secondary btn-small"
                      onClick={handleDownloadErrorReport}
                    >
                      📥 Download Error Report
                    </button>
                  </div>
                  
                  <div className="errors-table-container">
                    <table className="errors-table">
                      <thead>
                        <tr>
                          <th>Row</th>
                          <th>Name</th>
                          <th>Address</th>
                          <th>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.errors.slice(0, 10).map((error, index) => (
                          <tr key={index}>
                            <td>{error.row}</td>
                            <td>{error.name}</td>
                            <td>{error.address}</td>
                            <td className="error-message">{error.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {results.errors.length > 10 && (
                      <p className="errors-note">
                        Showing first 10 errors. Download full report for all {results.errors.length} errors.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {results.successful > 0 && (
                <div className="success-message">
                  🎉 Successfully uploaded {results.successful} resource{results.successful !== 1 ? 's' : ''}!
                </div>
              )}
            </div>
          )}
        </div>

        <div className="info-card">
          <h3>ℹ️ About Geocoding</h3>
          <p>
            You don't need to provide coordinates! The system automatically converts addresses 
            to coordinates using geocoding services.
          </p>
          
          <h4>Required Fields:</h4>
          <ul>
            <li><strong>milestone</strong> - Resource category (see valid milestones below)</li>
            <li><strong>name</strong> - Resource name</li>
            <li><strong>address</strong> - Street address (or "Online" for virtual services)</li>
            <li>City</li>
            <li>State/Province</li>
            <li>Postal code</li>
            <li>Country (2-letter code: US, IN, GB, etc.)</li>
          </ul>

          
          <h4> Online Services:</h4>
          <p>For virtual/online services with no physical location:</p>
          <ul>
            <li>Set address to "Online" or "Virtual"</li>
            <li>Provide the country code</li>
            <li>Leave city, state, zip_code empty</li>
          </ul><h4>Geocoding Provider:</h4>
          <p>
            <strong>Nominatim (OpenStreetMap)</strong> - Free, no API key needed
          </p>
          <p className="info-note">
            Rate limit: 1 request/second. Large uploads may take a few minutes.
          </p>

          <h4>Valid Milestones:</h4>
          <ul>
            {MILESTONES.map(milestone => (
              <li key={milestone.id}>{milestone.id} - {milestone.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminCareResources;
