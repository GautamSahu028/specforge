import json
import logging
from groq import Groq
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import get_settings

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        settings = get_settings()
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_model
        self.max_tokens = settings.groq_max_tokens
        self.temperature = settings.groq_temperature

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((ConnectionError, TimeoutError)),
        before_sleep=lambda retry_state: logger.warning(
            f"LLM call failed, retrying (attempt {retry_state.attempt_number})..."
        ),
    )
    def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from LLM")
        return content

    def call_json(self, system_prompt: str, user_prompt: str) -> dict:
        raw = self._call_llm(system_prompt, user_prompt)
        # Strip markdown fences if present
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON: {e}\nRaw: {raw[:500]}")
            raise ValueError(f"LLM returned invalid JSON: {e}")


# Singleton
llm_service = LLMService()
