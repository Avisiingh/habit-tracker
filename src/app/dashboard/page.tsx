'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { DailyPlanForm } from '@/components/DailyPlanForm'

interface DailyActivity {
  subjects: string[]
  accomplishments: string[]
  date: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([])
  const [showDailyForm, setShowDailyForm] = useState(false)

  const handleCheckIn = async () => {
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
      })
      if (response.ok) {
        setIsCheckedIn(true)
        setShowDailyForm(true)
      }
    } catch (error) {
      console.error('Error checking in:', error)
    }
  }

  const handleDailySubmit = (data: DailyActivity) => {
    setDailyActivities([data, ...dailyActivities])
    setShowDailyForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">{session?.user?.name || 'User'}</span>!
                </h1>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {isCheckedIn 
                    ? "You're all set for today! Keep up the great work!" 
                    : "Ready to continue your journey? Don't forget to check in today!"}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckIn}
                disabled={isCheckedIn}
                className={`mt-4 sm:mt-0 px-6 py-3 rounded-lg text-white font-medium transition-colors duration-200 ${
                  isCheckedIn
                    ? 'bg-green-500 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isCheckedIn ? 'Checked In ✓' : 'Check In Today'}
              </motion.button>
            </div>

            {showDailyForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
              >
                <DailyPlanForm onSubmit={handleDailySubmit} />
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white"
              >
                <h2 className="text-lg font-semibold mb-2">Current Streak</h2>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">7</span>
                  <span className="ml-2 text-primary-100">days</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
              >
                <h2 className="text-lg font-semibold mb-2">Longest Streak</h2>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">15</span>
                  <span className="ml-2 text-purple-100">days</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
              >
                <h2 className="text-lg font-semibold mb-2">Total Check-ins</h2>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">32</span>
                  <span className="ml-2 text-green-100">days</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h2>
              <div className="space-y-6">
                {dailyActivities.map((activity, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Daily Progress
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          timeZone: 'UTC'
                        })}
                      </span>
                    </div>
                    
                    {activity.subjects.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subjects Studied:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {activity.subjects.map((subject, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {activity.accomplishments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Accomplishments:
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {activity.accomplishments.map((accomplishment, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-600 dark:text-gray-400"
                            >
                              {accomplishment}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                {dailyActivities.length === 0 && isCheckedIn && (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No activities recorded yet. Add your first daily plan!
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 