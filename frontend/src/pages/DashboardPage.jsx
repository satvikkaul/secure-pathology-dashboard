import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listImages } from '../api/images'
import { listJobs } from '../api/jobs'

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [images, setImages] = useState([])
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([listImages(), listJobs()])
      .then(([imgs, jbs]) => {
        setImages(imgs)
        setJobs(jbs)
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <div>
        <h1>Welcome, {user?.full_name}</h1>
        <button type="button" onClick={handleLogout}>Log out</button>
      </div>

      <p><Link to="/upload">Upload new image</Link></p>

      {isLoading && <p>Loading…</p>}
      {error && <p role="alert">{error}</p>}

      {!isLoading && !error && (
        <>
          <section>
            <h2>Uploaded images</h2>
            {images.length === 0 ? (
              <p>No images uploaded yet.</p>
            ) : (
              <ul>
                {images.map((img) => (
                  <li key={img.id}>
                    Image #{img.id} &middot; {img.content_type} &middot; {img.file_size} B &middot;{' '}
                    {new Date(img.created_at).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2>Jobs</h2>
            {jobs.length === 0 ? (
              <p>No jobs run yet.</p>
            ) : (
              <ul>
                {jobs.map((job) => (
                  <li key={job.id}>
                    <Link to={`/jobs/${job.id}`}>Job #{job.id}</Link>{' '}
                    &middot; {job.algorithm_name} &middot; {job.status} &middot;{' '}
                    {new Date(job.created_at).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default DashboardPage
