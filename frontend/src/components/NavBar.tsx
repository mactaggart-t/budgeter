import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'

export default function NavBar() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } =
    useAuth0()

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo / brand */}
        <Link to="/" className="text-xl font-bold text-brand-600">
          💰 Budgeter
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-brand-600"
            >
              Dashboard
            </Link>
          )}

          {isLoading ? (
            <span className="text-sm text-gray-400">Loading…</span>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name ?? 'avatar'}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-700">{user?.name}</span>
              <button
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
                className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
              >
                Log out
              </button>
            </div>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="rounded bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
