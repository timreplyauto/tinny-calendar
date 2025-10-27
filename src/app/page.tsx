export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          TINNY
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Calendar Sharing Made Simple
        </p>
        <div className="space-x-4">
          <a href="/login" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Sign In
          </a>
          <a href="/signup" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  )
}
