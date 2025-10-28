'use client'

import { useEffect, useState } from 'react'
import AIAssistant from '@/components/calendar/AIAssistant'
import EventModal from '@/components/calendar/EventModal'
import SmartAIModal from '@/components/SmartAIModal'
import UserMenu from '@/components/UserMenu'

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
        alert(`Event ${status}!`)
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
    if (day > 0) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">TINNY</h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => setIsSmartAIOpen(true)}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition text-sm sm:text-base"
            >
              ✨ AI
            </button>
            <button 
              onClick={handleNewEventClick}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
            >
              + Event
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar - collapsible on mobile */}
          <div className="lg:col-span-1 space-y-4">
            {/* Navigation */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Navigation</h2>
              <nav className="space-y-2">
                <a href="/dashboard" className="block px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm">
                  Calendar
                </a>
                <a href="/dashboard/friends" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">
                  Friends
                </a>
                <a href="/dashboard/groups" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">
                  Groups
                </a>
                <a href="/dashboard/settings" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">
                  Settings
                </a>
              </nav>
            </div>

            {/* View Calendar */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">View Calendar</h2>
              <button
                onClick={() => {
                  setSelectedFriendId(null)
                  fetchEvents()
                }}
                className={`w-full text-left px-3 py-2 rounded-lg mb-2 text-sm ${
                  !selectedFriendId ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'
                }`}
              >
                📅 My Calendar
              </button>
              <div className="border-t border-gray-200 my-2"></div>
              <p className="text-xs text-gray-500 mb-2">Friends' Calendars:</p>
              <div className="max-h-40 overflow-y-auto">
                {friends.length === 0 ? (
                  <p className="text-xs text-gray-400 px-3 py-2">No friends yet</p>
                ) : (
                  friends.map(friend => (
                    <button
                      key={friend.friend_id}
                      onClick={() => {
                        setSelectedFriendId(friend.friend_id)
                        fetchEvents()
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg mb-2 text-sm ${
                        selectedFriendId === friend.friend_id ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'
                      }`}
                    >
                      👤 {friend.profiles?.full_name || friend.profiles?.username || 'Unknown'}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* AI Assistant - hidden on small screens */}
            <div className="hidden lg:block">
              <AIAssistant onEventCreated={handleEventCreated} />
            </div>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-3 sm:p-6">
              {/* Calendar Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {selectedFriendId 
                    ? `${friends.find(f => f.friend_id === selectedFriendId)?.profiles?.full_name}'s Calendar`
                    : `${getMonthName(currentMonth)} ${currentYear}`
                  }
                </h2>
                <div className="flex space-x-2 w-full sm:w-auto">
                  <button onClick={goToToday} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    Today
                  </button>
                  <button onClick={goToPreviousMonth} className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    ←
                  </button>
                  <button onClick={goToNextMonth} className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    →
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading events...</div>
              ) : (
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {Array.from({ length: totalCells }, (_, i) => {
                    const day = i - firstDay + 1;
                    const isValidDay = day > 0 && day <= daysInMonth
                    const dayEvents = isValidDay ? getEventsForDay(day) : []
                    const isTodayDate = isValidDay && isToday(day)
                    
                    return (
                      <div
                        key={i}
                        onClick={() => isValidDay && !selectedFriendId && handleDayClick(day)}
                        className={`min-h-[80px] sm:min-h-[100px] border border-gray-200 rounded-lg p-1 sm:p-2 ${
                          !isValidDay ? 'bg-gray-50 text-gray-400' : 
                          selectedFriendId ? 'hover:bg-gray-50' : 'hover:bg-blue-50 cursor-pointer'
                        } ${isTodayDate ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' : ''}`}
                      >
                        <div className={`text-xs sm:text-sm font-medium mb-1 ${isTodayDate ? 'text-blue-600 font-bold' : ''}`}>
                          {isValidDay ? day : ''}
                        </div>
                        <div className="space-y-1 overflow-y-auto max-h-[60px] sm:max-h-[80px]">
                          {dayEvents.map(event => {
                            const eventTime = new Date(event.start_time)
                            const isPending = event.participation_status === 'pending'
                            return (
                              <div key={event.id} className="space-y-1">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEventClick(event)
                                  }}
                                  className={`text-xs p-1 rounded truncate cursor-pointer ${
                                    isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                  } hover:bg-opacity-80`}
                                  title={`${eventTime.toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })} ${event.title}`}
                                >
                                  <div className="font-medium">
                                    {eventTime.toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  <div className="truncate">
                                    {event.title}
                                    {isPending && ' 🔔'}
                                  </div>
                                </div>
                                {isPending && !selectedFriendId && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleRSVP(event.id, 'accepted')
                                      }}
                                      className="flex-1 text-xs bg-green-600 text-white px-1 py-0.5 rounded hover:bg-green-700"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleRSVP(event.id, 'declined')
                                      }}
                                      className="flex-1 text-xs bg-red-600 text-white px-1 py-0.5 rounded hover:bg-red-700"
                                    >
                                      ✗
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
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
