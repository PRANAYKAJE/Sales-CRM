import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { usersAPI, leadsAPI } from '../../utils/api'

export default function Users() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [salesPersons, setSalesPersons] = useState([])
  const [leadsMap, setLeadsMap] = useState({})
  const [expandedUsers, setExpandedUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const page = parseInt(searchParams.get('page')) || 1
  const limit = 10

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const [usersRes, leadsRes] = await Promise.all([
        usersAPI.getSalesPersons({ page, limit }),
        leadsAPI.getAll({ limit: 1000 }),
      ])
      const result = usersRes.data
      const usersData = Array.isArray(result?.data) ? result.data : []
      setSalesPersons(usersData)
      if (result?.pagination) {
        setPagination((prev) => ({ ...prev, ...result.pagination }))
      }
      const leads = Array.isArray(leadsRes.data?.data) ? leadsRes.data.data : []
      const leadsByUser = {}
      leads.forEach((lead) => {
        const userId = typeof lead.assignedTo === 'object' ? lead.assignedTo?._id : lead.assignedTo
        if (userId) {
          if (!leadsByUser[userId]) {
            leadsByUser[userId] = []
          }
          leadsByUser[userId].push(lead)
        }
      })
      setLeadsMap(leadsByUser)
    } catch (err) {
      setError(err.displayMessage || 'Failed to load users data')
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePageChange = (newPage) => {
    navigate(`/users?page=${newPage}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleUserExpand = (userId) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  const getStatusBadge = (status) => {
    const badges = {
      'Prospect': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      'Negotiation': 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
      'Won': 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
      'Lost': 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    }
    return badges[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sales Team</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Total {pagination.total} sales persons</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {salesPersons.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 md:p-8 border border-gray-100 dark:border-gray-700 text-center">
            <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No sales persons found</p>
          </div>
        ) : (
          salesPersons.map((person) => {
            const userLeads = leadsMap[person._id] || []
            const isExpanded = expandedUsers[person._id]

            return (
              <div key={person._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-gray-200 dark:border-gray-600">
                        <span className="text-gray-800 dark:text-white font-bold text-sm md:text-lg">
                          {person.name ? person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white truncate">{person.name}</h3>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">{person.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{userLeads.length}</p>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Leads</p>
                      </div>
                      {userLeads.length > 0 && (
                        <button
                          onClick={() => toggleUserExpand(person._id)}
                          className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                          <svg
                            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && userLeads.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-4 md:p-6 bg-gray-50 dark:bg-gray-900/30">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Assigned Leads</h4>
                    <div className="space-y-2">
                      {userLeads.map((lead) => (
                        <div
                          key={lead._id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-primary-400 dark:bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-medium">
                                {lead.name ? lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 dark:text-white truncate">{lead.name || 'Unnamed'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{lead.email || 'No email'}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(lead.status)}`}>
                            {lead.status || 'Prospect'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 md:px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </span>
            </button>
            <span className="px-3 py-2 md:px-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="md:hidden">{page}/{pagination.totalPages}</span>
              <span className="hidden md:inline">Page {page} of {pagination.totalPages}</span>
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pagination.totalPages}
              className="px-3 py-2 md:px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
