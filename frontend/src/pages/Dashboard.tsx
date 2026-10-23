import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Alert, Box, CircularProgress, Paper, Stack, Typography } from '@mui/material'

interface UserProfile {
  id: string
  auth0_sub: string
  email: string | null
  display_name: string | null
  created_at: string
}

export default function Dashboard() {
  const { getAccessTokenSilently } = useAuth0()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchProfile() {
      try {
        const token = await getAccessTokenSilently()
        const res = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: UserProfile = await res.json()
        if (!cancelled) setProfile(data)
      } catch (err) {
        if (!cancelled) setError(String(err))
      }
    }

    fetchProfile()
    return () => {
      cancelled = true
    }
  }, [getAccessTokenSilently])

  return (
    <Stack spacing={4}>
      <Typography variant="h4" component="h1">
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {profile ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Your profile
          </Typography>
          <Box
            component="dl"
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
              m: 0,
            }}
          >
            <ProfileRow label="User ID" value={profile.id} />
            <ProfileRow label="Email" value={profile.email ?? '—'} />
            <ProfileRow
              label="Display name"
              value={profile.display_name ?? '—'}
            />
            <ProfileRow
              label="Member since"
              value={new Date(profile.created_at).toLocaleDateString()}
            />
          </Box>
        </Paper>
      ) : (
        !error && (
          <Stack spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
            <CircularProgress />
            <Typography color="text.secondary">Loading profile…</Typography>
          </Stack>
        )
      )}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Spending summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No transactions yet. Connect your accounts to get started.
        </Typography>
      </Paper>
    </Stack>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <Box component="div">
      <Typography component="dt" variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography component="dd" variant="body2" sx={{ m: 0 }}>
        {value}
      </Typography>
    </Box>
  )
}
