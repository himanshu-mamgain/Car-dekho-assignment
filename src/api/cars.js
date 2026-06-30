import { apiFetch } from './client'

export function getFilters() {
  return apiFetch('/cars/filters')
}

export function searchCars(params) {
  return apiFetch('/cars/search', { params })
}

export function getCar(id) {
  return apiFetch(`/cars/${id}`)
}

export function compareCars(firstId, secondId) {
  return apiFetch('/cars/compare', { params: { firstId, secondId } })
}
