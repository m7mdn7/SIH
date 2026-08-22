import os
import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from app.schemas.models import (
    ChallengeInput,
    ChallengeAIAnalysis,
    InnovationGap,
    SimilarityInput,
    SimilarityMatch,
    GapAnalysisInput,
    MatchesInput,
    UniversityMatch
)

app = FastAPI(
    title="SIIP AI Service Stub API",
    description="FastAPI service providing mock/stub AI pipeline analysis for SIIP",
    version="1.0.0"
)

# Enable CORS for frontend and API backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "SIIP AI Service is running"}

@app.post("/analyze", response_model=ChallengeAIAnalysis)
def analyze_challenge(payload: ChallengeInput):
    text = (payload.title + " " + payload.description).lower()
    
    # Check if this matches our agricultural/vegetable spoilage scenario
    if any(keyword in text for keyword in ["tomato", "spoilage", "vegetable", "rot", "cooling", "storage"]):
        return ChallengeAIAnalysis(
            id=f"an_{uuid.uuid4().hex[:8]}",
            challengeId=payload.id,
            domain="Agriculture",
            subdomain="Post-Harvest Management",
            problemType="Food Spoilage and Storage",
            severity="High",
            affectedPopulation="Approximately 150 local mandi vendors and 2,000 daily consumers",
            scale="District Level",
            keyFactors=[
                "Lack of passive cooling",
                "No grid electricity for active cooling",
                "High ambient summer temperatures"
            ],
            missingInformation=[
                "Exact daily supply volume",
                "Current market waste-disposal rates"
            ],
            confidence=0.92
        )
    # Default fallback for other challenges (e.g. traffic gridlock)
    elif "traffic" in text or "road" in text or "junction" in text:
        return ChallengeAIAnalysis(
            id=f"an_{uuid.uuid4().hex[:8]}",
            challengeId=payload.id,
            domain="Urban Development",
            subdomain="Transportation",
            problemType="Traffic Congestion",
            severity="Medium",
            affectedPopulation="Approximately 5,000 daily commuters",
            scale="Neighborhood Level",
            keyFactors=[
                "Peak hour traffic concentration",
                "Suboptimal signal timings",
                "Commercial loading/unloading blocking lanes"
            ],
            missingInformation=[
                "Commuter density during off-peak hours",
                "Public transit frequency and boarding patterns"
            ],
            confidence=0.85
        )
    else:
        return ChallengeAIAnalysis(
            id=f"an_{uuid.uuid4().hex[:8]}",
            challengeId=payload.id,
            domain="Infrastructure",
            subdomain="Utility Management",
            problemType="General Utility Improvement",
            severity="Medium",
            affectedPopulation="Local community members",
            scale="Local Level",
            keyFactors=[
                "Lack of standard infrastructure guidelines",
                "Funding delays"
            ],
            missingInformation=[
                "Full population demographic surveys"
            ],
            confidence=0.75
        )

@app.post("/similarity", response_model=List[SimilarityMatch])
def similarity_search(payload: SimilarityInput):
    text = payload.description.lower()
    
    # If looking at tomato/vegetable spoilage
    if any(keyword in text for keyword in ["tomato", "spoilage", "vegetable", "rot", "cooling", "storage"]):
        matches = []
        # Return the opposite tomato/vegetable challenge if the input is one of them
        if "cooperative" in text or "coop" in text or "vegetable rot" in text:
            # Input is likely the vegetable_rot challenge, return tomato_spoilage as highly similar
            matches.append(SimilarityMatch(challengeId="ch_tomato_spoilage", score=0.86))
        else:
            # Input is likely tomato_spoilage, return vegetable_rot
            matches.append(SimilarityMatch(challengeId="ch_vegetable_rot", score=0.86))
            
        # Also return the self reference with 1.0 if challengeId is provided
        if payload.challengeId:
            matches.append(SimilarityMatch(challengeId=payload.challengeId, score=1.00))
        return matches
        
    return []

@app.post("/gap-analysis", response_model=InnovationGap)
def gap_analysis(payload: GapAnalysisInput):
    text = payload.description.lower()
    
    if any(keyword in text for keyword in ["tomato", "spoilage", "vegetable", "rot", "cooling", "storage"]):
        return InnovationGap(
            id=f"gap_{uuid.uuid4().hex[:8]}",
            challengeId=payload.challengeId,
            gapType="adaptation",
            description="Need for off-grid, low-cost evaporative cooling storage system",
            rationale="Standard electrical refrigeration is not feasible due to power grid unreliability at the market. An adaptation of zero-energy cool chambers (ZECC) is needed.",
            recommendedAction="Design and construct a passive zero-energy evaporative cooling chamber using local materials like clay, bricks, and sand.",
            requiredExpertise=[
                "Evaporative Cooling Systems",
                "Post-Harvest Engineering",
                "Low-Cost Materials Design"
            ],
            confidence=0.88
        )
    elif "traffic" in text or "road" in text or "junction" in text:
        return InnovationGap(
            id=f"gap_{uuid.uuid4().hex[:8]}",
            challengeId=payload.challengeId,
            gapType="technology",
            description="Lack of real-time smart traffic signal coordination",
            rationale="Current timers are static and do not adapt to real-time traffic volumes, causing unnecessary waiting times.",
            recommendedAction="Install smart computer vision cameras and adapt signal phases based on density.",
            requiredExpertise=[
                "Computer Vision",
                "Traffic Engineering",
                "IoT Systems"
            ],
            confidence=0.82
        )
    else:
        return InnovationGap(
            id=f"gap_{uuid.uuid4().hex[:8]}",
            challengeId=payload.challengeId,
            gapType="research",
            description="Undocumented infrastructure system gaps",
            rationale="Requires descriptive primary research to map out historical development patterns.",
            recommendedAction="Conduct field surveys and interviews with local community leaders.",
            requiredExpertise=[
                "Social Research Methods",
                "Rural Sociology"
            ],
            confidence=0.70
        )

@app.post("/matches", response_model=List[UniversityMatch])
def match_universities(payload: MatchesInput):
    text = payload.description.lower()
    
    if any(keyword in text for keyword in ["tomato", "spoilage", "vegetable", "rot", "cooling", "storage"]):
        return [
            UniversityMatch(universityId="uni_agritech", name="State AgriTech University", matchScore=92.4),
            UniversityMatch(universityId="uni_ecoscience", name="Green Valley Eco-Science College", matchScore=78.1),
            UniversityMatch(universityId="uni_metrotech", name="Metro Tech Institute", matchScore=64.2)
        ]
    elif "traffic" in text or "road" in text or "junction" in text:
        return [
            UniversityMatch(universityId="uni_metrotech", name="Metro Tech Institute", matchScore=95.0),
            UniversityMatch(universityId="uni_agritech", name="State AgriTech University", matchScore=52.3),
            UniversityMatch(universityId="uni_ecoscience", name="Green Valley Eco-Science College", matchScore=48.0)
        ]
    else:
        # Generic match list
        return [
            UniversityMatch(universityId="uni_ecoscience", name="Green Valley Eco-Science College", matchScore=70.0),
            UniversityMatch(universityId="uni_agritech", name="State AgriTech University", matchScore=70.0),
            UniversityMatch(universityId="uni_metrotech", name="Metro Tech Institute", matchScore=70.0)
        ]
