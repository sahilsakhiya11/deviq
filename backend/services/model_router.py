import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://models.inference.ai.azure.com"),
)


def get_chat_model() -> str:
    return os.getenv("OPENAI_MODEL_CHAT", "gpt-4o-mini")


def get_report_model() -> str:
    return os.getenv("OPENAI_MODEL_REPORT", "gpt-4o")


async def run_chat_completion(
    *,
    system_prompt: str,
    user_prompt: str,
    model: str,
    max_tokens: int,
) -> str:
    response = client.chat.completions.create(
        model=model,
        temperature=0.3,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    return response.choices[0].message.content or ""