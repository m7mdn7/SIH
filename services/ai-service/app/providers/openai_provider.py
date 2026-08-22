import uuid

from app.core.config import settings
from app.core.logging import logger
from app.providers.base import BaseLLMProvider
from app.schemas.models import ChallengeAIAnalysis, InnovationGap


class OpenAICompatibleProvider(BaseLLMProvider):
    def __init__(self):
        self.client = None
        if settings.OPENAI_API_KEY:
            try:
                from openai import OpenAI

                self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
                logger.info("[OpenAIProvider] Initialized successfully.")
            except ImportError:
                logger.warning(
                    "[OpenAIProvider] OpenAI SDK not installed. Falling back."
                )

    def analyze_challenge(
        self, challenge_id: str, title: str, description: str
    ) -> ChallengeAIAnalysis:
        if not self.client:
            raise ValueError(
                "OpenAI client not initialized. Check OPENAI_API_KEY environment variable."
            )

        logger.info(f"[OpenAIProvider] Analyzing challenge: {title}")

        prompt = (
            f"Analyze the following societal challenge:\n"
            f"Title: {title}\n"
            f"Description: {description}\n\n"
            f"Determine the primary domain (must be one of: Agriculture, Water Management, Healthcare, Education, Environment, "
            f"Energy, Urban Infrastructure, Accessibility, Public Administration, Rural Livelihoods).\n"
            f"Determine subdomain, problem type, severity (low, medium, high), affected population, scale (individual, community, village, district, state), "
            f"key factors contributing to the problem, and missing information that would help solve it.\n"
            f"Crucial: Do not invent facts. Put anything not mentioned in missingInformation."
        )

        try:
            # Using Structured Outputs (Pydantic parsing) in newer OpenAI library versions
            response = self.client.beta.chat.completions.parse(
                model=settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional societal challenge classifier and AI analyst.",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format=ChallengeAIAnalysis,
            )
            parsed_analysis = response.choices[0].message.parsed
            if parsed_analysis:
                # Update ids to make sure they are aligned
                parsed_analysis.id = f"an_{uuid.uuid4().hex[:8]}"
                parsed_analysis.challengeId = challenge_id
                return parsed_analysis
        except Exception as e:
            logger.error(f"[OpenAIProvider] Failed to analyze challenge: {e}")
            raise RuntimeError(f"OpenAI analysis failed: {e}")

        raise RuntimeError("OpenAI returned empty message parse response.")

    def analyze_gap(
        self,
        challenge_id: str,
        description: str,
        ai_analysis: ChallengeAIAnalysis | None = None,
    ) -> InnovationGap:
        if not self.client:
            raise ValueError(
                "OpenAI client not initialized. Check OPENAI_API_KEY environment variable."
            )

        logger.info(
            f"[OpenAIProvider] Analyzing innovation gap for challenge ID: {challenge_id}"
        )

        analysis_context = ""
        if ai_analysis:
            analysis_context = (
                f"Classified Domain: {ai_analysis.domain}\n"
                f"Problem Type: {ai_analysis.problemType}\n"
                f"Severity: {ai_analysis.severity}\n"
            )

        prompt = (
            f"Identify the primary innovation gap for this challenge:\n"
            f"Description: {description}\n"
            f"{analysis_context}\n"
            f"Classify the gapType exactly as one of: research, technology, adaptation, data, expertise.\n"
            f"Ensure to provide a descriptive summary, a solid technical rationale for the gap, a recommended action step, "
            f"and a list of required expertise tags."
        )

        try:
            response = self.client.beta.chat.completions.parse(
                model=settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert in social innovation and research-university technology translation loops.",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format=InnovationGap,
            )
            parsed_gap = response.choices[0].message.parsed
            if parsed_gap:
                parsed_gap.id = f"gap_{uuid.uuid4().hex[:8]}"
                parsed_gap.challengeId = challenge_id
                return parsed_gap
        except Exception as e:
            logger.error(f"[OpenAIProvider] Failed to analyze gap: {e}")
            raise RuntimeError(f"OpenAI gap analysis failed: {e}")

        raise RuntimeError("OpenAI returned empty gap parse response.")
