'use client'

import { useState, useEffect } from 'react'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated: () => void
  selectedDate?: Date
  existingEvent?: any
}

interface Friend {
  id: string
  friend_id: string
  profiles: {
    id: string
    email: string
    full_name: string
  }
}

export default function EventModal({ isOpen, onClose, onEventCreated, selectedDate, existingEvent }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [location, setLocation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchFriends()
      
      if (existingEvent) {
        // Edit mode - convert UTC to local for display
        setIsEditMode(true)
        setTitle(existingEvent.title)
        setDescription(existingEvent.description || '')
        
        // Convert UTC to local datetime-local format
        const startLocal = new Date(existingEvent.start_time)
        const endLocal = new Date(existingEvent.end_time)
        
        setStartDate(formatDateTimeLocal(startLocal))
        setEndDate(formatDateTimeLocal(endLocal))
        setLocation(existingEvent.location || '')
      } else {
        // Create mode
        setIsEditMode(false)
        setTitle('')
        setDescription('')
        setLocation('')
        setSelectedParticipants([])
        
        if (selectedDate) {
          const start = new Date(selectedDate)
          setStartDate(formatDateTimeLocal(start))
          
          const end = new Date(start.getTime() + 60 * 60 * 1000)
          setEndDate(formatDateTimeLocal(end))
        }
      }
    }
  }, [isOpen, selectedDate, existingEvent])

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
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

  const toggleParticipant = (friendId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convert local datetime to UTC ISO string
      const startUTC = new Date(startDate).toISOString()
      const endUTC = new Date(endDate).toISOString()

      const eventData = {
        title,
        description,
        start_time: startUTC,
        end_time: endUTC,
        location,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        created_by_ai: false,
        participants: selectedParticipants
      }

      const url = isEditMode ? `/api/events/${existingEvent.id}` : '/api/events'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      const data = await response.json()

      if (data.success) {
        resetForm()
        onEventCreated()
        onClose()
      } else {
        alert(`Failed to ${isEditMode ? 'update' : 'create'} event`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert(`Error ${isEditMode ? 'updating' : 'creating'} event`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingEvent || !confirm('Are you sure you want to delete this event?')) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${existingEvent.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        resetForm()
        onEventCreated()
        onClose()
      } else {
        alert('Failed to delete event')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting event')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setLocation('')
    setSelectedParticipants([])
    setIsEditMode(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isEditMode ? 'Edit Event' : 'Create New Event'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Team meeting"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Discuss project updates"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Conference Room A"
            />
          </div>

          {/* Invite Friends */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite Friends {selectedParticipants.length > 0 && `(${selectedParticipants.length} selected)`}
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
              {friends.length === 0 ? (
                <p className="text-sm text-gray-500">No friends yet. Add friends to invite them!</p>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <label
                      key={friend.friend_id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(friend.friend_id)}
                        onChange={() => toggleParticipant(friend.friend_id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {friend.profiles?.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">{friend.profiles?.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                resetForm()
                onClose()
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
