from pydantic import BaseModel, Field
from typing import List, Optional

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
    keyFactors: List[str]
    missingInformation: List[str]
    confidence: float

class InnovationGap(BaseModel):
    id: str
    challengeId: str
    gapType: str # 'research' | 'technology' | 'adaptation' | 'data' | 'expertise'
    description: str
    rationale: str
    recommendedAction: str
    requiredExpertise: List[str]
    confidence: float

class SimilarityInput(BaseModel):
    challengeId: Optional[str] = None
    title: Optional[str] = None
    description: str
    domain: Optional[str] = None
    limit: Optional[int] = 10

class SimilarityMatch(BaseModel):
    challengeId: str
    score: float
    relationship: Optional[str] = None

class GapAnalysisInput(BaseModel):
    challengeId: str
    description: str
    aiAnalysis: Optional[ChallengeAIAnalysis] = None

class MatchesInput(BaseModel):
    challengeId: str
    description: str
    gapAnalysis: Optional[InnovationGap] = None

class UniversityMatch(BaseModel):
    universityId: str
    name: str
    matchScore: float
