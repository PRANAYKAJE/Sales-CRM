import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { leadsAPI } from '../../utils/api'
import LeadModal from './LeadModal'

export default function Leads() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    const search = searchParams.get('search')
    if (search !== null) {
      setSearchQuery(search)
    }
  }, [searchParams])

  const fetchLeads = async () => {
    try {
      setError(null)
      const response = await leadsAPI.getAll()
      setLeads(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leads')
      console.error('Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value) {
      setSearchParams({ search: value })
    } else {
      setSearchParams({})
    }
  }

  const handleAddLead = () => {
    setEditingLead(null)
    setShowModal(true)
  }

  const handleEditLead = (lead) => {
    setEditingLead(lead)
    setShowModal(true)
  }

  const handleDeleteLead = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      setDeleteLoading(id)
      try {
        await leadsAPI.delete(id)
        setLeads(leads.filter((lead) => lead._id !== id))
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete lead')
      } finally {
        setDeleteLoading(null)
      }
    }
  }

  const handleSaveLead = (leadData) => {
    if (editingLead) {
      setLeads(leads.map((lead) => (lead._id === editingLead._id ? leadData : lead)))
    } else {
      setLeads([leadData, ...leads])
    }
    setShowModal(false)
  }

  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchQuery.toLowerCase().trim()
    const matchesSearch = !searchLower || 
      (lead.name && lead.name.toLowerCase().includes(searchLower)) ||
      (lead.email && lead.email.toLowerCase().includes(searchLower)) ||
      (lead.company && lead.company.toLowerCase().includes(searchLower))
    const matchesStatus = !statusFilter || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'New Lead', label: 'New Lead' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Proposal', label: 'Proposal' },
    { value: 'Won', label: 'Won' },
    { value: 'Lost', label: 'Lost' },
  ]

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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Leads</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your sales leads</p>
        </div>
        <button
          onClick={handleAddLead}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 flex items-center gap-2 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchLeads}
              className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, company..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-800 dark:text-gray-200"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery || statusFilter ? 'No leads match your filters' : 'No leads found'}
                    </p>
                    {!searchQuery && !statusFilter && (
                      <button
                        onClick={handleAddLead}
                        className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        Create your first lead
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4">
                      <Link to={`/leads/${lead._id}`} className="font-medium text-gray-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                        {lead.name || '-'}
                      </Link>
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">{lead.email || '-'}</td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">{lead.company || '-'}</td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">{lead.phone || '-'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(lead.status)}`}>
                        {lead.status || 'New Lead'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditLead(lead)}
                          className="p-2 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead._id)}
                          disabled={deleteLoading === lead._id}
                          className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteLoading === lead._id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredLeads.length} of {leads.length} leads
        </div>
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
