'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [canInvite, setCanInvite] = useState(false)
  const [invitePhone, setInvitePhone] = useState('')
  const [friends, setFriends] = useState<any[]>([])
  const [sentRequests, setSentRequests] = useState<any[]>([])
  const [receivedRequests, setReceivedRequests] = useState<any[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const response = await fetch('/api/friends')
    const data = await response.json()
    if (data.success) {
      setFriends(data.friends || [])
      setSentRequests(data.sentRequests || [])
      setReceivedRequests(data.receivedRequests || [])
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSearchResult(null)
    setCanInvite(false)
    setInvitePhone('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/friends/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })

      const data = await response.json()

      if (response.ok) {
        setSearchResult(data.user)
        if (data.alreadyFriends) {
          setMessage('Already friends with this user')
        } else if (data.pendingRequest) {
          setMessage('Friend request pending')
        }
      } else {
        if (data.canInvite) {
          setCanInvite(true)
          setInvitePhone(data.phone)
          setMessage('User not found. Would you like to invite them?')
        } else {
          setError(data.error || 'User not found')
        }
      }
    } catch (err) {
      setError('Failed to search')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendInvite = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/friends/invite-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: invitePhone })
      })

      const data = await response.json()

      if (response.ok) {
        // Open SMS app with pre-filled message
        if (data.smsLink) {
          window.location.href = data.smsLink
        }
        setMessage('Opening SMS to send invite...')
      } else {
        setError('Failed to create invite')
      }
    } catch (err) {
      setError('Failed to send invite')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendRequest = async () => {
    if (!searchResult) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: searchResult.id })
      })

      if (response.ok) {
        setMessage('Friend request sent!')
        setSearchResult(null)
        setSearchQuery('')
        fetchFriends()
      } else {
        setError('Failed to send request')
      }
    } catch (err) {
      setError('Failed to send request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
      })

      if (response.ok) {
        setMessage(`Friend request ${action}ed!`)
        fetchFriends()
      } else {
        setError('Failed to respond to request')
      }
    } catch (err) {
      setError('Failed to respond')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId })
      })

      if (response.ok) {
        setMessage('Friend removed')
        fetchFriends()
      } else {
        setError('Failed to remove friend')
      }
    } catch (err) {
      setError('Failed to remove friend')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">TINNY</h1>
          <a href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Calendar
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Friends</h2>

        {message && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Friend</h3>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by username, email, or phone number
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="@username, email, or (555) 123-4567"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: You can search by phone number to invite non-users!
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchResult && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {searchResult.full_name || searchResult.username || 'User'}
                  </p>
                  <p className="text-sm text-gray-600">@{searchResult.username}</p>
                  {searchResult.phone_number && (
                    <p className="text-xs text-gray-500">{searchResult.phone_number}</p>
                  )}
                </div>
                <button
                  onClick={handleSendRequest}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Friend
                </button>
              </div>
            </div>
          )}

          {canInvite && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                📱 This phone number isn't registered yet. Send them an invite to join TINNY!
              </p>
              <button
                onClick={handleSendInvite}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 font-semibold"
              >
                📨 Send SMS Invite
              </button>
            </div>
          )}
        </div>

        {receivedRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Friend Requests</h3>
            <div className="space-y-3">
              {receivedRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.profiles?.full_name || request.profiles?.username || 'User'}
                    </p>
                    <p className="text-sm text-gray-600">@{request.profiles?.username}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'accept')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'decline')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {friends.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">My Friends ({friends.length})</h3>
            <div className="space-y-2">
              {friends.map((friend) => (
                <div key={friend.friend_id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {friend.profiles?.full_name || friend.profiles?.username || 'User'}
                    </p>
                    <p className="text-sm text-gray-600">@{friend.profiles?.username}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend.friend_id)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
