import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {profile ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Your profile
          </h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          </dl>
        </div>
      ) : (
        !error && (
          <div className="flex h-40 items-center justify-center text-gray-400">
            Loading profile…
          </div>
        )
      )}

      {/* Placeholder spending summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">
          Spending summary
        </h2>
        <p className="text-sm text-gray-500">
          No transactions yet. Connect your accounts to get started.
        </p>
      </div>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-gray-700">{value}</dd>
    </div>
  )
}
