'use client'

import { useState, useEffect } from 'react'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: () => void
  selectedDate?: Date
  existingEvent?: any
}

export default function EventModal({ isOpen, onClose, onEventCreated, selectedDate, existingEvent }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (existingEvent) {
        setTitle(existingEvent.title || '')
        setDescription(existingEvent.description || '')
        setLocation(existingEvent.location || '')
        
        const start = new Date(existingEvent.start_time)
        const end = new Date(existingEvent.end_time)
        
        setStartDate(start.toISOString().split('T')[0])
        setStartTime(start.toTimeString().slice(0, 5))
        setEndTime(end.toTimeString().slice(0, 5))
      } else if (selectedDate) {
        setTitle('')
        setDescription('')
        setLocation('')
        setStartDate(selectedDate.toISOString().split('T')[0])
        setStartTime('09:00')
        setEndTime('10:00')
      }
    }
  }, [existingEvent, selectedDate, isOpen])

  const handleSubmit = async () => {
    if (!title.trim()) return
    
    setError('')
    setIsLoading(true)

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`)
      const endDateTime = new Date(`${startDate}T${endTime}`)

      if (endDateTime <= startDateTime) {
        setError('End time must be after start time')
        setIsLoading(false)
        return
      }

      const url = existingEvent ? `/api/events/${existingEvent.id}` : '/api/events'
      const method = existingEvent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          location,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      })

      if (response.ok) {
        if (onEventCreated) onEventCreated()
        handleClose()
      } else {
        setError('Failed to save event')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingEvent) return
    if (!confirm('Delete this event?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${existingEvent.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        if (onEventCreated) onEventCreated()
        handleClose()
      } else {
        setError('Failed to delete event')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setLocation('')
    setStartDate('')
    setStartTime('')
    setEndTime('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  const canSave = title.trim().length > 0 && !isLoading

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-t-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* iOS-style Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
          <button
            onClick={handleClose}
            className="text-blue-600 font-semibold text-base min-w-[60px] min-h-[44px] flex items-center justify-start"
          >
            Cancel
          </button>
          <h2 className="text-base font-semibold text-gray-900">
            {existingEvent ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={handleSubmit}
            disabled={!canSave}
            className={`font-semibold text-base min-w-[60px] min-h-[44px] flex items-center justify-end ${
              canSave ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {isLoading ? 'Saving...' : 'Done'}
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-lg border-0 border-b border-gray-200 focus:outline-none focus:border-blue-500"
              placeholder="Event Title"
            />
          </div>

          {/* Date */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
            />
          </div>

          {/* Time Range */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
              placeholder="Add location"
            />
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
              placeholder="Add notes"
              rows={4}
            />
          </div>

          {/* Delete Button */}
          {existingEvent && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold active:bg-red-700 disabled:opacity-50 min-h-[48px]"
            >
              Delete Event
            </button>
          )}
        </div>

        {/* Safe area spacing for iPhone */}
        <div className="h-8" />
      </div>
    </div>
  )
}
