import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import { sendChat } from "../services/api";

export default function ChatbotPage() {
  const [question, setQuestion] = useState("");
  const [source, setSource] = useState("both");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      text: question.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError("");

    try {
      const data = await sendChat(question.trim(), source);

      const assistantMessage = {
        role: "assistant",
        text: data.answer,
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setQuestion("");
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Failed to fetch chatbot response."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <h3>Chatbot</h3>
        <p>Ask grounded questions across Jira, Confluence, or both.</p>
      </div>

      <div className="panel chat-panel">
        <div className="chat-toolbar">
          <label className="field">
            <span>Source</span>
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="both">Both</option>
              <option value="jira">Jira</option>
              <option value="confluence">Confluence</option>
            </select>
          </label>
        </div>

        <div className="chat-thread">
          {messages.length === 0 && !loading && (
            <div className="empty-state">
              <h4>Start a conversation</h4>
              <p>
                Try asking: “What is the status of mTLS work?” or “How do I onboard as a new engineer?”
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === "user" ? "message user-message" : "message ai-message"
              }
            >
              <div className="message-role">
                {message.role === "user" ? "You" : "DevIQ"}
              </div>
              <div className="message-text">{message.text}</div>

              {message.role === "assistant" && message.sources?.length > 0 && (
                <div className="source-list">
                  {message.sources.map((src) => (
                    <span key={src} className="source-chip">
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="message ai-message">
              <div className="message-role">DevIQ</div>
              <div className="message-text">Thinking...</div>
            </div>
          )}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <textarea
            rows="3"
            placeholder="Ask a question about engineering work, sprint health, tickets, or onboarding..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            <SendHorizonal size={16} />
            <span>{loading ? "Sending..." : "Send"}</span>
          </button>
        </form>

        {error && <div className="error-banner">{error}</div>}
      </div>
    </section>
  );
}