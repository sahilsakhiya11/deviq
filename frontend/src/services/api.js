import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
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