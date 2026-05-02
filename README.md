# Deviq

Deviq is a small project that demonstrates a simple backend + frontend demo with architecture diagrams included in the repository.

## Project Overview

- Backend: serves APIs and ingestion pipelines (see `backend/`).
- Frontend: single-page app built with Vite (see `frontend/`).

## Quick Start

Prerequisites: Python 3.10+ for the backend, Node 16+ for the frontend.

Run backend (example):

```bash
cd backend
python -m pip install -r requirements.txt
# then run the app as appropriate (see backend/main.py)
python main.py
```

Run frontend (example):

```bash
cd frontend
npm install
npm run dev
```

## Architecture Diagrams

Below are the Mermaid diagrams included directly so GitHub (and many editors) will render them inline. If you prefer standalone SVG/PNG files, see the "Generate SVGs locally" instructions after the diagrams.

### Data Flow — Level 0

```mermaid
flowchart LR
	PM["👤 Leadership / PM"] -->|asks question| SYS["⚙️ DevIQ Platform"]
	DEV["👤 Developer"] -->|asks question| SYS
	SYS -->|returns answer + sources| PM
	SYS -->|returns answer + sources| DEV
	J[("🗄️ Jira Data")] -->|tickets| SYS
	C[("🗄️ Confluence Data")] -->|pages| SYS
```

### Data Flow — Level 1

```mermaid
flowchart TD
	A["Raw Jira JSON\n{id, summary, description,\nstatus, epic, sprint}"]
	B["Raw Confluence JSON\n{page_id, title, body, space}"]

	A -->|normalize fields| C["Flat Document\n{id, title, body, source, metadata}"]
	B -->|normalize fields| C

	C -->|tokenize body+title| D["Token List\n['enable', 'mtls', 'platform'...]"]
	D -->|rank-bm25 fit| E["BM25 Corpus\n+ IDF weights saved to JSON"]

	F["User Query: string"] -->|tokenize| G["Query Tokens\n['mtls', 'security'...]"]
	G -->|BM25 score vs corpus| H["Top 3 Documents\nwith relevance scores"]
	E --> H

	H -->|truncate to token limit| I["Assembled Prompt\nSystem msg + context + question"]
	I -->|OpenAI API call| J["GPT Response: string"]
	J -->|format + attach source IDs| K["API Response\n{answer, sources:[USCM-42, USCM-67]}"]
```

### High-Level Architecture

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

### Low-Level — Sequence

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

### Low-Level — Model Routing (flow)

```mermaid
flowchart LR
	Q[Incoming Request] --> T{Request Type?}
	T -->|/chat or /ticket-explain| M1[gpt-4.1-mini\nFast + Cheap]
	T -->|/sprint-report| M2[gpt-4.1\nHigh Quality Summary]
	M1 --> R[Response]
	M2 --> R
```

### Generate SVGs locally

If you want SVG/PNG files, run this locally (requires Node & npm). On macOS/Apple Silicon you may need additional Puppeteer setup.

```bash
# from repository root
npm install -g @mermaid-js/mermaid-cli
for f in architecture-diagrams/*.mmd; do
  mmdc -i "$f" -o "${f%.mmd}.svg"
done
```

If `mmdc` fails due to Puppeteer/Chromium on macOS (ARM), try using `npx` and allow it to download required Chromium, or follow Puppeteer docs to install a compatible Chromium build.

### Rendered PNG previews

The diagrams have been rendered to PNG and included in `architecture-diagrams/`. You can view them directly in this README:

- Data Flow — Level 0

![Data Flow Level 0](architecture-diagrams/data-flow-0.png)

- Data Flow — Level 1

![Data Flow Level 1](architecture-diagrams/data-flow-1.png)

- High-Level Architecture

![High-Level Architecture](architecture-diagrams/high-level.png)

- Low-Level — Sequence

![Low-Level Sequence](architecture-diagrams/low-level-sequence.png)

- Low-Level — Model Routing

![Low-Level Model Routing](architecture-diagrams/model-routing.png)


## Repository Layout (selected)

- `backend/` — Python backend and services
- `frontend/` — Vite React frontend
- `architecture-diagrams/` — design docs and diagrams

## Contributing

If you'd like changes to this README (more run details, screenshots, or embedded diagrams), tell me what to add and I will update it.

---
Generated on May 1, 2026
