import { useState } from "react";
import { sendChat } from "../services/api";

const starterPrompts = [
  "How do I onboard as a new engineer?",
  "How does the Kubernetes deployment process work?",
  "What is the incident response flow?",
];

export default function OnboardingPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askQuestion = async (promptText) => {
    if (!promptText.trim()) return;

    const userMessage = {
      role: "user",
      text: promptText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError("");

    try {
      const data = await sendChat(promptText.trim(), "confluence");

      const assistantMessage = {
        role: "assistant",
        text: data.answer,
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setQuestion("");
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Failed to fetch onboarding answer."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await askQuestion(question);
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <h3>Onboarding Assistant</h3>
        <p>Help new engineers navigate runbooks, onboarding steps, and platform documentation.</p>
      </div>

      <div className="panel chat-panel">
        <div className="prompt-chip-row">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="prompt-chip"
              onClick={() => askQuestion(prompt)}
              disabled={loading}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="chat-thread">
          {messages.length === 0 && !loading && (
            <div className="empty-state">
              <h4>Onboarding help is ready</h4>
              <p>
                Ask about deployment flow, support process, runbooks, incident handling, or onboarding basics.
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
              <div className="message-text">Looking through onboarding docs...</div>
            </div>
          )}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <textarea
            rows="3"
            placeholder="Ask an onboarding question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Ask"}
          </button>
        </form>

        {error && <div className="error-banner">{error}</div>}
      </div>
    </section>
  );
}