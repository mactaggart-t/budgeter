const KEY = "budgeter.inviteToken";

// The Auth0 login redirect drops the query string, so keep the invite token
// in sessionStorage until the invitee has joined a household.
export function captureInviteToken(): void {
  const token = new URLSearchParams(window.location.search).get("token");
  if (token) sessionStorage.setItem(KEY, token);
}

export function getInviteToken(): string | null {
  return (
    new URLSearchParams(window.location.search).get("token") ??
    sessionStorage.getItem(KEY)
  );
}

export function clearInviteToken(): void {
  sessionStorage.removeItem(KEY);
}
