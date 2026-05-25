import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  useGetMyHouseholdQuery,
  useGetMembersQuery,
  useInviteMemberMutation,
  useLeaveHouseholdMutation,
  type InviteResponse,
} from "@/store/householdApi";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Stack,
  Chip,
  Alert,
  IconButton,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function HouseholdSettings() {
  const { user: auth0User } = useAuth0();

  const { data: household, isLoading: householdLoading } = useGetMyHouseholdQuery();
  const { data: members, isLoading: membersLoading } = useGetMembersQuery();

  const [inviteMember, { isLoading: inviteLoading, error: inviteError }] =
    useInviteMemberMutation();
  const [leaveHousehold, { isLoading: leaveLoading, error: leaveError }] =
    useLeaveHouseholdMutation();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteResult, setInviteResult] = useState<InviteResponse | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const inviteErrorMessage = inviteError
    ? (inviteError as any)?.status === 409
      ? "A pending invite already exists for this email."
      : ((inviteError as any)?.data?.detail ?? "Failed to send invite.")
    : null;

  const leaveErrorMessage = leaveError
    ? ((leaveError as any)?.data?.detail ?? "Failed to leave household.")
    : null;

  async function handleInvite(e?: React.FormEvent) {
    e?.preventDefault();
    if (!inviteEmail.trim()) return;
    const result = await inviteMember({ email: inviteEmail.trim() }).unwrap();
    setInviteResult(result);
    setInviteEmail("");
  }

  async function handleLeave() {
    await leaveHousehold().unwrap();
    window.location.reload();
  }

  if (householdLoading || membersLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack sx={{alignItems: 'center'}}>
          <CircularProgress />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Loading…
          </Typography>
        </Stack>
      </Container>
    );
  }
  if (!household) return null;

  const inviteLink = inviteResult ? `${window.location.origin}/?token=${inviteResult.token}` : null;

  async function copyInviteLink() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedMessage("Copied to clipboard");
    } catch {
      setCopiedMessage("Copy failed");
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Typography variant="overline">Household</Typography>
          <Typography variant="h5">{household.name}</Typography>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Members
            </Typography>
            <Stack spacing={1}>
              {(members ?? []).map((m) => {
                const isYou = m.email === auth0User?.email;
                return (
                  <Stack key={m.id} direction="row" spacing={2}>
                    {/* <Avatar src={m.avatar ?? undefined} alt={m.display_name ?? m.email} /> */}
                    <Box sx={{ flex: 1 }}>
                      <Typography>{m.display_name ?? m.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {m.email}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      {isYou && <Chip label="you" size="small" />}
                      {m.id === household.created_by && <Chip label="owner" size="small" color="warning" />}
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Invite someone
            </Typography>
            <Typography color="text.secondary" variant="body2">
              They'll receive a link to join your household. The invite expires in 48 hours.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite(e)}
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleInvite()}
                disabled={inviteLoading || !inviteEmail.trim()}
                startIcon={inviteLoading ? <CircularProgress color="inherit" size={16} /> : null}
              >
                Invite
              </Button>
            </Stack>

            {inviteErrorMessage && <Alert severity="error" sx={{ mt: 2 }}>{inviteErrorMessage}</Alert>}

            {inviteResult && inviteLink && (
              <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                <Stack direction="row" sx={{alignItems: 'center'}} spacing={2}>
                  <Typography sx={{ fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {inviteLink}
                  </Typography>
                  <IconButton onClick={copyInviteLink} aria-label="copy">
                    <ContentCopyIcon />
                  </IconButton>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Expires {new Date(inviteResult.expires_at).toLocaleString()}
                </Typography>
              </Paper>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle1" color="error" gutterBottom>
              Leave household
            </Typography>
            <Typography color="text.secondary" variant="body2">
              You'll lose access to shared data. If you're the last member, the household will be permanently deleted.
            </Typography>

            {leaveErrorMessage && <Alert severity="error" sx={{ mb: 2 }}>{leaveErrorMessage}</Alert>}

            {!showLeaveConfirm ? (
              <Button variant="outlined" color="error" onClick={() => setShowLeaveConfirm(true)}>
                Leave household
              </Button>
            ) : (
              <Stack direction="row" spacing={2}>
                <Typography color="text.secondary">Are you sure?</Typography>
                <Button variant="contained" color="error" onClick={handleLeave} disabled={leaveLoading}>
                  Yes, leave
                </Button>
                <Button onClick={() => setShowLeaveConfirm(false)}>Cancel</Button>
              </Stack>
            )}
          </Box>
        </Stack>
      </Paper>

      <Snackbar
        open={Boolean(copiedMessage)}
        autoHideDuration={3000}
        onClose={() => setCopiedMessage(null)}
        message={copiedMessage}
      />
    </Container>
  );
}