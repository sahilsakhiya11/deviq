import axios from "axios";

// In Docker, use /api/ path (nginx proxy). Locally, use env var.
const baseURL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000")
  : "/api";

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