import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'

export default function Home() {
  const { isAuthenticated, loginWithRedirect } = useAuth0()

  return (
    <section className="flex flex-col items-center gap-8 py-20 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
        Take control of your{' '}
        <span className="text-brand-600">finances</span>
      </h1>
      <p className="max-w-xl text-lg text-gray-600">
        Budgeter helps you track your spending, set savings goals, and forecast
        your financial future — all in one place.
      </p>

      {isAuthenticated ? (
        <Link
          to="/dashboard"
          className="rounded-lg bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow hover:bg-brand-700"
        >
          Go to Dashboard →
        </Link>
      ) : (
        <button
          onClick={() => loginWithRedirect()}
          className="rounded-lg bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow hover:bg-brand-700"
        >
          Get started — it's free
        </button>
      )}
    </section>
  )
}
