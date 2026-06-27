import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listAlgorithms } from '../api/algorithms'
import { uploadImage } from '../api/images'
import { submitJob } from '../api/jobs'
import './DashboardPage.css'
import './UploadPage.css'

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png']
const MAX_SIZE_BYTES = 10 * 1024 * 1024

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function UploadPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [algorithmName, setAlgorithmName] = useState('')
  const [algorithms, setAlgorithms] = useState([])
  const [isLoadingAlgorithms, setIsLoadingAlgorithms] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    listAlgorithms()
      .then(setAlgorithms)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoadingAlgorithms(false))
  }, [])

  function validateFile(f) {
    const ext = f.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) return 'Only JPG and PNG files are accepted.'
    if (f.size > MAX_SIZE_BYTES) return 'File must be 10 MB or smaller.'
    return null
  }

  function applyFile(f) {
    if (!f) return
    const err = validateFile(f)
    if (err) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFile(null)
      setAlgorithmName('')
      setError(err)
      return
    }
    setError(null)
    setFile(f)
    setAlgorithmName('')
  }

  function clearFile() {
    if (fileInputRef.current) fileInputRef.current.value = ''
    setFile(null)
    setAlgorithmName('')
    setError(null)
  }

  function handleDragEnter(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    applyFile(e.dataTransfer.files[0])
  }

  async function handleSubmit() {
    if (!file || !algorithmName || isSubmitting) return
    setError(null)
    setIsSubmitting(true)
    try {
      const image = await uploadImage(file)
      const job = await submitJob(image.id, algorithmName)
      navigate(`/jobs/${job.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedAlgo = algorithms.find((a) => a.name === algorithmName)
  const canSubmit = Boolean(file && algorithmName && !isSubmitting && !isLoadingAlgorithms)

  return (
    <div className="dash-page">
      <header className="dash-header">
        <div>
          <div className="dash-brand">Secure Pathology Dashboard</div>
          <div style={{ fontSize: '12px', color: 'var(--c-text-lo)', marginTop: '2px' }}>
            Phase 1 Research Prototype
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link
            to="/dashboard"
            style={{
              padding: '7px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--c-text)',
              background: 'var(--c-surface-lo)',
              border: '1px solid var(--c-border)',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            Back to Dashboard
          </Link>
          <button className="dash-logout" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <main className="up-body">
        <span className="up-eyebrow">Upload Workflow</span>
        <h1 className="up-title">Upload Pathology Image</h1>
        <p className="up-subtitle">
          Upload a JPG or PNG image, choose the available analysis algorithm, and run a
          prototype-only classification job. This flow is for technical validation only
          and is not intended for clinical use.
        </p>

        <div className="up-layout">
          <section className="up-main">
            <div className="up-steps">
              <span className="up-step">
                <span className={`up-step-num${file ? ' up-step-num--active' : ''}`}>1</span>
                Select image
              </span>
              <span className="up-step">
                <span className={`up-step-num${file ? ' up-step-num--active' : ''}`}>2</span>
                Choose algorithm
              </span>
              <span className="up-step">
                <span className={`up-step-num${canSubmit ? ' up-step-num--active' : ''}`}>3</span>
                Run analysis
              </span>
            </div>

            <div className="up-section">
              <div className="up-section-hd">
                <div>
                  <h2 className="up-section-title">Image File</h2>
                  <p className="up-section-sub">Accepted formats: JPG, JPEG, PNG. Maximum file size: 10 MB.</p>
                </div>
                <span className="up-private-badge">Private to your account</span>
              </div>

              <label
                htmlFor="file-input"
                className={`up-dropzone${isDragging ? ' up-dropzone--active' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <span className="up-dropzone-arrow">↑</span>
                <span className="up-dropzone-main">Drag and drop an image here</span>
                <span className="up-dropzone-hint">or click to browse from your device</span>
                <div className="up-format-tags">
                  <span className="up-format-tag">JPG / PNG</span>
                  <span className="up-format-tag">Max 10 MB</span>
                  <span className="up-format-tag">Single image only</span>
                </div>
                <input
                  ref={fileInputRef}
                  id="file-input"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="up-file-input"
                  onChange={(e) => applyFile(e.target.files[0])}
                />
              </label>

              {file && (
                <div className="up-preview">
                  <div className="up-preview-info">
                    <div className="up-preview-icon-box" />
                    <div>
                      <p className="up-preview-name">{file.name}</p>
                      <p className="up-preview-meta">
                        {file.type || 'Image file'} · {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  <button type="button" className="up-remove-btn" onClick={clearFile}>
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className={`up-algo${!file ? ' up-algo--locked' : ''}`}>
              <h2 className="up-algo-title">Algorithm</h2>
              <p className="up-algo-sub">
                Select the available prototype model after choosing an image.
              </p>
              <label htmlFor="algorithm" className="up-select-label">Available model</label>
              {isLoadingAlgorithms ? (
                <p className="up-algo-note">Loading algorithms…</p>
              ) : (
                <select
                  id="algorithm"
                  className="up-select"
                  value={algorithmName}
                  onChange={(e) => setAlgorithmName(e.target.value)}
                  disabled={!file}
                >
                  <option value="">Select an algorithm</option>
                  {algorithms.map((alg) => (
                    <option key={alg.name} value={alg.name}>
                      {alg.display_name} (v{alg.version})
                    </option>
                  ))}
                </select>
              )}
              <p className="up-algo-note">
                Current prototype behavior: uploads the image, runs a synchronous
                placeholder model, then redirects to the job result page.
              </p>
            </div>

            <div className="up-submit-row">
              <p className="up-submit-desc">
                The app will upload the file, create an analysis job, and take you
                directly to the result screen.
              </p>
              <button
                type="button"
                className="up-submit-btn"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Uploading…' : 'Upload and Run'}
              </button>
            </div>

            {error && <div className="up-error" role="alert">{error}</div>}
          </section>

          <aside className="up-aside">
            <div className="up-aside-card">
              <h3 className="up-aside-card-title">Selected Model</h3>
              <p className="up-aside-model-name">
                {selectedAlgo ? `${selectedAlgo.display_name} (v${selectedAlgo.version})` : 'None selected'}
              </p>
              <p className="up-aside-text">
                Prototype model for validating the authenticated upload-to-analysis workflow.
              </p>
            </div>

            <div className="up-aside-card">
              <h3 className="up-aside-card-title">File Requirements</h3>
              <ul className="up-aside-list">
                <li>JPG, JPEG, or PNG only</li>
                <li>Maximum size: 10 MB</li>
                <li>One image per analysis run</li>
                <li>Results are prototype-only and not clinical</li>
              </ul>
            </div>

            <div className="up-aside-card up-aside-card--dark">
              <p className="up-aside-text">
                Files stay associated with the signed-in user, and this flow redirects
                directly to the result page after submission.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default UploadPage
