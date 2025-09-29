import { useAuth } from '../hooks/useAuth'

export const Dashboard = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Balance Sheet Analyst
        </h1>
        <p className="text-gray-600">
          Please sign in to access your dashboard.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Dashboard
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Welcome back, {user.email}!
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Total Assets</h3>
            <p className="text-2xl font-bold text-blue-600">$0</p>
          </div>

          <div className="bg-red-100 p-4 rounded-lg">
            <h3 className="font-semibold text-red-900">Total Liabilities</h3>
            <p className="text-2xl font-bold text-red-600">$0</p>
          </div>

          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">Total Equity</h3>
            <p className="text-2xl font-bold text-green-600">$0</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="flex space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Add Balance Sheet
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
