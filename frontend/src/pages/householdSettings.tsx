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
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Divider,
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
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 } }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack spacing={4} divider={<Divider flexItem />}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              Household
            </Typography>
            <Typography variant="h5" component="h1">
              {household.name}
            </Typography>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Members
            </Typography>
            <Stack spacing={1.5}>
              {(members ?? []).map((m) => {
                const isYou = m.email === auth0User?.email;
                return (
                  <Stack
                    key={m.id}
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center", justifyContent: "space-between" }}
                  >
                    <Typography sx={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.display_name ?? m.email}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                      {isYou && <Chip label="you" size="small" />}
                      {m.id === household.created_by && <Chip label="owner" size="small" color="warning" />}
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          </Stack>

          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Invite someone
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Enter their email to create an invite link, then share it with them. The link only works for that
                email address and expires in 48 hours.
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                placeholder="email@example.com"
                type="email"
                size="small"
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
                sx={{ minWidth: 120, flexShrink: 0 }}
              >
                Invite
              </Button>
            </Stack>

            {inviteErrorMessage && <Alert severity="error">{inviteErrorMessage}</Alert>}

            {inviteResult && inviteLink && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography
                      variant="body2"
                      sx={{ flex: 1, minWidth: 0, fontFamily: "monospace", overflowWrap: "anywhere" }}
                    >
                      {inviteLink}
                    </Typography>
                    <IconButton onClick={copyInviteLink} aria-label="copy" size="small">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Expires {new Date(inviteResult.expires_at).toLocaleString()}
                  </Typography>
                </Stack>
              </Paper>
            )}
          </Stack>

          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" color="error" sx={{ fontWeight: 600 }}>
                Leave household
              </Typography>
              <Typography color="text.secondary" variant="body2">
                You'll lose access to shared data. If you're the last member, the household will be permanently
                deleted.
              </Typography>
            </Stack>

            {leaveErrorMessage && <Alert severity="error">{leaveErrorMessage}</Alert>}

            {!showLeaveConfirm ? (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setShowLeaveConfirm(true)}
                sx={{ alignSelf: "flex-start" }}
              >
                Leave household
              </Button>
            ) : (
              <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}>
                <Typography color="text.secondary">Are you sure?</Typography>
                <Button variant="contained" color="error" onClick={handleLeave} disabled={leaveLoading}>
                  Yes, leave
                </Button>
                <Button onClick={() => setShowLeaveConfirm(false)}>Cancel</Button>
              </Stack>
            )}
          </Stack>
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