---
mode: agent
description: Generate mock Jira data for DevIQ
***

Generate the complete file `backend/ingestion/mock_jira.py`.

Requirements:
- Function `generate_mock_jira_data() -> list[dict]` returns 20 realistic Jira tickets
- All tickets: project=USCM, epic="Global Platform Readiness"
- Cover themes: mTLS, Kubernetes, CI/CD, API gateway, observability, compliance, database migration, load testing, service mesh, documentation
- Mix of sprints: Sprint 22, Sprint 23, Sprint 24
- Mix of statuses: "To Do", "In Progress", "In Review", "Done"
- Mix of priorities: High, Medium, Low
- Story points: 1, 2, 3, 5, 8 only
- Each `description` must be 3-4 full realistic sentences
- Function `save_mock_jira_data()` saves JSON to `backend/ingestion/mock_jira_data.json`
- `if __name__ == "__main__"` block calls `save_mock_jira_data()` and prints count
- Use `pathlib.Path` for the output path — no hardcoded strings
- Schema: id, summary, description, status, priority, epic, assignee, sprint, story_points, labels, created, updated