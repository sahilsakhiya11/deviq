import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getSprintReport } from "../services/api";

export default function SprintReportPage() {
  const [sprint, setSprint] = useState("Sprint 24");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const chartData = useMemo(() => {
    if (!report?.metrics) return [];
    return [
      { name: "Done", value: report.metrics.done_count || 0 },
      { name: "In Progress", value: report.metrics.in_progress_count || 0 },
      { name: "To Do", value: report.metrics.todo_count || 0 },
      { name: "Story Points", value: report.metrics.total_story_points || 0 },
    ];
  }, [report]);

  const handleLoadReport = async (e) => {
    e.preventDefault();
    if (!sprint.trim()) return;

    setLoading(true);
    setError("");

    try {
      const data = await getSprintReport(sprint.trim());
      setReport(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load sprint report.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const healthClass =
    report?.health?.toLowerCase() === "green"
      ? "health-badge green"
      : report?.health?.toLowerCase() === "amber"
      ? "health-badge amber"
      : report?.health?.toLowerCase() === "red"
      ? "health-badge red"
      : "health-badge";

  return (
    <section className="page-section">
      <div className="page-heading">
        <h3>Sprint Health Report</h3>
        <p>Leadership-ready sprint summary, health signal, and blocker visibility.</p>
      </div>

      <div className="panel">
        <form className="ticket-form" onSubmit={handleLoadReport}>
          <div className="field grow">
            <span>Sprint</span>
            <input
              type="text"
              value={sprint}
              onChange={(e) => setSprint(e.target.value)}
              placeholder="Sprint 24"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Load Report"}
          </button>
        </form>

        {error && <div className="error-banner">{error}</div>}

        {!report && !loading && !error && (
          <div className="empty-state compact">
            <h4>No report loaded</h4>
            <p>Load a sprint report to see summary, blockers, and delivery metrics.</p>
          </div>
        )}

        {report && (
          <div className="report-layout">
            <div className="report-top">
              <div className="result-card">
                <div className="result-header">
                  <span className={healthClass}>{report.health}</span>
                </div>
                <h4>{report.sprint}</h4>
                <p>{report.summary}</p>
              </div>

              <div className="kpi-grid">
                <div className="kpi-card">
                  <span>Done</span>
                  <strong>{report.metrics?.done_count ?? 0}</strong>
                </div>
                <div className="kpi-card">
                  <span>In Progress</span>
                  <strong>{report.metrics?.in_progress_count ?? 0}</strong>
                </div>
                <div className="kpi-card">
                  <span>To Do</span>
                  <strong>{report.metrics?.todo_count ?? 0}</strong>
                </div>
                <div className="kpi-card">
                  <span>Story Points</span>
                  <strong>{report.metrics?.total_story_points ?? 0}</strong>
                </div>
              </div>
            </div>

            <div className="report-bottom">
              <div className="result-card chart-card">
                <h4>Sprint Metrics</h4>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#24304f" />
                      <XAxis dataKey="name" stroke="#97a3c4" />
                      <YAxis stroke="#97a3c4" />
                      <Tooltip
                        contentStyle={{
                          background: "#11172b",
                          border: "1px solid #24304f",
                          borderRadius: "12px",
                          color: "#e5e7eb",
                        }}
                      />
                      <Bar dataKey="value" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="result-card">
                <h4>Blockers & Risks</h4>
                {report.blockers?.length ? (
                  <ul className="blocker-list">
                    {report.blockers.map((blocker) => (
                      <li key={blocker}>{blocker}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No major blockers identified for this sprint.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}