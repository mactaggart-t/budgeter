import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { store } from "@/store/store";
import { setTokenGetter } from "@/store/householdApi";
import App from "@/App";
import { captureInviteToken } from "@/auth/inviteToken";

captureInviteToken();

function TokenBridge({ children }: { children: React.ReactNode }) {
  const { getAccessTokenSilently } = useAuth0();
  setTokenGetter(getAccessTokenSilently);
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: `${window.location.origin}/callback`,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "openid profile email",
        }}
      >
        <TokenBridge>
          <App />
        </TokenBridge>
      </Auth0Provider>
    </Provider>
  </React.StrictMode>
);