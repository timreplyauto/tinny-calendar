'use client'

import { useEffect, useState } from 'react'
import UserMenu from '@/components/UserMenu'

interface Group {
  id: string
  name: string
  description: string
  created_by: string
  created_at: string
}

interface GroupMember {
  user_id: string
  role: string
  profiles: {
    full_name: string
    email: string
    username: string
  }
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [friends, setFriends] = useState<any[]>([])
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchGroups()
    fetchFriends()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup.id)
    }
  }, [selectedGroup])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups')
      const data = await response.json()
      if (data.success) {
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
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

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`)
      const data = await response.json()
      if (data.success) {
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, description: groupDescription })
      })

      const data = await response.json()

      if (data.success) {
        setGroupName('')
        setGroupDescription('')
        setShowCreateModal(false)
        fetchGroups()
        alert('Group created successfully!')
      } else {
        alert(data.error || 'Failed to create group')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating group')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMembers = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroup) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/groups/${selectedGroup.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedFriends })
      })

      const data = await response.json()

      if (data.success) {
        setSelectedFriends([])
        setShowInviteModal(false)
        fetchGroupMembers(selectedGroup.id)
        alert('Members invited successfully!')
      } else {
        alert(data.error || 'Failed to invite members')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error inviting members')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to leave this group?')) return

    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setSelectedGroup(null)
        fetchGroups()
        alert('Left group successfully')
      } else {
        alert(data.error || 'Failed to leave group')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error leaving group')
    }
  }

  const handleRemoveMember = async (groupId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const response = await fetch(`/api/groups/${groupId}/members/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchGroupMembers(groupId)
        alert('Member removed successfully')
      } else {
        alert(data.error || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error removing member')
    }
  }

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">TINNY</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + Create Group
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
                <a href="/dashboard/friends" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Friends
                </a>
                <a href="/dashboard/groups" className="block px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">
                  Groups
                </a>
                <a href="/dashboard/settings" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  Settings
                </a>
              </nav>
            </div>
          </div>

          {/* Groups Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Groups List */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">My Groups ({groups.length})</h2>
                {groups.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No groups yet. Create a group to share calendars!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {groups.map(group => (
                      <div
                        key={group.id}
                        onClick={() => setSelectedGroup(group)}
                        className={`p-4 border rounded-lg cursor-pointer transition ${
                          selectedGroup?.id === group.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <h3 className="font-semibold text-gray-900">{group.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{group.description || 'No description'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Group Details */}
              <div className="bg-white rounded-lg shadow p-6">
                {selectedGroup ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">{selectedGroup.name}</h2>
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        + Invite
                      </button>
                    </div>
                    <p className="text-gray-600 mb-4">{selectedGroup.description || 'No description'}</p>

                    <h3 className="font-semibold text-gray-900 mb-2">Members ({members.length})</h3>
                    <div className="space-y-2 mb-4">
                      {members.map(member => (
                        <div key={member.user_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{member.profiles?.full_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">
                              @{member.profiles?.username || member.profiles?.email}
                              {member.role === 'admin' && <span className="ml-2 text-blue-600">(Admin)</span>}
                            </p>
                          </div>
                          {member.role !== 'admin' && (
                            <button
                              onClick={() => handleRemoveMember(selectedGroup.id, member.user_id)}
                              className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleLeaveGroup(selectedGroup.id)}
                      className="w-full px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                    >
                      Leave Group
                    </button>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Select a group to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name *</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Family Calendar"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Share events with family members"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite Members</h2>
            <form onSubmit={handleInviteMembers} className="space-y-4">
              <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                {friends.length === 0 ? (
                  <p className="text-sm text-gray-500">No friends to invite. Add friends first!</p>
                ) : (
                  <div className="space-y-2">
                    {friends.map(friend => (
                      <label
                        key={friend.friend_id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFriends.includes(friend.friend_id)}
                          onChange={() => toggleFriendSelection(friend.friend_id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {friend.profiles?.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            @{friend.profiles?.username || friend.profiles?.email}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false)
                    setSelectedFriends([])
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || selectedFriends.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isLoading ? 'Inviting...' : `Invite ${selectedFriends.length}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
