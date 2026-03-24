import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    dealsWon: 0,
    dealsLost: 0,
    activities: 0,
    totalDealValue: 0,
  })
  const [recentLeads, setRecentLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const [leadsRes, dealsRes, activitiesRes] = await Promise.all([
        api.get('/leads', { params: { limit: 5 } }),
        api.get('/deals', { params: { limit: 100 } }),
        api.get('/activities', { params: { limit: 10 } }),
      ])

      const leads = Array.isArray(leadsRes.data?.data) ? leadsRes.data.data : []
      const deals = Array.isArray(dealsRes.data?.data) ? dealsRes.data.data : []
      const activities = Array.isArray(activitiesRes.data?.data) ? activitiesRes.data.data : []

      setStats({
        totalLeads: leadsRes.data?.pagination?.total || leads.length,
        dealsWon: deals.filter((d) => d.stage === 'Won').length,
        dealsLost: deals.filter((d) => d.stage === 'Lost').length,
        activities: activities.length,
        totalDealValue: deals.reduce((sum, d) => sum + (d.value || 0), 0),
      })

      setRecentLeads(leads.slice(0, 5))
    } catch (err) {
      setError(err.displayMessage || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const kpiCards = [
    {
      label: 'Total Leads',
      value: stats.totalLeads,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      label: 'Deals Won',
      value: stats.dealsWon,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      label: 'Deals Lost',
      value: stats.dealsLost,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'red',
    },
    {
      label: 'Activities',
      value: stats.activities,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'purple',
    },
  ]

  const getStatusBadge = (status) => {
    const badges = {
      'Prospect': 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      'Negotiation': 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
      'Won': 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
      'Lost': 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    }
    return badges[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  }

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's your sales overview.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              to="/leads"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow transition-colors whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Lead</span>
            </Link>
            
            <Link
              to="/deals"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow transition-colors whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Deal</span>
            </Link>
            
            <Link
              to="/activities"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow transition-colors whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Log Activity</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-card hover:shadow-card-hover border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mt-1 md:mt-2">{card.value}</p>
              </div>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${colorClasses[card.color]}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">Recent Leads</h2>
          <Link to="/leads" className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 font-medium">
            View All →
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-6 md:p-8 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No leads yet</p>
            <Link to="/leads" className="text-primary-500 hover:text-primary-600 text-sm mt-2 inline-block">
              Create your first lead
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentLeads.map((lead) => {
              const initials = lead.name
                ? lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                : '?'
              return (
                <Link
                  key={lead._id}
                  to={`/leads/${lead._id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {initials}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{lead.name || '-'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{lead.email || '-'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(lead.status)}`}>
                    {lead.status || 'Prospect'}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
