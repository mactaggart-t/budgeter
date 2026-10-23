import { useAuth0 } from '@auth0/auth0-react'
import { AppBar, Avatar, Box, Button, CircularProgress, Toolbar, Typography } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard', requiresAuth: true },
  { label: 'Household', path: '/household', requiresAuth: true },
]

export default function NavBar() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0()
  const location = useLocation()

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
      <Toolbar sx={{ maxWidth: 'lg', width: '100%', mx: 'auto', px: { xs: 2, sm: 3 }, gap: 2 }}>
        <Typography
          component={Link}
          to="/"
          variant="h6"
          sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}
        >
          Budgeter
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          {isAuthenticated &&
            NAV_LINKS.map(({ label, path }) => (
              <Button
                key={path}
                component={Link}
                to={path}
                size="small"
                sx={{
                  color: location.pathname === path ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === path ? 700 : 400,
                  textTransform: 'none',
                  '&:hover': { color: 'primary.main', bgcolor: 'primary.50' },
                }}
              >
                {label}
              </Button>
            ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          {isLoading ? (
            <CircularProgress size={20} />
          ) : isAuthenticated ? (
            <>
              <Avatar
                src={user?.picture}
                alt={user?.name ?? 'avatar'}
                sx={{ width: 32, height: 32 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user?.name}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                sx={{ textTransform: 'none' }}
              >
                Log out
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={() => loginWithRedirect()}
              sx={{ textTransform: 'none' }}
            >
              Log in
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}