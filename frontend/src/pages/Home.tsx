import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import { Button, Container, Stack, Typography } from '@mui/material'

export default function Home() {
  const { isAuthenticated, loginWithRedirect } = useAuth0()

  return (
    <Container maxWidth="md">
      <Stack spacing={4} sx={{ alignItems: 'center', py: 10, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.025em' }}>
          Take control of your{' '}
          <Typography component="span" variant="inherit" color="primary.main" sx={{ fontWeight: 'inherit' }}>
            finances
          </Typography>
        </Typography>
        <Typography color="text.secondary" variant="h6" sx={{ maxWidth: 600 }}>
          Budgeter helps you track your spending, set savings goals, and forecast
          your financial future — all in one place.
        </Typography>

        {isAuthenticated ? (
          <Button component={Link} to="/dashboard" variant="contained" size="large">
            Go to Dashboard →
          </Button>
        ) : (
          <Button onClick={() => loginWithRedirect()} variant="contained" size="large">
            Get started — it's free
          </Button>
        )}
      </Stack>
    </Container>
  )
}
