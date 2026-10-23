import { type ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { CircularProgress, Stack, Typography } from '@mui/material'

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
      <Stack spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', minHeight: 256 }}>
        <CircularProgress />
        <Typography color="text.secondary">Loading…</Typography>
      </Stack>
    )
  }

  if (!isAuthenticated) {
    loginWithRedirect()
    return null
  }

  return <>{children}</>
}
