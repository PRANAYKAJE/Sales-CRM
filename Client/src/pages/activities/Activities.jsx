import { useState, useEffect } from 'react'
import { activitiesAPI, leadsAPI } from '../../utils/api'
import ActivityModal from './ActivityModal'

export default function Activities() {
  const [activities, setActivities] = useState([])
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError(null)
      const [activitiesRes, leadsRes] = await Promise.all([
        activitiesAPI.getAll(),
        leadsAPI.getAll(),
      ])
      setActivities(activitiesRes.data || [])
      setLeads(leadsRes.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const handleAddActivity = () => {
    setShowModal(true)
  }

  const handleDeleteActivity = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      setDeleteLoading(id)
      try {
        await activitiesAPI.delete(id)
        setActivities(activities.filter((activity) => activity._id !== id))
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete activity')
      } finally {
        setDeleteLoading(null)
      }
    }
  }

  const handleSaveActivity = (activityData) => {
    setActivities([activityData, ...activities])
    setShowModal(false)
  }

  const filteredActivities = activities.filter((activity) => {
    if (!typeFilter) return true
    return activity.type === typeFilter
  })

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'type':
        return (a.type || '').localeCompare(b.type || '')
      default:
        return 0
    }
  })

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'type', label: 'Type' },
  ]

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActivityIcon = (type) => {
    const icons = {
      Call: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      Meeting: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      Note: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      'Follow-up': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    }
    return icons[type] || icons.Note
  }

  const getActivityColor = (type) => {
    const colors = {
      Call: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
      Meeting: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
      Note: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400',
      'Follow-up': 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
    }
    return colors[type] || colors.Note
  }

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Call', label: 'Calls' },
    { value: 'Meeting', label: 'Meetings' },
    { value: 'Note', label: 'Notes' },
    { value: 'Follow-up', label: 'Follow-ups' },
  ]

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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Activities</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track all your sales activities</p>
        </div>
        <button
          onClick={handleAddActivity}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 flex items-center gap-2 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Activity
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

      <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200 text-sm"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200 text-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {sortedActivities.length} {sortedActivities.length === 1 ? 'activity' : 'activities'}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
        <div className="p-3 md:p-6">
          {sortedActivities.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                {typeFilter ? 'No activities match your filter' : 'No activities logged yet'}
              </p>
              {!typeFilter && (
                <>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start by logging your first activity</p>
                  <button
                    onClick={handleAddActivity}
                    className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Log Your First Activity
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedActivities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{activity.type}</p>
                        {activity.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          {activity.leadId?.name && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Lead: {activity.leadId.name}
                            </span>
                          )}
                          {activity.dealId?.title && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Deal: {activity.dealId.title}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteActivity(activity._id)}
                        disabled={deleteLoading === activity._id}
                        className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg disabled:opacity-50 flex-shrink-0"
                      >
                        {deleteLoading === activity._id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
      </div>

      {showModal && (
        <ActivityModal
          leads={leads}
          onClose={() => setShowModal(false)}
          onSave={handleSaveActivity}
        />
      )}
    </div>
  )
}
