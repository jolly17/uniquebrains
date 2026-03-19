import { useState, useMemo } from 'react'
import './DataTable.css'

/**
 * Export filtered data to CSV file
 */
function exportToCSV(columns, data, filename = 'export') {
  // Build CSV header from column labels
  const headers = columns.map(col => col.label)
  
  // Build CSV rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key]
      if (value === null || value === undefined) return ''
      // Handle arrays
      if (Array.isArray(value)) return value.join('; ')
      // Handle booleans
      if (typeof value === 'boolean') return value ? 'Yes' : 'No'
      // Escape commas and quotes in strings
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function DataTable({ columns, data, onEdit, onDelete, loading, filters = [], exportFilename = 'data' }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const itemsPerPage = 20

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Handle column sort
  const handleSort = (columnKey) => {
    setSortConfig(prev => {
      if (prev.key === columnKey) {
        // Toggle direction or clear sort
        if (prev.direction === 'asc') return { key: columnKey, direction: 'desc' }
        if (prev.direction === 'desc') return { key: null, direction: 'asc' }
      }
      return { key: columnKey, direction: 'asc' }
    })
    setCurrentPage(1)
  }

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    // First filter
    let result = data.filter(row => {
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
          const rowValue = row[filterKey]
          // Handle boolean filter values (e.g., is_published: "true"/"false")
          if (filterValue === 'true' || filterValue === 'false') {
            if (String(rowValue) !== filterValue) return false
          } else if (rowValue !== filterValue) {
            return false
          }
        }
      }

      return true
    })

    // Then sort
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]

        // Handle null/undefined
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return 1
        if (bVal == null) return -1

        // Handle booleans
        if (typeof aVal === 'boolean') {
          aVal = aVal ? 1 : 0
          bVal = bVal ? 1 : 0
        }

        // Handle numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
        }

        // Handle dates
        if (sortConfig.key.includes('date') || sortConfig.key.includes('created_at') || sortConfig.key.includes('updated_at')) {
          const dateA = new Date(aVal)
          const dateB = new Date(bVal)
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
          }
        }

        // Default string comparison
        const strA = String(aVal).toLowerCase()
        const strB = String(bVal).toLowerCase()
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, searchTerm, activeFilters, sortConfig, columns])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage)

  // Get sort indicator for a column
  const getSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return ' ↕'
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  if (loading) {
    return (
      <div className="data-table-loading">
        <div className="table-loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    )
  }

  return (
    <div className="data-table-container">
      {/* Search, Filters, and Export */}
      <div className="table-controls">
        <div className="table-controls-left">
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
        </div>

        <div className="table-controls-right">
          <button
            className="btn-export"
            onClick={() => exportToCSV(columns, filteredAndSortedData, exportFilename)}
            disabled={filteredAndSortedData.length === 0}
            title="Export filtered data to CSV"
          >
            📥 Export CSV
          </button>
          <div className="table-info">
            Showing {filteredAndSortedData.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`sortable-header ${sortConfig.key === col.key ? 'sorted' : ''}`}
                  onClick={() => handleSort(col.key)}
                  title={`Sort by ${col.label}`}
                >
                  <span className="header-content">
                    {col.label}
                    <span className="sort-indicator">{getSortIndicator(col.key)}</span>
                  </span>
                </th>
              ))}
              {(onEdit || onDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="no-data">
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
