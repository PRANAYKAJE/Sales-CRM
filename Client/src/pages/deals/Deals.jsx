import { useState, useEffect } from 'react'
import { dealsAPI, leadsAPI } from '../../utils/api'
import DealModal from './DealModal'

const stages = [
  { id: 'Prospecting', label: 'Prospecting', color: 'blue' },
  { id: 'Qualification', label: 'Qualification', color: 'purple' },
  { id: 'Proposal', label: 'Proposal', color: 'orange' },
  { id: 'Negotiation', label: 'Negotiation', color: 'yellow' },
  { id: 'Closed', label: 'Closed', color: 'gray' },
]

export default function Deals() {
  const [deals, setDeals] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(null)

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
      console.log('Deals API Response:', dealsRes.data)
      console.log('Leads API Response:', leadsRes.data)
      setDeals(dealsRes.data || [])
      setLeads(leadsRes.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load deals')
      console.error('Error fetching data:', err)
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
    const filtered = deals.filter((deal) => deal.stage === stageId)
    console.log(`Deals for stage ${stageId}:`, filtered)
    return filtered
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  const getStageColor = (color) => {
    const colors = {
      blue: {
        border: 'border-blue-500 dark:border-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      },
      purple: {
        border: 'border-purple-500 dark:border-purple-600',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
      },
      orange: {
        border: 'border-orange-500 dark:border-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
      },
      yellow: {
        border: 'border-yellow-500 dark:border-yellow-600',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-600 dark:text-yellow-400',
        badge: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
      },
      gray: {
        border: 'border-gray-500 dark:border-gray-600',
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        text: 'text-gray-600 dark:text-gray-400',
        badge: 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300',
      },
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Deals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your sales pipeline</p>
        </div>
        <button
          onClick={handleAddDeal}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 flex items-center gap-2 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Deal
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const colors = getStageColor(stage.color)
          const stageDeals = getDealsByStage(stage.id)
          return (
            <div key={stage.id} className="flex flex-col">
              <div className={`border-t-4 ${colors.border} bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 transition-colors`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{stage.label}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.badge}`}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatCurrency(stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0))}
                  </p>
                </div>

                <div className="p-4 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {stageDeals.length === 0 ? (
                    <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">No deals</p>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal._id}
                        className={`p-3 rounded-lg border ${colors.border} bg-white dark:bg-gray-800 hover:scale-105 transition-transform cursor-pointer`}
                        onClick={() => handleEditDeal(deal)}
                      >
                        <p className="font-medium text-gray-800 dark:text-white text-sm">{deal.title}</p>
                        <p className={`text-sm font-semibold ${colors.text} mt-1`}>{formatCurrency(deal.value)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {deal.leadId?.name || (typeof deal.leadId === 'object' ? deal.leadId?.name : 'No lead')}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditDeal(deal)
                            }}
                            className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteDeal(deal._id)
                            }}
                            disabled={deleteLoading === deal._id}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            {deleteLoading === deal._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
