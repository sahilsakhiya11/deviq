import axios from "axios";

// Use VITE_API_BASE_URL from environment (set at build time via ARG)
// For local Docker: /api (Nginx reverse proxy to backend)
// For production: https://your-backend-url (set via build ARG at deploy time)
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function sendChat(question, source = "both") {
  const response = await api.post("/chat", { question, source });
  return response.data;
}

export async function getSprintReport(sprint) {
  const response = await api.get("/sprint-report", {
    params: { sprint },
  });
  return response.data;
}

export async function explainTicket(ticketId) {
  const response = await api.post("/ticket-explain", {
    ticket_id: ticketId,
  });
  return response.data;
}

export async function getHealth() {
  const response = await api.get("/health");
  return response.data;
}