import json
from pathlib import Path

from rank_bm25 import BM25Okapi


BASE_DIR = Path(__file__).resolve().parent
JIRA_DATA_PATH = BASE_DIR / "mock_jira_data.json"
CONFLUENCE_DATA_PATH = BASE_DIR / "mock_confluence_data.json"
JIRA_INDEX_PATH = BASE_DIR / "jira_index.json"
CONFLUENCE_INDEX_PATH = BASE_DIR / "confluence_index.json"


def tokenize(text: str) -> list[str]:
    return text.lower().split()


def _load_json_array(path: Path, dataset_name: str) -> list[dict]:
    raw_text = path.read_text(encoding="utf-8").strip()
    if not raw_text:
        raise ValueError(
            f"{dataset_name} data file is empty: {path}. "
            "Populate it with a JSON array before building the index."
        )

    try:
        payload = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Invalid JSON in {dataset_name} data file {path}: "
            f"{exc.msg} (line {exc.lineno}, column {exc.colno})"
        ) from exc

    if not isinstance(payload, list):
        raise ValueError(
            f"{dataset_name} data file must contain a JSON array, got {type(payload).__name__}"
        )

    return payload


class BM25Index:
    def __init__(self) -> None:
        self.documents: list[dict] = []
        self.tokenized_corpus: list[list[str]] = []
        self.bm25: BM25Okapi | None = None

    def build(self, documents: list[dict]) -> None:
        self.documents = documents
        self.tokenized_corpus = [
            tokenize(f"{doc['title']} {doc['body']}")
            for doc in documents
        ]
        self.bm25 = BM25Okapi(self.tokenized_corpus)

    def search(self, query: str, top_k: int = 3) -> list[dict]:
        if not self.bm25:
            raise ValueError("BM25 index not built")

        query_tokens = tokenize(query)
        scores = self.bm25.get_scores(query_tokens)

        ranked = sorted(
            enumerate(scores),
            key=lambda x: x[1],
            reverse=True
        )[:top_k]

        results = []
        for idx, score in ranked:
            doc = self.documents[idx]
            results.append({
                "id": doc["id"],
                "title": doc["title"],
                "body": doc["body"],
                "source": doc["source"],
                "metadata": doc["metadata"],
                "score": round(float(score), 4),
            })
        return results

    def save(self, path: Path) -> int:
        payload = {
            "documents": self.documents,
        }
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return len(self.documents)

    def load(self, path: Path) -> None:
        payload = json.loads(path.read_text(encoding="utf-8"))
        self.build(payload["documents"])


def _load_jira_documents() -> list[dict]:
    raw = _load_json_array(JIRA_DATA_PATH, "Jira")
    docs = []
    for ticket in raw:
        docs.append({
            "id": ticket["id"],
            "title": ticket["summary"],
            "body": ticket["description"],
            "source": "jira",
            "metadata": {
                "status": ticket["status"],
                "priority": ticket["priority"],
                "epic": ticket["epic"],
                "assignee": ticket["assignee"],
                "sprint": ticket["sprint"],
                "story_points": ticket["story_points"],
                "labels": ticket["labels"],
                "created": ticket["created"],
                "updated": ticket["updated"],
            },
        })
    return docs


def _load_confluence_documents() -> list[dict]:
    raw = _load_json_array(CONFLUENCE_DATA_PATH, "Confluence")
    docs = []
    for page in raw:
        docs.append({
            "id": page["page_id"],
            "title": page["title"],
            "body": page["body"],
            "source": "confluence",
            "metadata": {
                "space": page["space"],
                "labels": page["labels"],
                "author": page["author"],
                "last_updated": page["last_updated"],
            },
        })
    return docs


def build_jira_index() -> int:
    docs = _load_jira_documents()
    index = BM25Index()
    index.build(docs)
    return index.save(JIRA_INDEX_PATH)


def build_confluence_index() -> int:
    docs = _load_confluence_documents()
    index = BM25Index()
    index.build(docs)
    return index.save(CONFLUENCE_INDEX_PATH)


if __name__ == "__main__":
    jira_count = build_jira_index()
    confluence_count = build_confluence_index()
    print(f"Built Jira index with {jira_count} documents")
    print(f"Built Confluence index with {confluence_count} documents")