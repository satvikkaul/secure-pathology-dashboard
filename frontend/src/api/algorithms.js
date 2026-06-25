import request from './client'

export function listAlgorithms() {
  return request('/algorithms/')
}
