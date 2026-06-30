function formatPrice(priceInr) {
  return `₹${Number(priceInr).toLocaleString('en-IN')}`
}

function CarResultsTable({
  loading,
  error,
  searchResult,
  selectedForCompare,
  onToggleCompare,
  onPageChange,
  onViewDetails,
}) {
  if (loading) {
    return <p className="hint">Loading cars...</p>
  }

  if (error) {
    return null
  }

  if (searchResult === null) {
    return <p className="hint">Enter your search criteria to find cars.</p>
  }

  const { data, total, page, limit } = searchResult

  if (data.length === 0) {
    return <p className="hint">No cars match your search.</p>
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="results">
      <table>
        <thead>
          <tr>
            <th>Compare</th>
            <th>Make</th>
            <th>Model</th>
            <th>Variant</th>
            <th>Fuel</th>
            <th>Transmission</th>
            <th>Seats</th>
            <th>Price (₹)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((car) => {
            const isSelected = selectedForCompare.includes(car.id)
            const disableCheckbox = !isSelected && selectedForCompare.length >= 2
            return (
              <tr key={car.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={disableCheckbox}
                    onChange={() => onToggleCompare(car.id)}
                    aria-label={`Select ${car.make} ${car.model} for comparison`}
                  />
                </td>
                <td>{car.make}</td>
                <td>{car.model}</td>
                <td>{car.variant}</td>
                <td>{car.fuelType}</td>
                <td>{car.transmission}</td>
                <td>{car.seatingCapacity}</td>
                <td>{formatPrice(car.priceInr)}</td>
                <td>
                  <button type="button" onClick={() => onViewDetails(car.id)}>
                    View
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="pagination">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages} ({total} results)
        </span>
        <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}

export default CarResultsTable
