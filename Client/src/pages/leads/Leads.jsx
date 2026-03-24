import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { leadsAPI } from '../../utils/api'
import LeadModal from './LeadModal'

export default function Leads() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('newest')
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page')) || 1
  const limit = 10

  const fetchLeads = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const params = {
        page,
        limit,
        search: search.length >= 2 ? search : '',
      }
      const response = await leadsAPI.getAll(params)
      const result = response.data
      const leadsData = Array.isArray(result.data) 
        ? result.data 
        : Array.isArray(result?.data?.data) 
          ? result.data.data 
          : []
      setLeads(leadsData)
      if (result.data?.pagination) {
        setPagination((prev) => ({ ...prev, ...result.data.pagination }))
      } else if (result.pagination) {
        setPagination((prev) => ({ ...prev, ...result.pagination }))
      }
    } catch (err) {
      setError(err.displayMessage || 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [page, limit, search])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handlePageChange = (newPage) => {
    if (search) {
      navigate(`/leads?search=${encodeURIComponent(search)}&page=${newPage}`)
    } else {
      navigate(`/leads?page=${newPage}`)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddLead = () => {
    setEditingLead(null)
    setShowModal(true)
  }

  const handleEditLead = (lead) => {
    setEditingLead(lead)
    setShowModal(true)
  }

  const handleSaveLead = (leadData) => {
    if (editingLead) {
      setLeads(leads.map((lead) => (lead._id === editingLead._id ? leadData : lead)))
    } else {
      fetchLeads()
    }
    setShowModal(false)
  }

  const handleDeleteLead = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      setDeleteLoading(id)
      try {
        await leadsAPI.delete(id)
        fetchLeads()
      } catch (err) {
        alert(err.displayMessage || 'Failed to delete lead')
      } finally {
        setDeleteLoading(null)
      }
    }
  }

  const sortedLeads = [...leads].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'nameAsc':
        return (a.name || '').localeCompare(b.name || '')
      case 'nameDesc':
        return (b.name || '').localeCompare(a.name || '')
      default:
        return 0
    }
  })

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'nameAsc', label: 'Name (A-Z)' },
    { value: 'nameDesc', label: 'Name (Z-A)' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Leads</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            {search ? `Search results for "${search}"` : `Total ${pagination.total} leads`}
          </p>
        </div>
        <button
          onClick={handleAddLead}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow transition-colors whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => fetchLeads()}
              className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-3 sm:p-4 md:px-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {leads.length} of {pagination.total} leads
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {sortedLeads.length === 0 ? (
          <div className="py-12 sm:py-16 text-center px-4">
            <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 sm:w-10 h-8 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-white mb-1">
              {search ? 'No leads found' : 'No leads yet'}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
              {search ? `No results for "${search}"` : 'Get started by adding your first lead'}
            </p>
            {!search && (
              <button
                onClick={handleAddLead}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Add Your First Lead
              </button>
            )}
          </div>
        ) : (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 dark:bg-gray-900 text-white">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {sortedLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/leads/${lead._id}`} className="font-medium text-gray-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                        {lead.name || '-'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{lead.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{lead.company || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{lead.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditLead(lead)}
                          className="p-2 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead._id)}
                          disabled={deleteLoading === lead._id}
                          className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteLoading === lead._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {sortedLeads.length > 0 && (
          <div className="md:hidden p-4 space-y-3">
            {sortedLeads.map((lead) => (
              <div key={lead._id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link to={`/leads/${lead._id}`} className="block font-medium text-gray-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors truncate">
                      {lead.name || '-'}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{lead.email || '-'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{lead.company || '-'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{lead.phone || '-'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditLead(lead)}
                      className="p-2 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead._id)}
                      disabled={deleteLoading === lead._id}
                      className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleteLoading === lead._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
              Page {page} of {pagination.totalPages}
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <LeadModal
          lead={editingLead}
          onClose={() => setShowModal(false)}
          onSave={handleSaveLead}
        />
      )}
    </div>
  )
}
