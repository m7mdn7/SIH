from pydantic import BaseModel


class ChallengeInput(BaseModel):
    id: str
    title: str
    description: str


class ChallengeAIAnalysis(BaseModel):
    id: str
    challengeId: str
    domain: str
    subdomain: str
    problemType: str
    severity: str
    affectedPopulation: str
    scale: str
    keyFactors: list[str]
    missingInformation: list[str]
    confidence: float
    classificationStatus: str | None = None
    primaryDomain: str | None = None
    secondaryDomains: list[str] | None = None
    explainability: dict | None = None


class InnovationGap(BaseModel):
    id: str
    challengeId: str
    gapType: str  # 'research' | 'technology' | 'adaptation' | 'data' | 'expertise'
    description: str
    rationale: str
    recommendedAction: str
    requiredExpertise: list[str]
    confidence: float
    evidence: list[str] | None = None
    hypotheses: list[str] | None = None
    unknowns: list[str] | None = None


class SimilarityInput(BaseModel):
    challengeId: str | None = None
    title: str | None = None
    description: str
    domain: str | None = None
    limit: int | None = 10


class SimilarityMatch(BaseModel):
    challengeId: str
    score: float
    relationship: str | None = None
    explainability: dict | None = None


class GapAnalysisInput(BaseModel):
    challengeId: str
    description: str
    aiAnalysis: ChallengeAIAnalysis | None = None


class GapAnalysisContext(BaseModel):
    challengeId: str
    description: str
    aiAnalysis: ChallengeAIAnalysis | None = None
    similarChallenges: list[SimilarityMatch] | None = None
    knownConstraints: dict | None = None


class MatchesInput(BaseModel):
    challengeId: str
    description: str
    gapAnalysis: InnovationGap | None = None


class UniversityMatch(BaseModel):
    universityId: str
    name: str
    matchScore: float
    reasons: list[str] | None = None
    explainability: dict | None = None
    matchTier: str | None = None


class ProcessInput(BaseModel):
    challengeId: str | None = None
    title: str
    description: str
    context: dict | None = None


class ProcessOutput(BaseModel):
    analysis: ChallengeAIAnalysis
    similarChallenges: list[SimilarityMatch]
    gapAnalysis: InnovationGap
    institutionMatches: list[UniversityMatch]
