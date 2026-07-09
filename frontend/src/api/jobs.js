import request from './client'

export function listJobs() {
  return request('/jobs/')
}

export function submitJob(image_id, algorithm_name) {
  return request('/jobs/', {
    method: 'POST',
    body: JSON.stringify({ image_id, algorithm_name }),
  })
}

export function getJob(job_id) {
  return request(`/jobs/${job_id}`)
}
