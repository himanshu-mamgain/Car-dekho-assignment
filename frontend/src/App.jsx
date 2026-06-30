import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { getFilters, searchCars, getCar, compareCars } from './api/cars'
import { ApiError } from './api/client'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import FilterPanel from './components/FilterPanel'
import CarResultsTable from './components/CarResultsTable'
import CompareView from './components/CompareView'
import CarDetailView from './components/CarDetailView'
import ErrorBanner from './components/ErrorBanner'

const EMPTY_FILTERS = {
  query: '',
  make: '',
  bodyType: '',
  fuelType: '',
  transmission: '',
  minPrice: '',
  maxPrice: '',
  seatingCapacity: '',
}

const EMPTY_FILTER_OPTIONS = { makes: [], bodyTypes: [], fuelTypes: [], transmissions: [] }

const PAGE_LIMIT = 20

function errorMessage(err) {
  if (err instanceof ApiError) return err.message
  return 'Something went wrong. Please try again.'
}

function App() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const debouncedQuery = useDebouncedValue(filters.query, 300)

  const [filterOptions, setFilterOptions] = useState(EMPTY_FILTER_OPTIONS)
  const [filterOptionsError, setFilterOptionsError] = useState(null)

  const [searchResult, setSearchResult] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const [selectedForCompare, setSelectedForCompare] = useState([])
  const [compareResult, setCompareResult] = useState(null)
  const [compareError, setCompareError] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)

  const [detailCarId, setDetailCarId] = useState(null)
  const [detailCar, setDetailCar] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)

  const filterSignature = [
    filters.make,
    filters.bodyType,
    filters.fuelType,
    filters.transmission,
    filters.minPrice,
    filters.maxPrice,
    filters.seatingCapacity,
    debouncedQuery,
  ].join('|')

  const loadFilterOptions = useCallback(() => {
    setFilterOptionsError(null)
    getFilters()
      .then(setFilterOptions)
      .catch((err) => setFilterOptionsError(errorMessage(err)))
  }, [])

  useEffect(() => {
    loadFilterOptions()
  }, [loadFilterOptions])

  useEffect(() => {
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSignature])

  const runSearch = useCallback(() => {
    setSearchLoading(true)
    setSearchError(null)
    searchCars({
      query: debouncedQuery,
      make: filters.make,
      bodyType: filters.bodyType,
      fuelType: filters.fuelType,
      transmission: filters.transmission,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      seatingCapacity: filters.seatingCapacity,
      page,
      limit: PAGE_LIMIT,
    })
      .then(setSearchResult)
      .catch((err) => setSearchError(errorMessage(err)))
      .finally(() => setSearchLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSignature, page])

  useEffect(() => {
    runSearch()
  }, [runSearch])

  const handleFilterChange = (partial) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }

  const handleReset = () => {
    setFilters(EMPTY_FILTERS)
    setSelectedForCompare([])
    setCompareResult(null)
  }

  const handleToggleCompare = (carId) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(carId)) return prev.filter((id) => id !== carId)
      if (prev.length >= 2) return prev
      return [...prev, carId]
    })
  }

  const handleCompare = () => {
    if (selectedForCompare.length !== 2) return
    const [firstId, secondId] = selectedForCompare
    setCompareLoading(true)
    setCompareError(null)
    compareCars(firstId, secondId)
      .then(setCompareResult)
      .catch((err) => setCompareError(errorMessage(err)))
      .finally(() => setCompareLoading(false))
  }

  const handleViewDetails = (carId) => {
    setDetailCarId(carId)
    setDetailLoading(true)
    setDetailError(null)
    setDetailCar(null)
    getCar(carId)
      .then(setDetailCar)
      .catch((err) => setDetailError(errorMessage(err)))
      .finally(() => setDetailLoading(false))
  }

  return (
    <div className="page">
      <h1>Car Research Platform</h1>

      <ErrorBanner message={filterOptionsError} onRetry={loadFilterOptions} />

      <FilterPanel
        filters={filters}
        filterOptions={filterOptions}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      <div className="compare-bar">
        <span>{selectedForCompare.length}/2 selected for comparison</span>
        <button type="button" disabled={selectedForCompare.length !== 2 || compareLoading} onClick={handleCompare}>
          {compareLoading ? 'Comparing...' : 'Compare'}
        </button>
      </div>

      <ErrorBanner message={searchError} onRetry={runSearch} />

      <CarResultsTable
        loading={searchLoading}
        error={searchError}
        searchResult={searchResult}
        selectedForCompare={selectedForCompare}
        onToggleCompare={handleToggleCompare}
        onPageChange={setPage}
        onViewDetails={handleViewDetails}
      />

      {compareError && (
        <ErrorBanner message={compareError} onRetry={handleCompare} />
      )}

      {compareResult && (
        <CompareView compareResult={compareResult} onClose={() => setCompareResult(null)} />
      )}

      {detailCarId && (
        <CarDetailView
          car={detailCar}
          loading={detailLoading}
          error={detailError}
          onClose={() => setDetailCarId(null)}
        />
      )}
    </div>
  )
}

export default App
