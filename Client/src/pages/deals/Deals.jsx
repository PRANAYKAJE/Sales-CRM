import { useState, useEffect } from 'react'
import { dealsAPI, leadsAPI } from '../../utils/api'
import DealModal from './DealModal'

const stages = [
  { id: 'Prospect', label: 'Prospect', color: 'blue' },
  { id: 'Negotiation', label: 'Negotiation', color: 'yellow' },
  { id: 'Won', label: 'Won', color: 'green' },
  { id: 'Lost', label: 'Lost', color: 'red' },
]

export default function Deals() {
  const [deals, setDeals] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError(null)
      const [dealsRes, leadsRes] = await Promise.all([
        dealsAPI.getAll(),
        leadsAPI.getAll(),
      ])
      const dealsData = Array.isArray(dealsRes.data?.data) ? dealsRes.data.data : []
      const leadsData = Array.isArray(leadsRes.data?.data) 
        ? leadsRes.data.data 
        : Array.isArray(leadsRes.data) 
          ? leadsRes.data 
          : []
      setDeals(dealsData)
      setLeads(leadsData)
    } catch (err) {
      setError(err.displayMessage || 'Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDeal = () => {
    setEditingDeal(null)
    setShowModal(true)
  }

  const handleEditDeal = (deal) => {
    setEditingDeal(deal)
    setShowModal(true)
  }

  const handleDeleteDeal = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      setDeleteLoading(id)
      try {
        await dealsAPI.delete(id)
        setDeals(deals.filter((deal) => deal._id !== id))
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete deal')
      } finally {
        setDeleteLoading(null)
      }
    }
  }

  const handleSaveDeal = (dealData) => {
    if (editingDeal) {
      setDeals(deals.map((deal) => (deal._id === editingDeal._id ? dealData : deal)))
    } else {
      setDeals([dealData, ...deals])
    }
    setShowModal(false)
  }

  const getDealsByStage = (stageId) => {
    const stageDeals = deals.filter((deal) => deal.stage === stageId)
    return [...stageDeals].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'valueHigh':
          return (b.value || 0) - (a.value || 0)
        case 'valueLow':
          return (a.value || 0) - (b.value || 0)
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        default:
          return 0
      }
    })
  }

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'valueHigh', label: 'Value (High-Low)' },
    { value: 'valueLow', label: 'Value (Low-High)' },
    { value: 'title', label: 'Title (A-Z)' },
  ]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  const getStageColor = (color) => {
    const colors = {
      blue: { border: 'border-blue-500 dark:border-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' },
      yellow: { border: 'border-yellow-500 dark:border-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' },
      green: { border: 'border-green-500 dark:border-green-600', bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' },
      red: { border: 'border-red-500 dark:border-red-600', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' },
    }
    return colors[color] || colors.blue
  }

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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Deals</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Manage your sales pipeline</p>
        </div>
        <button
          onClick={handleAddDeal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow transition-colors whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Deal
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
            <button onClick={fetchData} className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-colors text-sm">
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200 text-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const colors = getStageColor(stage.color)
          const stageDeals = getDealsByStage(stage.id)
          return (
            <div key={stage.id} className="flex flex-col min-w-0">
              <div className={`border-t-4 ${colors.border} bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 transition-colors`}>
                <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-white text-sm md:text-base">{stage.label}</h3>
                    <span className={`px-2 py-0.5 md:py-1 text-xs font-medium rounded-full ${colors.badge}`}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatCurrency(stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0))}
                  </p>
                </div>

                <div className="p-2 md:p-3 space-y-2 max-h-64 md:max-h-96 overflow-y-auto custom-scrollbar">
                  {stageDeals.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm text-center py-4">No deals</p>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal._id}
                        className={`p-2 md:p-3 rounded-lg border ${colors.border} bg-white dark:bg-gray-800 hover:scale-102 transition-transform cursor-pointer`}
                        onClick={() => handleEditDeal(deal)}
                      >
                        <p className="font-medium text-gray-800 dark:text-white text-xs md:text-sm truncate">{deal.title}</p>
                        <p className={`text-xs md:text-sm font-semibold ${colors.text} mt-0.5 md:mt-1`}>{formatCurrency(deal.value)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1 truncate">
                          {deal.leadId?.name || (typeof deal.leadId === 'object' ? deal.leadId?.name : 'No lead')}
                        </p>
                        <div className="flex items-center gap-1 md:gap-2 mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditDeal(deal); }}
                            className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors p-1"
                          >
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteDeal(deal._id); }}
                            disabled={deleteLoading === deal._id}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 disabled:opacity-50"
                          >
                            {deleteLoading === deal._id ? (
                              <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <DealModal
          deal={editingDeal}
          leads={leads}
          onClose={() => setShowModal(false)}
          onSave={handleSaveDeal}
        />
      )}
    </div>
  )
}
