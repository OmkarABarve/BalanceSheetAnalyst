import { useAuth } from '../hooks/useAuth'

export const Profile = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Profile
        </h1>
        <p className="text-gray-600">
          Please sign in to view your profile.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Profile
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="mt-1 text-gray-900">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <p className="mt-1 text-gray-900 font-mono text-sm">{user.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Created
            </label>
            <p className="mt-1 text-gray-900">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Updated
            </label>
            <p className="mt-1 text-gray-900">
              {new Date(user.updated_at || user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Account Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Update Profile
            </button>
            <button className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
