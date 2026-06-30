const SEATING_OPTIONS = [2, 4, 5, 6, 7, 8]

function FilterPanel({ filters, filterOptions, onChange, onReset }) {
  const handleField = (name) => (e) => {
    onChange({ [name]: e.target.value })
  }

  return (
    <form className="search-form" onSubmit={(e) => e.preventDefault()}>
      <div className="field">
        <label htmlFor="query">Search</label>
        <input
          id="query"
          name="query"
          type="text"
          placeholder="Search make, model, variant..."
          value={filters.query}
          onChange={handleField('query')}
        />
      </div>

      <div className="field">
        <label htmlFor="make">Make</label>
        <select id="make" name="make" value={filters.make} onChange={handleField('make')}>
          <option value="">Any</option>
          {filterOptions.makes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="bodyType">Body Type</label>
        <select id="bodyType" name="bodyType" value={filters.bodyType} onChange={handleField('bodyType')}>
          <option value="">Any</option>
          {filterOptions.bodyTypes.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="fuelType">Fuel Type</label>
        <select id="fuelType" name="fuelType" value={filters.fuelType} onChange={handleField('fuelType')}>
          <option value="">Any</option>
          {filterOptions.fuelTypes.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="transmission">Transmission</label>
        <select id="transmission" name="transmission" value={filters.transmission} onChange={handleField('transmission')}>
          <option value="">Any</option>
          {filterOptions.transmissions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="seatingCapacity">Seating Capacity</label>
        <select
          id="seatingCapacity"
          name="seatingCapacity"
          value={filters.seatingCapacity}
          onChange={handleField('seatingCapacity')}
        >
          <option value="">Any</option>
          {SEATING_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
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
          onChange={handleField('minPrice')}
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
          onChange={handleField('maxPrice')}
        />
      </div>

      <div className="actions">
        <button type="button" onClick={onReset}>Reset</button>
      </div>
    </form>
  )
}

export default FilterPanel
