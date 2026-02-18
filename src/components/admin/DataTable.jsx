import { useState } from 'react'
import './DataTable.css'

function DataTable({ columns, data, onEdit, onDelete, loading, filters = [] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState({})
  const itemsPerPage = 20

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Filter data based on search and active filters
  const filteredData = data.filter(row => {
    // Search filter
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = searchTerm === '' || columns.some(col => {
      const value = row[col.key]
      return value && value.toString().toLowerCase().includes(searchLower)
    })

    if (!matchesSearch) return false

    // Apply active filters
    for (const [filterKey, filterValue] of Object.entries(activeFilters)) {
      if (filterValue && filterValue !== '') {
        if (row[filterKey] !== filterValue) {
          return false
        }
      }
    }

    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return <div className="data-table-loading">Loading...</div>
  }

  return (
    <div className="data-table-container">
      {/* Search and Filters */}
      <div className="table-controls">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="table-search"
        />

        {/* Filter Controls */}
        {filters.length > 0 && (
          <div className="table-filters">
            {filters.map(filter => (
              <div key={filter.key} className="filter-control">
                <label htmlFor={`filter-${filter.key}`}>{filter.label}:</label>
                <select
                  id={`filter-${filter.key}`}
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="filter-select"
                >
                  <option value="">All</option>
                  {filter.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="table-info">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
              {(onEdit || onDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="no-data">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr key={row.id || index}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="actions-cell">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="btn-action btn-edit"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="btn-action btn-delete"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}


export default DataTable
