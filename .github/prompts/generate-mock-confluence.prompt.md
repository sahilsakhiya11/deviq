---
mode: agent
description: Generate mock Confluence pages for DevIQ
***

Generate the complete file `backend/ingestion/mock_confluence.py`.

Requirements:
- Function `generate_mock_confluence_data() -> list[dict]` returns 10 Confluence pages
- Pages must cover exactly these topics:
  1. Global Platform Readiness Runbook
  2. New Engineer Onboarding Guide
  3. Kubernetes Deployment Guide
  4. Incident Response Playbook
  5. API Gateway Configuration
  6. CI/CD Pipeline Overview
  7. Security and Compliance Checklist
  8. Sprint Retrospective Template
  9. Service Mesh Architecture
  10. On-Call Rotation Guide
- Each `body` must be minimum 150 words of real content — no lorem ipsum
- Spaces: "Engineering" or "Platform"
- Function `save_mock_confluence_data()` saves to `backend/ingestion/mock_confluence_data.json`
- `if __name__ == "__main__"` block calls save function and prints count
- Schema: page_id, title, space, body, labels, author, last_updated