'use client'

import { useEffect, useState } from 'react'
import EventModal from '@/components/calendar/EventModal'
import SmartAIModal from '@/components/SmartAIModal'

interface Event {
  id: string
  title: string
  start_time: string
  end_time: string
  description: string | null
  location: string | null
  user_id: string
  participation_status?: string
  is_organizer?: boolean
}

interface Friend {
  friend_id: string
  profiles: {
    full_name: string
    username: string
  }
}

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSmartAIOpen, setIsSmartAIOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [showSidebar, setShowSidebar] = useState(false)
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchEvents()
    fetchFriends()
  }, [selectedFriendId])

  const fetchEvents = async () => {
    try {
      const url = selectedFriendId 
        ? `/api/events?friendId=${selectedFriendId}`
        : '/api/events'
      
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends')
      const data = await response.json()
      if (data.success) {
        setFriends(data.friends || [])
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }

  const handleRSVP = async (eventId: string, status: 'accepted' | 'declined') => {
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchEvents()
      }
    } catch (error) {
      console.error('RSVP error:', error)
    }
  }

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December']
    return months[month]
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      const localDay = eventDate.getDate()
      const localMonth = eventDate.getMonth()
      const localYear = eventDate.getFullYear()
      
      return localDay === day && localMonth === currentMonth && localYear === currentYear
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear()
  }

  const handleEventCreated = () => {
    setTimeout(() => {
      fetchEvents()
    }, 500)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleDayClick = (day: number) => {
    if (day > 0 && !selectedFriendId) {
      const date = new Date(currentYear, currentMonth, day, 9, 0)
      setSelectedDate(date)
      setSelectedEvent(null)
      setIsModalOpen(true)
    }
  }

  const handleNewEventClick = () => {
    setSelectedDate(new Date())
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
    setSelectedDate(undefined)
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
  const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7

  return (
    <div className="min-h-screen bg-white pb-safe">
      {/* iOS-style Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors -ml-2"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsSmartAIOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold text-sm active:bg-blue-700 transition-colors"
              >
                ✨ AI
              </button>
              <button 
                onClick={handleNewEventClick}
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl active:bg-blue-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Month/Year and Navigation */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {getMonthName(currentMonth)}
            </h1>
            <div className="flex items-center space-x-2">
              <button 
                onClick={goToToday} 
                className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700 active:bg-gray-200"
              >
                Today
              </button>
              <button 
                onClick={goToPreviousMonth} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={goToNextMonth} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">{currentYear}</p>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setShowSidebar(false)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-2 mb-6">
                <a href="/dashboard" className="block px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium">
                  📅 Calendar
                </a>
                <a href="/dashboard/friends" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl">
                  👥 Friends
                </a>
                <a href="/dashboard/groups" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl">
                  👪 Groups
                </a>
                <a href="/dashboard/settings" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl">
                  ⚙️ Settings
                </a>
              </nav>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-4">Calendars</h3>
                <button
                  onClick={() => {
                    setSelectedFriendId(null)
                    setShowSidebar(false)
                    fetchEvents()
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl mb-1 ${
                    !selectedFriendId ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'
                  }`}
                >
                  My Calendar
                </button>
                {friends.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto">
                    {friends.map(friend => (
                      <button
                        key={friend.friend_id}
                        onClick={() => {
                          setSelectedFriendId(friend.friend_id)
                          setShowSidebar(false)
                          fetchEvents()
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl mb-1 text-sm ${
                          selectedFriendId === friend.friend_id ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {friend.profiles?.full_name || friend.profiles?.username || 'Unknown'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="px-2 pb-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days - BIGGER CELLS */}
            {Array.from({ length: totalCells }, (_, i) => {
              const day = i - firstDay + 1;
              const isValidDay = day > 0 && day <= daysInMonth
              const dayEvents = isValidDay ? getEventsForDay(day) : []
              const isTodayDate = isValidDay && isToday(day)
              
              return (
                <div
                  key={i}
                  onClick={() => isValidDay && handleDayClick(day)}
                  className={`min-h-[90px] p-1.5 ${
                    !isValidDay ? 'bg-gray-50' : ''
                  }`}
                >
                  {isValidDay && (
                    <div className={`h-full flex flex-col ${selectedFriendId ? '' : 'cursor-pointer active:bg-gray-50'} rounded-lg`}>
                      {/* Day number */}
                      <div className={`text-center mb-1 ${
                        isTodayDate 
                          ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-sm font-bold' 
                          : 'text-base font-medium text-gray-900'
                      }`}>
                        {day}
                      </div>
                      
                      {/* Events */}
                      <div className="flex-1 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => {
                          const eventTime = new Date(event.start_time)
                          const isPending = event.participation_status === 'pending'
                          return (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEventClick(event)
                              }}
                              className={`w-full px-1.5 py-1 rounded text-xs font-medium truncate ${
                                isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-500 text-white'
                              }`}
                            >
                              {eventTime.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })} {event.title}
                            </div>
                          )
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 text-center font-medium">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Today's Events List */}
        {(() => {
          const today = new Date()
          const todayEvents = events.filter(event => {
            const eventDate = new Date(event.start_time)
            return eventDate.getDate() === today.getDate() &&
                   eventDate.getMonth() === today.getMonth() &&
                   eventDate.getFullYear() === today.getFullYear()
          })

          if (todayEvents.length > 0) {
            return (
              <div className="mt-6 px-2 pb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 px-2">Today's Events</h2>
                <div className="space-y-2">
                  {todayEvents.map(event => {
                    const eventTime = new Date(event.start_time)
                    const isPending = event.participation_status === 'pending'
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="bg-white border border-gray-200 rounded-2xl p-4 active:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${isPending ? 'bg-yellow-400' : 'bg-blue-500'}`} />
                              <p className="font-semibold text-gray-900">{event.title}</p>
                            </div>
                            <p className="text-sm text-gray-500">
                              {eventTime.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                            {event.location && (
                              <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                            )}
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        {isPending && !selectedFriendId && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRSVP(event.id, 'accepted')
                              }}
                              className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold active:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRSVP(event.id, 'declined')
                              }}
                              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold active:bg-red-700"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          }
          return null
        })()}
      </div>

      <EventModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onEventCreated={handleEventCreated}
        selectedDate={selectedDate}
        existingEvent={selectedEvent}
      />

      <SmartAIModal 
        isOpen={isSmartAIOpen}
        onClose={() => setIsSmartAIOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
}
