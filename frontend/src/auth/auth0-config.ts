/**
 * Auth0 configuration.
 *
 * Values are read from Vite environment variables so they are never
 * hardcoded in source. Copy .env.example → .env.local and fill them in.
 *
 * Vite exposes only variables prefixed with VITE_ to the browser bundle.
 */

export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN as string,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID as string,
  /**
   * The Auth0 API audience – must match the identifier registered in
   * the Auth0 dashboard and the backend's AUTH0_AUDIENCE env var.
   */
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE as string,
  },
}
