import { useState, useEffect } from 'react'
import { usersAPI, leadsAPI } from '../../utils/api'

export default function Users() {
  const [salesPersons, setSalesPersons] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError(null)
      const [usersRes, leadsRes] = await Promise.all([
        usersAPI.getSalesPersons(),
        leadsAPI.getAll(),
      ])
      setSalesPersons(usersRes.data || [])
      setLeads(leadsRes.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users data')
      console.error('Error fetching users data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getLeadsForUser = (userId) => {
    return leads.filter(lead => {
      if (typeof lead.assignedTo === 'object') {
        return lead.assignedTo._id === userId
      }
      return lead.assignedTo === userId
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      'New Lead': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      'Contacted': 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
      'Qualified': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
      'Proposal': 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
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
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage sales persons and their leads</p>
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

      <div className="space-y-6">
        {salesPersons.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-8 border border-gray-100 dark:border-gray-700 text-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No sales persons found</p>
          </div>
        ) : (
          salesPersons.map((person) => {
            const userLeads = getLeadsForUser(person._id)
            return (
              <div key={person._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">
                          {person.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{person.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{person.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{userLeads.length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Leads</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Assigned Leads</h4>
                  {userLeads.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">No leads assigned</p>
                  ) : (
                    <div className="space-y-2">
                      {userLeads.map((lead) => (
                        <div key={lead._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                {lead.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">{lead.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{lead.email || 'No email'}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(lead.status)}`}>
                            {lead.status || 'New Lead'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
