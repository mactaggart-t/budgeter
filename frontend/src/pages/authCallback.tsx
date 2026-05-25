// ...existing code...
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthCallbackMutation } from "@/store/householdApi";
import { Paper, Typography, CircularProgress, Container, Alert } from "@mui/material";

export default function AuthCallback() {
  const { isLoading, isAuthenticated, error } = useAuth0();
  const [authCallback] = useAuthCallbackMutation();
  const navigate = useNavigate();
  const called = useRef(false);

  useEffect(() => {
    if (isLoading || called.current) return;
    if (!isAuthenticated) return;

    called.current = true;

    authCallback()
      .unwrap()
      .then(() => navigate("/", { replace: true }))
      .catch(() => navigate("/error", { replace: true }));
  }, [isLoading, isAuthenticated, authCallback, navigate]);

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Paper sx={{ width: "100%", p: 4, textAlign: "center" }}>
        {error ? (
          <Alert severity="error">
            <Typography variant="h6">Authentication failed</Typography>
            <Typography variant="body2">{(error as any)?.message ?? "An error occurred"}</Typography>
          </Alert>
        ) : (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography color="text.secondary">Signing you in…</Typography>
          </>
        )}
      </Paper>
    </Container>
  );
}
