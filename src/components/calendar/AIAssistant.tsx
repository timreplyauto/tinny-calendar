'use client'

import { useState } from 'react'

interface AIAssistantProps {
  onEventCreated?: () => void
}

interface TimeSlot {
  date: string
  time: string
  description: string
}

export default function AIAssistant({ onEventCreated }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [suggestedTimes, setSuggestedTimes] = useState<TimeSlot[]>([])
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [duration, setDuration] = useState(60)

  const parseTimeSlots = (aiResponse: string): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const lines = aiResponse.split('\n')
    
    lines.forEach(line => {
      try {
        let match = line.match(/\*\*([A-Za-z]+\s+\d{1,2},\s+\d{4})\*\*.*?(\d{1,2}:\d{2}\s*(?:AM|PM)?.*?to.*?\d{1,2}:\d{2}\s*(?:AM|PM)?)/i)
        if (match && match[1] && match[2]) {
          slots.push({
            date: match[1],
            time: match[2].trim(),
            description: line.trim()
          })
          return
        }

        match = line.match(/\d+\.\s+\*\*([A-Za-z]+\s+\d{1,2},\s+\d{4})\*\*:?\s*(.+)/i)
        if (match && match[1] && match[2]) {
          slots.push({
            date: match[1],
            time: match[2].trim(),
            description: line.trim()
          })
          return
        }

        match = line.match(/([A-Za-z]+\s+\d{1,2},\s+\d{4})/i)
        if (match && match[1] && (line.includes('PM') || line.includes('AM') || line.includes('free'))) {
          const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(?:AM|PM).*)/i)
          slots.push({
            date: match[1],
            time: timeMatch && timeMatch[1] ? timeMatch[1].trim() : 'All day',
            description: line.trim()
          })
        }
      } catch (err) {
        console.error('Error parsing line:', line, err)
      }
    })
    
    return slots
  }

  const handleCreateEvent = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    setResponse('')
    setSuggestedTimes([])

    try {
      // Check if this is a scheduling query (contains words like "find", "when", "available", "free")
      const isSchedulingQuery = /\b(find|when|available|free|schedule|meet|time)\b/i.test(prompt)

      if (isSchedulingQuery) {
        // Use Smart AI for scheduling queries
        const res = await fetch('/api/ai/smart-schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: prompt })
        })

        const data = await res.json()

        if (data.success) {
          setResponse(data.response)
          const slots = parseTimeSlots(data.response)
          setSuggestedTimes(slots)
        } else {
          setResponse('Sorry, I couldn\'t process that request.')
        }
      } else {
        // Use regular AI for event creation
        const response = await fetch('/api/ai/create-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        })

        const data = await response.json()

        if (data.success && data.event) {
          setResponse(`Event created: ${data.event.title}`)
          setPrompt('')
          if (onEventCreated) {
            setTimeout(() => onEventCreated(), 500)
          }
        } else {
          setResponse(data.error || 'Failed to create event')
        }
      }
    } catch (error) {
      console.error('AI Assistant Error:', error)
      setResponse('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setShowBookingForm(true)
    if (prompt.toLowerCase().includes('meeting')) {
      setEventTitle('Meeting')
    } else if (prompt.toLowerCase().includes('lunch')) {
      setEventTitle('Lunch')
    } else if (prompt.toLowerCase().includes('dinner')) {
      setEventTitle('Dinner')
    } else {
      setEventTitle('Event')
    }
  }

  const parseDateTime = (dateStr: string, timeStr: string): Date => {
    try {
      const date = new Date(dateStr)
      let hour = 14
      let minute = 0
      
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
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(14, 0, 0, 0)
      return tomorrow
    }
  }

  const handleBookEvent = async () => {
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
          description: `Scheduled via AI: ${prompt}`,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          location: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          created_by_ai: true,
          participants: []
        })
      })

      if (response.ok) {
        setResponse('✅ Event created successfully!')
        setShowBookingForm(false)
        setSelectedSlot(null)
        setEventTitle('')
        setSuggestedTimes([])
        setPrompt('')
        if (onEventCreated) onEventCreated()
      } else {
        setResponse('Failed to create event')
      }
    } catch (error) {
      console.error('Book event error:', error)
      setResponse('Error creating event')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-2">🤖</span>
        <h2 className="font-semibold text-gray-900">AI Assistant</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        Create events naturally or find available times!
      </p>

      {!showBookingForm ? (
        <>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
            placeholder="Try: 'Dinner with Sarah next Friday at 7pm' or 'Find time when Bob and I are free'"
            rows={3}
            disabled={isLoading}
          />

          <button
            onClick={handleCreateEvent}
            disabled={isLoading || !prompt.trim()}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium mb-3"
          >
            {isLoading ? '✨ Thinking...' : '✨ Ask AI'}
          </button>

          {response && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-1">AI Response:</p>
              <p className="text-xs text-gray-800 whitespace-pre-wrap max-h-40 overflow-y-auto">{response}</p>
            </div>
          )}

          {suggestedTimes.length > 0 && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-semibold text-green-900 mb-2">📅 Available Times:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {suggestedTimes.map((slot, i) => (
                  <div key={i} className="p-2 bg-white rounded border border-green-200">
                    <p className="text-xs font-medium text-gray-900">{slot.date}</p>
                    <p className="text-xs text-gray-600 mb-1">{slot.time}</p>
                    <button
                      onClick={() => handleBookSlot(slot)}
                      className="w-full px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Book This Time →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 mb-2">📝 Create Event</p>
          
          <div className="mb-2">
            <p className="text-xs text-gray-600 mb-1">Time:</p>
            <p className="text-xs font-medium">{selectedSlot?.date}</p>
            <p className="text-xs text-gray-700">{selectedSlot?.time}</p>
          </div>
          
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Meeting title"
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowBookingForm(false)
                setSelectedSlot(null)
              }}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleBookEvent}
              disabled={isLoading || !eventTitle.trim()}
              className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create ✓'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-700 mb-2">Examples:</p>
        <div className="space-y-1">
          <button
            onClick={() => setPrompt("Lunch with Bob tomorrow at noon")}
            className="block w-full text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded"
          >
            💡 Lunch with Bob tomorrow at noon
          </button>
          <button
            onClick={() => setPrompt("Find time when Test and I are free")}
            className="block w-full text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded"
          >
            💡 Find time when Test and I are free
          </button>
          <button
            onClick={() => setPrompt("Team meeting Monday at 10am")}
            className="block w-full text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded"
          >
            💡 Team meeting Monday at 10am
          </button>
        </div>
      </div>
    </div>
  )
}
