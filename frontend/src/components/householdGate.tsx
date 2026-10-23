import { useEffect, useState } from "react";
import { useGetMyHouseholdQuery } from "@/store/householdApi";
import { clearInviteToken, getInviteToken } from "@/auth/inviteToken";
import CreateHousehold from "@/pages/createHousehold";
import JoinHousehold from "@/pages/joinHousehold";
import {
  Container,
  Paper,
  Typography,
  Stack,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";

type Props = { children: React.ReactNode };
type OnboardingView = "choose" | "create" | "join";

export default function HouseholdGate({ children }: Props) {
  const [inviteToken] = useState(getInviteToken);

  const { isLoading, isSuccess, isError, error } = useGetMyHouseholdQuery();
  const is404 = isError && (error as any)?.status === 404;

  const [view, setView] = useState<OnboardingView>(inviteToken ? "join" : "choose");

  useEffect(() => {
    if (isSuccess) clearInviteToken();
  }, [isSuccess]);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <Stack sx={{ alignItems: "center" }} spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Loading…</Typography>
        </Stack>
      </Container>
    );
  }

  if (isError && !is404) {
    return (
      <Container maxWidth="md" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <Typography color="text.secondary">Something went wrong. Please refresh.</Typography>
      </Container>
    );
  }

  if (isSuccess) return <>{children}</>;

  if (view === "create") {
    return <CreateHousehold onBack={() => setView("choose")} />;
  }

  if (view === "join") {
    return <JoinHousehold token={inviteToken ?? ""} onBack={() => setView("choose")} />;
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Paper sx={{ width: "100%", p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="overline">Welcome</Typography>
          <Typography variant="h5">Set up your household</Typography>
          <Typography color="text.secondary">
            Track spending and forecast savings together. Create a new household or join one with an invite link.
          </Typography>

          <Box sx={{ display: "flex", mt: 2, gap: 8, flexDirection: { xs: "column", sm: "row" } }}>
            <Button variant="contained" color="primary" onClick={() => setView("create")} fullWidth>
              Create a household
            </Button>
            <Button variant="outlined" onClick={() => setView("join")} fullWidth>
              I have an invite
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
