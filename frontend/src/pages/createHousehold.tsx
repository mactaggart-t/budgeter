import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useCreateHouseholdMutation } from "@/store/householdApi";

type Props = { onBack: () => void };

export default function CreateHousehold({ onBack }: Props) {
  const [name, setName] = useState("");
  const [createHousehold, { isLoading, error }] = useCreateHouseholdMutation();

  const errorMessage = error ? (error as any)?.data?.detail ?? "Something went wrong" : null;

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) return;
    await createHousehold({ name: name.trim() }).unwrap();
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Paper sx={{ width: "100%", p: 4 }}>
        <IconButton aria-label="back" onClick={onBack} size="large">
          <ArrowBackIcon />
        </IconButton>

        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="overline" gutterBottom>
            New household
          </Typography>
          <Typography variant="h5" component="h1" gutterBottom>
            What's your household called?
          </Typography>
          <Typography color="text.secondary" variant="body2">
            This is the name your household members will see. You can change it later.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            id="household-name"
            label="Household name"
            placeholder="e.g. The Johnsons"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
            fullWidth
            autoFocus
            margin="normal"
          />
          <Typography variant="caption" align="right">
            {name.length} / 100
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ my: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading || !name.trim()}
            startIcon={isLoading ? <CircularProgress color="inherit" size={18} /> : null}
            sx={{ mt: 2 }}
          >
            {isLoading ? "Creating…" : "Create household"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
