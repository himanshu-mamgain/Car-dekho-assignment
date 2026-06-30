function CarDetailView({ car, loading, error, onClose }) {
  if (!loading && !error && !car) return null

  return (
    <div className="compare-overlay" role="dialog" aria-modal="true">
      <div className="compare-modal">
        <div className="compare-header">
          <h2>{car ? `${car.make} ${car.model} ${car.variant}` : 'Car Details'}</h2>
          <button type="button" onClick={onClose}>Close</button>
        </div>

        {loading && <p className="hint">Loading details...</p>}
        {error && <p className="hint">{error}</p>}

        {car && (
          <table className="compare-table">
            <tbody>
              <tr><td>Price (₹)</td><td>{Number(car.priceInr).toLocaleString('en-IN')}</td></tr>
              <tr><td>Fuel Type</td><td>{car.fuelType}</td></tr>
              <tr><td>Body Type</td><td>{car.bodyType}</td></tr>
              <tr><td>Transmission</td><td>{car.transmission}</td></tr>
              <tr><td>Seating Capacity</td><td>{car.seatingCapacity}</td></tr>
              <tr><td>Doors</td><td>{car.doors}</td></tr>
              <tr><td>Displacement (cc)</td><td>{car.displacementCc}</td></tr>
              <tr><td>City Mileage (kmpl)</td><td>{car.cityMileageKmpl}</td></tr>
              <tr><td>Highway Mileage (kmpl)</td><td>{car.highwayMileageKmpl}</td></tr>
              <tr><td>Power</td><td>{car.powerRaw}</td></tr>
              <tr><td>Torque</td><td>{car.torqueRaw}</td></tr>
              <tr><td>Drivetrain</td><td>{car.drivetrain}</td></tr>
              {Object.entries(car.specs || {}).map(([key, value]) => (
                <tr key={key}><td>{key}</td><td>{String(value)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default CarDetailView
