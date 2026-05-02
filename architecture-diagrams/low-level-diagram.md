
# DevIQ — Low-Level Design

## Query Flow — Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant API as FastAPI
    participant QH as query_handler.py
    participant BM25 as BM25Index
    participant MR as Model Router
    participant GPT as OpenAI API

    U->>API: POST /chat { "question": "..." }
    API->>QH: handle_query(question, source="jira")
    QH->>BM25: search(tokens, top_k=3)
    BM25-->>QH: [doc1, doc2, doc3]
    QH->>QH: build_prompt(docs, question)
    QH->>MR: route(prompt, mode="chat")
    MR-->>GPT: gpt-4.1-mini + prompt
    GPT-->>MR: answer string
    MR-->>QH: answer
    QH-->>API: { answer, sources: [doc_ids] }
    API-->>U: 200 OK { answer, sources }
```

## Mock Jira Ticket Schema

```json
{
  "id": "PROJECT-1042",
  "summary": "Enable mTLS for Global Platform services",
  "description": "All microservices in GPR epic must support mutual TLS...",
  "status": "In Progress",
  "priority": "High",
  "epic": "Global Platform Readiness",
  "assignee": "john.smith@bank.com",
  "sprint": "Sprint 24",
  "story_points": 5,
  "labels": ["security", "platform", "infra"],
  "created": "2026-03-15",
  "updated": "2026-04-10"
}
```

## FastAPI Route Contracts

| Route             | Method | Input                             | Output                                          |
| ----------------- | ------ | --------------------------------- | ----------------------------------------------- |
| `/chat`           | POST   | `{ question: str, source?: str }` | `{ answer: str, sources: list }`                |
| `/sprint-report`  | GET    | `?sprint=Sprint+24`               | `{ summary: str, health: str, blockers: list }` |
| `/ticket-explain` | POST   | `{ ticket_id: str }`              | `{ explanation: str, plain_english: str }`      |
| `/sync-jira`      | GET    | —                                 | `{ indexed: int, status: str }`                 |
| `/health`         | GET    | —                                 | `{ status: "ok", version: str }`                |

## Model Routing Logic

```mermaid
flowchart LR
    Q[Incoming Request] --> T{Request Type?}
    T -->|/chat or /ticket-explain| M1[gpt-4.1-mini\nFast + Cheap]
    T -->|/sprint-report| M2[gpt-4.1\nHigh Quality Summary]
    M1 --> R[Response]
    M2 --> R
```

