function carLabel(car) {
  return `${car.make} ${car.model} ${car.variant}`
}

function buildSpecRows(first, second) {
  const keys = new Set([
    ...Object.keys(first.specs || {}),
    ...Object.keys(second.specs || {}),
  ])
  return [...keys].sort().map((key) => ({
    key,
    firstValue: first.specs?.[key] ?? '—',
    secondValue: second.specs?.[key] ?? '—',
    mismatch: (first.specs?.[key] ?? '') !== (second.specs?.[key] ?? ''),
  }))
}

function CompareView({ compareResult, onClose }) {
  if (!compareResult) return null

  const { first, second } = compareResult
  const rows = buildSpecRows(first, second)

  return (
    <div className="compare-overlay" role="dialog" aria-modal="true">
      <div className="compare-modal">
        <div className="compare-header">
          <h2>Compare Cars</h2>
          <button type="button" onClick={onClose}>Close</button>
        </div>

        <table className="compare-table">
          <thead>
            <tr>
              <th>Spec</th>
              <th>{carLabel(first)}</th>
              <th>{carLabel(second)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Price (₹)</td>
              <td>{Number(first.priceInr).toLocaleString('en-IN')}</td>
              <td>{Number(second.priceInr).toLocaleString('en-IN')}</td>
            </tr>
            {rows.map((row) => (
              <tr key={row.key} className={row.mismatch ? 'mismatch' : ''}>
                <td>{row.key}</td>
                <td>{String(row.firstValue)}</td>
                <td>{String(row.secondValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CompareView
