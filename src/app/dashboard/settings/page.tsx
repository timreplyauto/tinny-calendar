'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isBiometricAvailable, registerBiometric, isBiometricEnabled, disableBiometric } from '@/lib/biometric'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setUsername(data.username || '')
      }
    }

    const checkBiometric = async () => {
      const available = await isBiometricAvailable()
      const enabled = isBiometricEnabled()
      setBiometricAvailable(available)
      setBiometricEnabled(enabled)
    }

    fetchProfile()
    checkBiometric()
  }, [router, supabase])

  const handleEnableBiometric = async () => {
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const success = await registerBiometric(user.id, user.email || '')
      
      if (success) {
        setBiometricEnabled(true)
        setMessage('Face ID enabled successfully! 🎉')
      } else {
        setError('Failed to enable Face ID')
      }
    } catch (err) {
      setError('Error enabling Face ID')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisableBiometric = () => {
    disableBiometric()
    setBiometricEnabled(false)
    setMessage('Face ID disabled')
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (username && !/^[a-z0-9_]{3,30}$/.test(username)) {
        setError('Username must be 3-30 characters (lowercase letters, numbers, underscore)')
        setIsLoading(false)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username.toLowerCase(),
        })
        .eq('id', user.id)

      if (error) {
        setError(error.message)
      } else {
        setMessage('Profile updated successfully!')
      }
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Password changed successfully!')
        setNewPassword('')
      }
    } catch (err) {
      setError('Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      return
    }

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      disableBiometric()
      await supabase.from('profiles').delete().eq('id', user.id)
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      setError('Failed to delete account')
      setIsLoading(false)
    }
  }

  const handleConnectGoogle = () => {
    setMessage('Google Calendar integration coming soon!')
  }

  const handleConnectApple = () => {
    setMessage('Apple Calendar integration coming soon!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">TINNY</h1>
          <a href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Calendar
          </a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Settings</h2>

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

        {/* Biometric Authentication Section */}
        {biometricAvailable && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Face ID / Touch ID</h3>
            <p className="text-sm text-gray-600 mb-4">
              Use biometric authentication for quick and secure access
            </p>

            {biometricEnabled ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Face ID Enabled</p>
                    <p className="text-sm text-gray-600">Quick login is active</p>
                  </div>
                </div>
                <button
                  onClick={handleDisableBiometric}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Disable
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnableBiometric}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                <span>{isLoading ? 'Enabling...' : 'Enable Face ID / Touch ID'}</span>
              </button>
            )}
          </div>
        )}

        {/* Rest of settings sections... */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="johndoe"
              />
              <p className="text-xs text-gray-500 mt-1">
                3-30 characters, lowercase letters, numbers, and underscores only
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Calendar Integration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Sync your events with Google Calendar and Apple Calendar
          </p>

          <div className="space-y-3">
            <button
              onClick={handleConnectGoogle}
              className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Google Calendar</p>
                  <p className="text-xs text-gray-500">Two-way sync with Google</p>
                </div>
              </div>
              <span className="text-blue-600 font-medium">Connect</span>
            </button>

            <button
              onClick={handleConnectApple}
              className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-2xl">🍎</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Apple Calendar</p>
                  <p className="text-xs text-gray-500">Sync with iCloud Calendar</p>
                </div>
              </div>
              <span className="text-blue-600 font-medium">Connect</span>
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            💡 Calendar integration is coming soon!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
          <h3 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h3>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
