'use client'

import { useState } from 'react'

interface SmartAIModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: () => void
}

interface TimeSlot {
  date: string
  time: string
  description: string
}

export default function SmartAIModal({ isOpen, onClose, onEventCreated }: SmartAIModalProps) {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedTimes, setSuggestedTimes] = useState<TimeSlot[]>([])
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [duration, setDuration] = useState(120)
  const [friends, setFriends] = useState<any[]>([])

  const examples = [
    "Find a time when Bob and I are both free this week",
    "Move my 3pm meeting to tomorrow",
    "When is my family group free this weekend?",
    "Cancel all my events on Thursday",
    "Suggest the best time for a 2-hour meeting with Alice"
  ]

  const parseTimeSlots = (aiResponse: string): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const lines = aiResponse.split('\n')
    
    lines.forEach(line => {
      try {
        // Pattern 1: "**October 28, 2025**, around **4:00 PM to 5:00 PM**"
        let match = line.match(/\*\*([A-Za-z]+\s+\d{1,2},\s+\d{4})\*\*.*?(\d{1,2}:\d{2}\s*(?:AM|PM)?.*?to.*?\d{1,2}:\d{2}\s*(?:AM|PM)?)/i)
        if (match && match[1] && match[2]) {
          slots.push({
            date: match[1],
            time: match[2].trim(),
            description: line.trim()
          })
          return
        }

        // Pattern 2: "1. **October 28, 2025:** All day is free"
        match = line.match(/\d+\.\s+\*\*([A-Za-z]+\s+\d{1,2},\s+\d{4})\*\*:?\s*(.+)/i)
        if (match && match[1] && match[2]) {
          slots.push({
            date: match[1],
            time: match[2].trim(),
            description: line.trim()
          })
          return
        }

        // Pattern 3: Line contains a date in format "October 28, 2025"
        match = line.match(/([A-Za-z]+\s+\d{1,2},\s+\d{4})/i)
        if (match && match[1] && (line.includes('PM') || line.includes('AM') || line.includes('free'))) {
          const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(?:AM|PM).*)/i)
          slots.push({
            date: match[1],
            time: timeMatch && timeMatch[1] ? timeMatch[1].trim() : 'All day',
            description: line.trim()
          })
          return
        }
      } catch (err) {
        console.error('Error parsing line:', line, err)
      }
    })
    
    return slots
  }

  const handleAsk = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setResponse('')
    setSuggestedTimes([])

    try {
      const res = await fetch('/api/ai/smart-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      const data = await res.json()

      if (data.success) {
        setResponse(data.response)
        setFriends(data.friends || [])
        const slots = parseTimeSlots(data.response)
        console.log('Parsed slots:', slots)
        setSuggestedTimes(slots)
      } else {
        setResponse(data.error || 'Sorry, I couldn\'t process that request. Please try again.')
      }
    } catch (error) {
      console.error('Smart AI error:', error)
      setResponse('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setShowBookingForm(true)
    // Pre-fill with a smart title based on the query
    if (query.toLowerCase().includes('meeting')) {
      setEventTitle('Meeting')
    } else if (query.toLowerCase().includes('lunch')) {
      setEventTitle('Lunch')
    } else if (query.toLowerCase().includes('dinner')) {
      setEventTitle('Dinner')
    } else {
      setEventTitle('Event')
    }
  }

  const parseDateTime = (dateStr: string, timeStr: string): Date => {
    try {
      // Parse date like "October 28, 2025"
      const date = new Date(dateStr)
      
      // Default to 2pm if no specific time
      let hour = 14
      let minute = 0
      
      // Parse time like "4:00 PM to 5:00 PM" or "around 4:00 PM"
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
      if (timeMatch) {
        hour = parseInt(timeMatch[1])
        minute = parseInt(timeMatch[2])
        if (timeMatch[3]?.toUpperCase() === 'PM' && hour !== 12) hour += 12
        if (timeMatch[3]?.toUpperCase() === 'AM' && hour === 12) hour = 0
      }
      
      date.setHours(hour, minute, 0, 0)
      return date
    } catch (err) {
      console.error('Error parsing date/time:', dateStr, timeStr, err)
      // Return a default date (tomorrow at 2pm)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(14, 0, 0, 0)
      return tomorrow
    }
  }

  const handleCreateEvent = async () => {
    if (!selectedSlot || !eventTitle.trim()) return

    setIsLoading(true)

    try {
      const startDate = parseDateTime(selectedSlot.date, selectedSlot.time)
      const endDate = new Date(startDate.getTime() + duration * 60 * 1000)

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventTitle,
          description: `Scheduled via Smart AI: ${query}`,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          location: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          created_by_ai: true,
          participants: []
        })
      })

      if (response.ok) {
        alert('Event created successfully! ✅')
        setShowBookingForm(false)
        setSelectedSlot(null)
        setEventTitle('')
        setSuggestedTimes([])
        setResponse('')
        setQuery('')
        if (onEventCreated) onEventCreated()
      } else {
        alert('Failed to create event')
      }
    } catch (error) {
      console.error('Create event error:', error)
      alert('Error creating event')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ✨ Smart AI Assistant
          </h2>
          <button
            onClick={() => {
              onClose()
              setResponse('')
              setQuery('')
              setSuggestedTimes([])
              setShowBookingForm(false)
            }}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Ask me anything about your schedule! I can help you find available times, suggest improvements, and manage your calendar.
        </p>

        {!showBookingForm && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like help with?
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Find a time when Bob and I are both free this week"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Try these examples:</p>
              <div className="space-y-2">
                {examples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(example)}
                    className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                  >
                    💡 {example}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAsk}
              disabled={isLoading || !query.trim()}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isLoading ? 'Thinking...' : 'Ask AI Assistant'}
            </button>
          </>
        )}

        {response && (
          <div className="space-y-4">
            {!showBookingForm && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">AI Response:</h3>
                <div className="text-gray-800 whitespace-pre-wrap text-sm max-h-60 overflow-y-auto">
                  {response}
                </div>
              </div>
            )}

            {suggestedTimes.length > 0 && !showBookingForm && (
              <div className="bg-white border-2 border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">📅</span>
                  Quick Book These Times ({suggestedTimes.length} options)
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {suggestedTimes.map((slot, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition border border-green-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{slot.date}</p>
                        <p className="text-sm text-gray-600">{slot.time}</p>
                      </div>
                      <button
                        onClick={() => handleBookSlot(slot)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition shadow-sm"
                      >
                        Book This Time →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showBookingForm && selectedSlot && (
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">📝 Create Event</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Selected Time:</p>
                    <p className="font-medium text-lg">{selectedSlot.date}</p>
                    <p className="text-sm text-gray-700">{selectedSlot.time}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Meeting with Test"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                      <option value={180}>3 hours</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowBookingForm(false)
                        setSelectedSlot(null)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleCreateEvent}
                      disabled={isLoading || !eventTitle.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Create Event ✓'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
