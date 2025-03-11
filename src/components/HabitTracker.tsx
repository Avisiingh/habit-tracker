'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import Image from 'next/image'

interface StudyDay {
  completed: boolean
  hours: number
  notes: string
  topics: string[]
  timestamp: string
  mood: 'great' | 'good' | 'okay' | 'tired' | null
  morningPlan: string
  eveningReflection: string
  isEvening: boolean
}

interface Habit {
  id: string
  name: string
  days: StudyDay[]
  streak: number
  startDate: string
  color: string
  targetHours: number
}

interface StudyPost extends StudyDay {
  habitId: string
  habitName: string
  dayNumber: number
  color: string
}

interface Quote {
  text: string
  author: string
  source: string
}

const COLORS = [
  { class: 'bg-green-500', hex: '#22C55E' },
  { class: 'bg-blue-500', hex: '#3B82F6' },
  { class: 'bg-purple-500', hex: '#A855F7' },
  { class: 'bg-pink-500', hex: '#EC4899' },
  { class: 'bg-yellow-500', hex: '#EAB308' },
  { class: 'bg-red-500', hex: '#EF4444' },
]

const MOODS = {
  great: '🤩',
  good: '😊',
  okay: '😐',
  tired: '😴',
}

const AVATARS = [
  '👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻', '🧑‍🎓', '🎓'
]

type TimelineView = 'home' | 'feed' | 'streak' | 'graph' | 'progress'

const CONSTANTS = {
  DAYS_TO_TRACK: 100,
  QUOTE_REFRESH_INTERVAL: 24 * 60 * 60 * 1000,
  DEFAULT_TARGET_HOURS: 6
} as const

const ANIMATIONS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideIn: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '-100%' }
  },
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 30
  }
} as const

const TodayCard: React.FC<{ habit: Habit, quote: Quote | null }> = ({ habit, quote }) => {
  const progress = useMemo(() => {
    const completed = habit.days.filter(day => day.completed).length
    return (completed / habit.days.length) * 100
  }, [habit.days])

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 backdrop-filter backdrop-blur-lg"
      whileHover={{ scale: 1.01 }}
      transition={ANIMATIONS.spring}
    >
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Today</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <StatsItem label="Day Streak" value={`${habit.streak}`} />
          <StatsItem label="Daily Goal" value={`${habit.targetHours}h`} />
          <StatsItem label="Complete" value={`${progress.toFixed(0)}%`} />
        </div>

        {quote && <QuoteDisplay quote={quote} />}
      </div>
    </motion.div>
  )
}

const StatsItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center">
    <div className="text-xl sm:text-2xl font-bold text-primary-600">{value}</div>
    <div className="text-xs sm:text-sm text-gray-500">{label}</div>
  </div>
)

const QuoteDisplay: React.FC<{ quote: Quote }> = ({ quote }) => (
  <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 italic">"{quote.text}"</p>
    <p className="text-xs text-gray-500 mt-2">— {quote.author}</p>
  </div>
)

const StudyPost: React.FC<{
  post: StudyPost;
  avatar: string;
  onEdit: (dayIndex: number, post: StudyPost, isEvening: boolean) => void;
}> = React.memo(({ post, avatar, onEdit }) => {
  const formattedDate = useMemo(() => {
    if (!post.timestamp) return ''
    return new Date(post.timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [post.timestamp])

  return (
    <motion.div
      key={post.timestamp}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 backdrop-filter backdrop-blur-lg p-3 sm:p-4"
      variants={ANIMATIONS.fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            Day {post.dayNumber}
          </div>
          <div className="text-xs text-gray-500">
            {formattedDate}
          </div>
        </div>
      </div>

      {post.morningPlan && (
        <div className="mb-3">
          <p className="text-gray-600 dark:text-gray-300 text-sm">{post.morningPlan}</p>
        </div>
      )}

      {post.eveningReflection && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{post.mood && MOODS[post.mood]}</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Studied for {post.hours} hours
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{post.eveningReflection}</p>
          {post.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.topics.map((topic, i) => (
                <span
                  key={i}
                  className="text-xs text-primary-600 dark:text-primary-400"
                >
                  #{topic.replace(/\s+/g, '')}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => onEdit(post.dayNumber - 1, post, !post.eveningReflection)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {post.eveningReflection ? 'Edit' : 'Add Reflection'}
        </button>
      </div>
    </motion.div>
  )
})

export default function HabitTracker(): React.ReactElement | null {
  const [mounted, setMounted] = useState(false)
  const [habit, setHabit] = useState<Habit | null>(null)
  const [editingDay, setEditingDay] = useState<{dayIndex: number, isEvening: boolean} | null>(null)
  const [studyHours, setStudyHours] = useState<number>(0)
  const [studyNotes, setStudyNotes] = useState<string>('')
  const [studyTopics, setStudyTopics] = useState<string>('')
  const [studyMood, setStudyMood] = useState<'great' | 'good' | 'okay' | 'tired' | null>(null)
  const [morningPlan, setMorningPlan] = useState<string>('')
  const [eveningReflection, setEveningReflection] = useState<string>('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])
  const [viewingPost, setViewingPost] = useState<{
    dayIndex: number
    post: StudyPost
  } | null>(null)
  const [timelineView, setTimelineView] = useState<TimelineView>('home')
  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('habit')
    let habitData: Habit | null = null

    if (saved) {
      habitData = JSON.parse(saved)
    } else {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)]
      habitData = {
        id: Date.now().toString(),
        name: 'Study Tracker',
        days: Array(100).fill({ 
          completed: false, 
          hours: 0, 
          notes: '', 
          topics: [],
          timestamp: '',
          mood: null,
          morningPlan: '',
          eveningReflection: '',
          isEvening: false
        }),
        streak: 0,
        startDate: new Date().toISOString(),
        color: randomColor.class,
        targetHours: 6,
      }
    }

    if (habitData) {
      const today = new Date()
      const startDate = new Date(habitData.startDate)
      const dayIndex = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dayIndex >= 0 && dayIndex < 100 && !habitData.days[dayIndex].timestamp) {
        habitData.days[dayIndex] = {
          ...habitData.days[dayIndex],
          timestamp: today.toISOString()
        }
      }
    }

    setHabit(habitData)
    setMounted(true)
    fetchQuote()
  }, [])

  useEffect(() => {
    const interval = setInterval(fetchQuote, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchQuote = async () => {
    try {
      const response = await fetch('https://api.quotable.io/random?tags=success,wisdom,inspirational')
      const data = await response.json()
      setQuote({
        text: data.content,
        author: data.author,
        source: 'Quotable'
      })
    } catch (error) {
      console.error('Error fetching quote:', error)
    }
  }

  useEffect(() => {
    if (mounted && habit) {
      localStorage.setItem('habit', JSON.stringify(habit))
    }
  }, [habit, mounted])

  const toggleDayEdit = (dayIndex: number, day: StudyDay, isEvening: boolean): void => {
    setEditingDay({ dayIndex, isEvening })
    setStudyHours(day.hours)
    setStudyNotes(day.notes)
    setStudyTopics(day.topics.join(', '))
    setStudyMood(day.mood)
    setMorningPlan(day.morningPlan || '')
    setEveningReflection(day.eveningReflection || '')
  }

  const saveDay = (): void => {
    if (!editingDay || !habit) return

    const newDays = [...habit.days]
    newDays[editingDay.dayIndex] = {
      ...newDays[editingDay.dayIndex],
      completed: studyHours >= habit.targetHours,
      hours: editingDay.isEvening ? studyHours : 0,
      notes: studyNotes,
      topics: studyTopics.split(',').map(topic => topic.trim()).filter(Boolean),
      timestamp: new Date().toISOString(),
      mood: editingDay.isEvening ? studyMood : null,
      morningPlan: editingDay.isEvening ? newDays[editingDay.dayIndex].morningPlan : morningPlan,
      eveningReflection: editingDay.isEvening ? eveningReflection : newDays[editingDay.dayIndex].eveningReflection,
      isEvening: editingDay.isEvening
    }
    
    let streak = 0
    for (let i = editingDay.dayIndex; i >= 0; i--) {
      if (newDays[i].completed) streak++
      else break
    }
    
    setHabit({ ...habit, days: newDays, streak })
    setEditingDay(null)
    setStudyHours(0)
    setStudyNotes('')
    setStudyTopics('')
    setStudyMood(null)
    setMorningPlan('')
    setEveningReflection('')
  }

  const calculateProgress = useCallback((days: StudyDay[]): number => {
    const completed = days.filter(day => day.completed).length
    return (completed / days.length) * 100
  }, [])

  const getColorHex = (colorClass: string): string => {
    const color = COLORS.find(c => c.class === colorClass)
    return color ? color.hex : '#E5E7EB'
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAllStudyPosts = useCallback((): StudyPost[] => {
    if (!habit) return []
    
    return habit.days
      .map((day, index) => ({
        ...day,
        habitId: habit.id,
        habitName: habit.name,
        dayNumber: index + 1,
        color: habit.color
      }))
      .filter(day => day.hours > 0)
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
  }, [habit])

  const startNewPost = () => {
    if (!habit) return
    
    const nextEmptyDayIndex = habit.days.findIndex(day => !day.hours)
    if (nextEmptyDayIndex !== -1) {
      toggleDayEdit(nextEmptyDayIndex, habit.days[nextEmptyDayIndex], false)
    }
  }

  const getWeeklyStats = useMemo((): number[] => {
    const stats = new Array(7).fill(0)
    if (!habit) return stats

    habit.days.forEach(day => {
      if (day.timestamp) {
        const date = new Date(day.timestamp)
        const dayOfWeek = date.getDay()
        stats[dayOfWeek] += day.hours
      }
    })
    return stats
  }, [habit?.days])

  const getMonthlyStreak = () => {
    if (!habit) return []

    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    return habit.days
      .filter(day => day.timestamp && new Date(day.timestamp) >= thirtyDaysAgo)
      .map(day => ({
        date: new Date(day.timestamp),
        hours: day.hours,
        completed: day.completed
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  if (!mounted || !habit) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex justify-center">
      {/* Main Container */}
      <div className="relative z-10 min-h-screen w-full max-w-2xl flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-gray-800/95 border-b dark:border-gray-700 backdrop-blur-lg shadow-sm">
          <nav className="w-full px-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                  {selectedAvatar}
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Study Tracker</h1>
              </div>
              <button
                onClick={() => startNewPost()}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Plan Today
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b dark:border-gray-700">
              {['home', 'feed', 'streak'].map((view) => (
                <button
                  key={view}
                  onClick={() => setTimelineView(view as TimelineView)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                    timelineView === view
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                  {timelineView === view && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                      layoutId="activeTab"
                    />
                  )}
                </button>
              ))}
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full">
          <div className="w-full px-4 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={timelineView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {timelineView === 'home' && (
                  <div className="space-y-4">
                    {/* Today's Card */}
                    <TodayCard habit={habit} quote={quote} />

                    {/* Latest Activity */}
                    <div className="space-y-4">
                      {getAllStudyPosts().slice(0, 5).map((post, index) => (
                        <StudyPost
                          key={post.timestamp}
                          post={post}
                          avatar={selectedAvatar}
                          onEdit={toggleDayEdit}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {timelineView === 'feed' && (
                  <div className="divide-y dark:divide-gray-700">
                    {getAllStudyPosts().map((post, index) => (
                      <StudyPost
                        key={post.timestamp}
                        post={post}
                        avatar={selectedAvatar}
                        onEdit={toggleDayEdit}
                      />
                    ))}
                  </div>
                )}

                {timelineView === 'streak' && (
                  <div className="p-4 space-y-4">
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-sm border dark:border-gray-700 p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Stats</h3>
                      <div className="h-32 sm:h-40">
                        <div className="h-full flex items-end gap-1">
                          {getWeeklyStats.map((hours: number, i: number) => {
                            const maxHours = Math.max(...getWeeklyStats)
                            const height = hours ? (hours / maxHours) * 100 : 0
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t-md relative" style={{ height: `${height}%` }}>
                                  <div
                                    className="absolute inset-0 bg-primary-500 rounded-t-md"
                                    style={{
                                      opacity: height ? 0.2 + (height / 100) * 0.8 : 0
                                    }}
                                  />
                                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400">
                                    {hours.toFixed(1)}h
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-sm border dark:border-gray-700 p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly View</h3>
                      <div className="grid grid-cols-7 gap-1">
                        {getMonthlyStreak().slice(0, 28).map((day, i) => (
                          <div
                            key={i}
                            className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                              day.completed
                                ? 'bg-primary-500 text-white'
                                : day.hours > 0
                                ? 'bg-primary-200 text-primary-700'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                            }`}
                          >
                            {day.hours > 0 ? day.hours : ''}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-sm border dark:border-gray-700 p-3 sm:p-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">100 Days Progress</h3>
                      <div className="grid grid-cols-10 gap-1">
                        {habit.days.map((day, index) => (
                          <div
                            key={index}
                            className={`aspect-square rounded-sm ${
                              day.completed
                                ? 'bg-primary-500'
                                : day.hours > 0
                                ? 'bg-primary-200'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          >
                            <span className="sr-only">Day {index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Fixed Bottom Action Button */}
        <motion.div 
          className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 border-t dark:border-gray-700 backdrop-blur-lg p-3 sm:p-4 shadow-lg"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="w-full max-w-2xl mx-auto px-4">
            <motion.button
              onClick={() => {
                const today = habit.days.findIndex(day => day.morningPlan && !day.eveningReflection)
                if (today !== -1) {
                  toggleDayEdit(today, habit.days[today], true)
                }
              }}
              className="w-full bg-primary-600 text-white px-4 py-3 rounded-full hover:bg-primary-700 transition-colors text-xs sm:text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={ANIMATIONS.spring}
            >
              Add Evening Reflection
            </motion.button>
          </div>
        </motion.div>

        {/* Study Input Modal */}
        <AnimatePresence>
          {editingDay && (
            <motion.div 
              className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 sm:p-4 z-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={ANIMATIONS.spring}
                className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-xl w-full max-w-md mx-4"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingDay.isEvening ? 'Evening Reflection' : 'Morning Plan'} - Day {editingDay.dayIndex + 1}
                  </h3>
                  <button
                    onClick={() => setEditingDay(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {!editingDay.isEvening ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        What's your plan for today?
                      </label>
                      <textarea
                        value={morningPlan}
                        onChange={(e) => setMorningPlan(e.target.value)}
                        placeholder="List your study goals and objectives for today..."
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        rows={4}
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Hours Studied
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={studyHours}
                          onChange={(e) => setStudyHours(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Topics Covered
                        </label>
                        <input
                          type="text"
                          value={studyTopics}
                          onChange={(e) => setStudyTopics(e.target.value)}
                          placeholder="e.g. Math, Physics, Programming (comma separated)"
                          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          How do you feel?
                        </label>
                        <div className="flex gap-4">
                          {(Object.entries(MOODS) as [keyof typeof MOODS, string][]).map(([mood, emoji]) => (
                            <button
                              key={mood}
                              onClick={() => setStudyMood(mood)}
                              className={`text-2xl p-2 rounded-full transition-transform ${
                                studyMood === mood ? 'scale-125 bg-gray-100 dark:bg-gray-700' : ''
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Evening Reflection
                        </label>
                        <textarea
                          value={eveningReflection}
                          onChange={(e) => setEveningReflection(e.target.value)}
                          placeholder="Reflect on your study session. What went well? What could be improved?"
                          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Additional Notes
                        </label>
                        <textarea
                          value={studyNotes}
                          onChange={(e) => setStudyNotes(e.target.value)}
                          placeholder="Any additional notes or key learnings..."
                          className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingDay(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveDay}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 