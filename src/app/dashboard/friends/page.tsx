'use client'

import { useEffect, useState } from 'react'
import UserMenu from '@/components/UserMenu'

interface Friend {
  id: string
  friend_id: string
  status: string
  profiles: {
    id: string
    email: string
    full_name: string
    username: string
  }
}

interface FriendRequest {
  id: string
  user_id: string
  status: string
  profiles: {
    id: string
    email: string
    full_name: string
    username: string
  }
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<Friend[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    fetchFriends()
    fetchPendingRequests()
    fetchSentRequests()
  }, [])

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

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/friends/requests')
      const data = await response.json()
      if (data.success) {
        setPendingRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  const fetchSentRequests = async () => {
    try {
      const response = await fetch('/api/friends/sent')
      const data = await response.json()
      if (data.success) {
        setSentRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error)
    }
  }

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchValue })
      })

      const data = await response.json()

      if (data.success) {
        setSearchValue('')
        setShowAddForm(false)
        fetchSentRequests()
        alert('Friend request sent!')
      } else {
        if (data.error === 'User not found' && isEmail(searchValue)) {
          const inviteConfirm = confirm(`User not found. Would you like to send them an invite to join TINNY?`)
          if (inviteConfirm) {
            handleSendInvite()
          }
        } else {
          alert(data.error || 'Failed to send request')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error sending request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendInvite = async () => {
    try {
      const response = await fetch('/api/friends/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: isEmail(searchValue) ? searchValue : null,
          phone: isPhoneNumber(searchValue) ? searchValue : null
        })
      })

      const data = await response.json()

      if (data.success) {
        setInviteLink(data.inviteLink)
        setShowInviteModal(true)
        setSearchValue('')
        setShowAddForm(false)
      } else {
        alert('Failed to create invite')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating invite')
    }
  }

  const isEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const isPhoneNumber = (value: string) => {
    return /^\+?[\d\s-()]+$/.test(value) && value.replace(/\D/g, '').length >= 10
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    alert('Invite link copied to clipboard!')
  }

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })

      const data = await response.json()

      if (data.success) {
        fetchFriends()
        fetchPendingRequests()
        alert('Friend request accepted!')
      } else {
        alert('Failed to accept request')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error accepting request')
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const response = await fetch('/api/friends/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })

      const data = await response.json()

      if (data.success) {
        fetchPendingRequests()
        alert('Friend request declined')
      } else {
        alert('Failed to decline request')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error declining request')
    }
  }

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return

    try {
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId })
      })

      const data = await response.json()

      if (data.success) {
        fetchFriends()
        alert('Friend removed')
      } else {
        alert('Failed to remove friend')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error removing friend')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">TINNY</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + Add Friend
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Navigation</h2>
              <nav className="space-y-2">
                <a href="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Calendar
                </a>
                <a href="/dashboard/friends" className="block px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">
                  Friends
                </a>
                <a href="/dashboard/groups" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Groups
                </a>
                <a href="/dashboard/settings" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Settings
                </a>
              </nav>
            </div>
          </div>

          {/* Friends Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Add Friend Form */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Add Friend</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Enter email, phone number, or @username
                </p>
                <form onSubmit={handleSendRequest} className="flex gap-4">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="email@example.com, +1234567890, or @username"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isLoading ? 'Sending...' : 'Send Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Friend Requests ({pendingRequests.length})
                </h2>
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.profiles?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{request.profiles?.username || request.profiles?.email}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Sent Requests ({sentRequests.length})
                </h2>
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.profiles?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{request.profiles?.username || request.profiles?.email}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                My Friends ({friends.length})
              </h2>
              {friends.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No friends yet. Add friends to share your calendar!
                </p>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">
                          {friend.profiles?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{friend.profiles?.username || friend.profiles?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Link Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite Link Created!</h2>
            <p className="text-gray-600 mb-4">
              Share this link with your friend to invite them to TINNY:
            </p>
            <div className="bg-gray-100 p-3 rounded-lg mb-4 break-all">
              <code className="text-sm">{inviteLink}</code>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyInviteLink}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
