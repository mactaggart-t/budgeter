import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import AuthCallback from "@/pages/authCallback";
import HouseholdGate from "@/components/householdGate";
import HouseholdSettings from "@/pages/householdSettings";

function AppRoutes() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  return (
    <HouseholdGate>
      <Routes>
        <Route path="/" element={<Navigate to="/household" replace />} />
        <Route path="/household" element={<HouseholdSettings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HouseholdGate>
  );
}

export default function App() {
  return (
    <>
      <style>{globalStyles}</style>
      <BrowserRouter>
        <Routes>
          <Route path="/callback" element={<AuthCallback />} />
          <Route path="/*" element={<AppRoutes />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --font-display: 'DM Serif Display', Georgia, serif;
    --font-body:    'DM Sans', sans-serif;
    --font-mono:    'DM Mono', monospace;

    --bg:           #faf9f7;
    --surface:      #ffffff;
    --border:       #e8e4de;
    --accent:       #2d5a3d;
    --accent-fg:    #ffffff;

    --text-primary:   #1a1917;
    --text-secondary: #6b6762;
    --text-muted:     #a09c97;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg:           #141412;
      --surface:      #1e1d1b;
      --border:       #2e2c29;
      --accent:       #4a8f62;
      --accent-fg:    #ffffff;

      --text-primary:   #f0ede8;
      --text-secondary: #9e9b96;
      --text-muted:     #5c5a56;
    }
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
  }

  button { cursor: pointer; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .spinner {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    animation: spin 0.8s linear infinite;
  }
`;