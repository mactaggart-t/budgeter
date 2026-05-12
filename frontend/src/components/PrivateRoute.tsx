import { type ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

interface PrivateRouteProps {
  children: ReactNode
}

/**
 * Renders `children` only when the user is authenticated.
 * Redirects to Auth0 login when the user is not authenticated.
 * Shows a loading spinner while Auth0 is initialising.
 */
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-gray-400">Loading…</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    loginWithRedirect()
    return null
  }

  return <>{children}</>
}
