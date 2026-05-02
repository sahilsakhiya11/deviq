
# DevIQ  High-Level Design

## Architecture Overview

```mermaid
flowchart TD
    subgraph Sources["🗄️ Data Sources"]
        J[Mock Jira JSON]
        C[Mock Confluence JSON\nRunbooks & Onboarding]
    end

    subgraph Ingestion["⚙️ Ingestion Layer"]
        JF[jira_fetcher.py]
        CF[confluence_fetcher.py]
        BI[bm25_indexer.py]
    end

    subgraph Index["📦 BM25 Index"]
        JI[(jira_index.json)]
        CI[(confluence_index.json)]
    end

    subgraph Query["🧠 Query Engine"]
        QH[query_handler.py\nBM25 Search + Prompt Build]
        MR[Model Router\nmini vs full]
    end

    subgraph API["🚀 FastAPI Backend"]
        R1[POST /chat]
        R2[GET /sprint-report]
        R3[POST /ticket-explain]
        R4[GET /sync-jira]
        R5[GET /health]
    end

    subgraph LLM["🤖 OpenAI"]
        M1[GPT-4.1-mini\nQueries]
        M2[GPT-4.1\nSummaries]
    end

    subgraph Frontend["🖥️ Frontend Dashboard"]
        T1[Chatbot Tab]
        T2[Sprint Health Tab]
        T3[Ticket Explainer Tab]
        T4[Onboarding Assistant Tab]
    end

    J --> JF --> BI --> JI
    C --> CF --> BI --> CI
    JI --> QH
    CI --> QH
    QH --> MR --> M1
    MR --> M2
    M1 --> API
    M2 --> API
    API --> Frontend
```

## Component Responsibilities

| Component | Responsibility |
|---|---|
| `jira_fetcher.py` | Loads mock Jira JSON, normalizes ticket schema |
| `confluence_fetcher.py` | Loads mock Confluence JSON, extracts page body |
| `bm25_indexer.py` | Tokenizes content, builds BM25 corpus, saves index |
| `query_handler.py` | Tokenizes query, scores corpus, assembles top-k context, calls OpenAI |
| `FastAPI` | HTTP layer, request validation, rate limiting, response formatting |
| `Model Router` | Routes to `gpt-4.1-mini` (chat) or `gpt-4.1` (sprint reports/summaries) |

## System Boundaries

> [!info] What's In Scope (Demo)
> Mock data only. No live Jira/Confluence. No auth layer. No persistent DB.

> [!warning] What's Out of Scope (Demo)
> Vector embeddings, semantic search, multi-tenant, user sessions, real SSO.

## Related Notes
- [[LLD Components]]
- [[Tech Stack Decisions]]
- [[Data Flow Diagram]]