import { useState } from "react";
import { explainTicket } from "../services/api";

export default function TicketExplainerPage() {
  const [ticketId, setTicketId] = useState("USCM-1042");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExplain = async (e) => {
    e.preventDefault();

    if (!ticketId.trim()) return;

    setLoading(true);
    setError("");

    try {
      const data = await explainTicket(ticketId.trim());
      setResult(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Failed to explain ticket."
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <h3>Ticket Explainer</h3>
        <p>Translate Jira ticket details into plain English for developers and QA.</p>
      </div>

      <div className="panel">
        <form className="ticket-form" onSubmit={handleExplain}>
          <div className="field grow">
            <span>Ticket ID</span>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value.toUpperCase())}
              placeholder="USCM-1042"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Explaining..." : "Explain Ticket"}
          </button>
        </form>

        {error && <div className="error-banner">{error}</div>}

        {!result && !loading && !error && (
          <div className="empty-state compact">
            <h4>No ticket loaded</h4>
            <p>Enter a Jira ticket ID like USCM-1042 to generate a plain-English explanation.</p>
          </div>
        )}

        {result && (
          <div className="result-card">
            <div className="result-header">
              <span className="source-chip">{result.ticket_id}</span>
            </div>
            <h4>Plain-English Explanation</h4>
            <p>{result.plain_english}</p>
          </div>
        )}
      </div>
    </section>
  );
}