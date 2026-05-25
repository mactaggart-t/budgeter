import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Alert,
  Container,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useJoinHouseholdMutation } from "@/store/householdApi";

type Props = {
  token: string;
  onBack: () => void;
};

export default function JoinHousehold({ token: initialToken, onBack }: Props) {
  const [token, setToken] = useState(initialToken ?? "");
  const [joinHousehold, { isLoading, isSuccess, error }] = useJoinHouseholdMutation();

  const errorMessage = (() => {
    if (!error) return null;
    const status = (error as any)?.status;
    if (status === 404) return "This invite link doesn't exist.";
    if (status === 410) return "This invite has expired or already been used.";
    if (status === 409) return "You're already in a household.";
    return (error as any)?.data?.detail ?? "Something went wrong.";
  })();

  useEffect(() => {
    if (initialToken) {
      joinHousehold({ token: initialToken });
    }
  }, [initialToken, joinHousehold]);

  async function handleJoin(e?: React.FormEvent) {
    e?.preventDefault();
    if (!token.trim()) return;
    joinHousehold({ token: token.trim() });
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Paper sx={{ width: "100%", p: 4 }}>
        <IconButton aria-label="back" onClick={onBack} size="large">
          <ArrowBackIcon />
        </IconButton>

        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="overline" gutterBottom>
            Join household
          </Typography>
          <Typography variant="h5" component="h1" gutterBottom>
            Enter your invite
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Paste the invite token from your email, or it may have been filled in automatically from your link.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleJoin} noValidate>
          <TextField
            fullWidth
            label="Invite token"
            placeholder="Paste token here"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin(e)}
            disabled={isLoading || isSuccess}
            autoFocus={!initialToken}
            margin="normal"
          />

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {isSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Joined! Taking you in…
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading || isSuccess || !token.trim()}
            startIcon={isLoading ? <CircularProgress color="inherit" size={18} /> : null}
            sx={{ mt: 1 }}
          >
            Join household
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
