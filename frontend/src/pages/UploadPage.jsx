import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listAlgorithms } from '../api/algorithms'
import { uploadImage } from '../api/images'
import { submitJob } from '../api/jobs'

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png']
const MAX_SIZE_BYTES = 10 * 1024 * 1024

function UploadPage() {
  const navigate = useNavigate()

  const [file, setFile] = useState(null)
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

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError('Please select a file.')
      return
    }
    const ext = file.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError('Only JPG and PNG files are accepted.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('File must be 10 MB or smaller.')
      return
    }
    if (!algorithmName) {
      setError('Please select an algorithm.')
      return
    }

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

  return (
    <div>
      <h1>Upload image</h1>
      <p><Link to="/dashboard">Back to dashboard</Link></p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="file">Image file (JPG or PNG, max 10 MB)</label>
          <br />
          <input
            id="file"
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </div>

        <div>
          <label htmlFor="algorithm">Algorithm</label>
          <br />
          {isLoadingAlgorithms ? (
            <p>Loading algorithms…</p>
          ) : (
            <select
              id="algorithm"
              value={algorithmName}
              onChange={(e) => setAlgorithmName(e.target.value)}
            >
              <option value="">Select an algorithm</option>
              {algorithms.map((alg) => (
                <option key={alg.name} value={alg.name}>
                  {alg.display_name} (v{alg.version})
                </option>
              ))}
            </select>
          )}
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={isSubmitting || isLoadingAlgorithms}>
          {isSubmitting ? 'Uploading…' : 'Upload and run'}
        </button>
      </form>
    </div>
  )
}

export default UploadPage
