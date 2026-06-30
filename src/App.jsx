import { useState } from 'react'
import './App.css'

const CAR_DATABASE = [
  { brand: 'Maruti Suzuki', model: 'Swift', fuelType: 'Petrol', year: 2023, price: 650000 },
  { brand: 'Maruti Suzuki', model: 'Baleno', fuelType: 'Petrol', year: 2022, price: 750000 },
  { brand: 'Hyundai', model: 'Creta', fuelType: 'Diesel', year: 2023, price: 1500000 },
  { brand: 'Hyundai', model: 'i20', fuelType: 'Petrol', year: 2021, price: 800000 },
  { brand: 'Tata', model: 'Nexon', fuelType: 'Electric', year: 2023, price: 1450000 },
  { brand: 'Tata', model: 'Punch', fuelType: 'Petrol', year: 2022, price: 700000 },
  { brand: 'Honda', model: 'City', fuelType: 'Petrol', year: 2023, price: 1300000 },
  { brand: 'Honda', model: 'Amaze', fuelType: 'Diesel', year: 2021, price: 900000 },
  { brand: 'Toyota', model: 'Innova Crysta', fuelType: 'Diesel', year: 2022, price: 2200000 },
  { brand: 'Toyota', model: 'Fortuner', fuelType: 'Diesel', year: 2023, price: 3800000 },
  { brand: 'Mahindra', model: 'XUV700', fuelType: 'Diesel', year: 2023, price: 2400000 },
  { brand: 'Kia', model: 'Seltos', fuelType: 'Petrol', year: 2022, price: 1600000 },
]

const BRANDS = [...new Set(CAR_DATABASE.map((c) => c.brand))]
const FUEL_TYPES = [...new Set(CAR_DATABASE.map((c) => c.fuelType))]

function App() {
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    fuelType: '',
    minPrice: '',
    maxPrice: '',
  })
  const [results, setResults] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const filtered = CAR_DATABASE.filter((car) => {
      if (filters.brand && car.brand !== filters.brand) return false
      if (filters.model && !car.model.toLowerCase().includes(filters.model.toLowerCase())) return false
      if (filters.fuelType && car.fuelType !== filters.fuelType) return false
      if (filters.minPrice && car.price < Number(filters.minPrice)) return false
      if (filters.maxPrice && car.price > Number(filters.maxPrice)) return false
      return true
    })
    setResults(filtered)
  }

  const handleReset = () => {
    setFilters({ brand: '', model: '', fuelType: '', minPrice: '', maxPrice: '' })
    setResults(null)
  }

  return (
    <div className="page">
      <h1>Car Research Platform</h1>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="field">
          <label htmlFor="brand">Brand</label>
          <select id="brand" name="brand" value={filters.brand} onChange={handleChange}>
            <option value="">Any</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="model">Model</label>
          <input
            id="model"
            name="model"
            type="text"
            placeholder="e.g. Swift"
            value={filters.model}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="fuelType">Fuel Type</label>
          <select id="fuelType" name="fuelType" value={filters.fuelType} onChange={handleChange}>
            <option value="">Any</option>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="minPrice">Min Price (₹)</label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min="0"
            placeholder="0"
            value={filters.minPrice}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="maxPrice">Max Price (₹)</label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min="0"
            placeholder="No limit"
            value={filters.maxPrice}
            onChange={handleChange}
          />
        </div>

        <div className="actions">
          <button type="submit">Search</button>
          <button type="button" onClick={handleReset}>Reset</button>
        </div>
      </form>

      <section className="results">
        {results === null && <p className="hint">Enter your search criteria and click Search.</p>}
        {results !== null && results.length === 0 && <p className="hint">No cars match your search.</p>}
        {results !== null && results.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Brand</th>
                <th>Model</th>
                <th>Fuel Type</th>
                <th>Year</th>
                <th>Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((car, idx) => (
                <tr key={idx}>
                  <td>{car.brand}</td>
                  <td>{car.model}</td>
                  <td>{car.fuelType}</td>
                  <td>{car.year}</td>
                  <td>{car.price.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default App
