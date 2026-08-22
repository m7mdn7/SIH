import json
import os

import numpy as np

from app.config import scoring
from app.core.config import settings
from app.core.logging import logger
from app.schemas.models import InnovationGap, UniversityMatch
from app.services.embedding_service import embedding_service


class CapabilityMatchingService:
    def __init__(self):
        self.universities_file = os.path.join(
            settings.DATA_DIR, "universities", "sample_universities.json"
        )
        self.universities = []
        self._load_universities()

    def _load_universities(self):
        if os.path.exists(self.universities_file):
            try:
                with open(self.universities_file, "r", encoding="utf-8") as f:
                    self.universities = json.load(f)
                logger.info(
                    f"[CapabilityMatchingService] Loaded {len(self.universities)} university profiles."
                )
            except Exception as e:
                logger.error(
                    f"[CapabilityMatchingService] Failed to load universities dataset: {e}"
                )
        else:
            logger.warning(
                f"[CapabilityMatchingService] Universities dataset not found at {self.universities_file}"
            )

    def get_cosine_similarity(self, v1: list[float], v2: list[float]) -> float:
        a = np.array(v1)
        b = np.array(v2)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a > 0 and norm_b > 0:
            return float(np.dot(a, b) / (norm_a * norm_b))
        return 0.0

    def find_matches(
        self,
        domain: str,
        description: str,
        gap_analysis: InnovationGap | None = None,
        location_context: str | None = None,
    ) -> list[UniversityMatch]:
        logger.info(
            f"[CapabilityMatchingService] Matching universities for domain: {domain}"
        )

        required_expertise = gap_analysis.requiredExpertise if gap_analysis else []
        recommended_action = gap_analysis.recommendedAction if gap_analysis else ""

        # 1. Compute embeddings for challenge requirements
        req_emb = embedding_service.encode(recommended_action or description)
        desc_emb = embedding_service.encode(description)
        domain_emb = embedding_service.encode(domain)

        matches = []

        for uni in self.universities:
            # A. Domain Match (30% weight)
            domain_score = 0.0
            uni_domains = [d.lower() for d in uni.get("domains", [])]
            if domain.lower() in uni_domains:
                domain_score = 100.0
            else:
                # Semantic domain match
                for d in uni.get("domains", []):
                    d_emb = embedding_service.encode(d)
                    sim = self.get_cosine_similarity(domain_emb, d_emb)
                    if sim >= 0.70:
                        domain_score = max(domain_score, 80.0)

            # B. Expertise Match (25% weight)
            expertise_score = 0.0
            matched_exp = []
            if required_expertise:
                uni_expertise = uni.get("expertise", [])
                uni_exp_embs = [embedding_service.encode(e) for e in uni_expertise]

                match_count = 0
                for req in required_expertise:
                    req_exp_emb = embedding_service.encode(req)
                    best_sim = 0.0
                    best_exp_name = ""
                    for exp_name, exp_emb in zip(uni_expertise, uni_exp_embs):
                        sim = self.get_cosine_similarity(req_exp_emb, exp_emb)
                        if sim > best_sim:
                            best_sim = sim
                            best_exp_name = exp_name

                    if best_sim >= 0.70:
                        match_count += 1
                        matched_exp.append(best_exp_name)

                expertise_score = (match_count / len(required_expertise)) * 100.0

            # C. Department Availability (15% weight)
            dept_score = 0.0
            uni_depts = uni.get("departments", [])
            matched_depts = []
            for dept in uni_depts:
                dept_emb = embedding_service.encode(dept)
                sim = self.get_cosine_similarity(domain_emb, dept_emb)
                if sim >= 0.60:
                    dept_score = 100.0
                    matched_depts.append(dept)

            # UNRELATED FILTER RULE:
            # If domain_score, expertise_score, and dept_score are all 0, skip this university
            if domain_score == 0.0 and expertise_score == 0.0 and dept_score == 0.0:
                continue

            # D. Previous Relevant Projects (15% weight)
            project_score = 0.0
            uni_projects = uni.get("previousProjects", [])
            matched_projects = []
            for proj in uni_projects:
                proj_emb = embedding_service.encode(proj)
                sim = self.get_cosine_similarity(desc_emb, proj_emb)
                if sim >= 0.50:
                    project_score = max(project_score, 100.0 if sim >= 0.60 else 75.0)
                    matched_projects.append(proj)

            # E. Infrastructure Capability (10% weight)
            # Challenge requirements -> semantic comparison -> institution capabilities
            infra_score = 0.0
            uni_infra = uni.get("infrastructure", [])
            matched_infra = []
            for infra in uni_infra:
                infra_emb = embedding_service.encode(infra)
                # Compute similarity between required action/description and facility
                sim = self.get_cosine_similarity(req_emb, infra_emb)
                if sim >= 0.55:
                    infra_score = max(infra_score, 100.0 if sim >= 0.70 else 75.0)
                    matched_infra.append(infra)

            # F. Location / Context Match (5% weight)
            location_score = 0.0
            if location_context and uni.get("locationContext"):
                lc_clean = location_context.strip().lower()
                uni_lc_clean = uni.get("locationContext", "").strip().lower()
                if lc_clean in uni_lc_clean or uni_lc_clean in lc_clean:
                    location_score = 100.0

            # Compute final weighted score
            final_score = (
                domain_score * (scoring.MATCH_WEIGHT_DOMAIN / 100.0)
                + expertise_score * (scoring.MATCH_WEIGHT_EXPERTISE / 100.0)
                + dept_score * (scoring.MATCH_WEIGHT_DEPARTMENT / 100.0)
                + project_score * (scoring.MATCH_WEIGHT_PROJECT / 100.0)
                + infra_score * (scoring.MATCH_WEIGHT_INFRASTRUCTURE / 100.0)
                + location_score * (scoring.MATCH_WEIGHT_LOCATION / 100.0)
            )

            # Generate reasons
            reasons = []
            if domain_score > 0:
                reasons.append(f"Strong match for the {domain} domain")
            if matched_exp:
                reasons.append(
                    f"Expertise in: {', '.join(list(dict.fromkeys(matched_exp)))}"
                )
            if matched_depts:
                reasons.append(
                    f"Departments present: {', '.join(list(dict.fromkeys(matched_depts)))}"
                )
            if matched_projects:
                reasons.append(
                    f"Relevant past work: {', '.join(list(dict.fromkeys(matched_projects))[:2])}"
                )
            if matched_infra:
                reasons.append(
                    f"Specialized facilities: {', '.join(list(dict.fromkeys(matched_infra))[:2])}"
                )
            if location_score > 0:
                reasons.append(
                    f"Located in the target {uni.get('locationContext')} region"
                )

            # Determine Match Tier
            if final_score >= 70.0:
                tier = "strong"
            elif final_score >= 50.0:
                tier = "good"
            elif final_score >= 30.0:
                tier = "potential"
            else:
                tier = "weak"

            explain_meta = {
                "domainScore": round(
                    domain_score * (scoring.MATCH_WEIGHT_DOMAIN / 100.0), 1
                ),
                "expertiseScore": round(
                    expertise_score * (scoring.MATCH_WEIGHT_EXPERTISE / 100.0), 1
                ),
                "departmentScore": round(
                    dept_score * (scoring.MATCH_WEIGHT_DEPARTMENT / 100.0), 1
                ),
                "projectScore": round(
                    project_score * (scoring.MATCH_WEIGHT_PROJECT / 100.0), 1
                ),
                "infrastructureScore": round(
                    infra_score * (scoring.MATCH_WEIGHT_INFRASTRUCTURE / 100.0), 1
                ),
                "locationScore": round(
                    location_score * (scoring.MATCH_WEIGHT_LOCATION / 100.0), 1
                ),
                "finalScore": round(final_score, 1),
            }

            matches.append(
                UniversityMatch(
                    universityId=uni.get("id"),
                    name=uni.get("name"),
                    matchScore=round(final_score, 1),
                    reasons=reasons,
                    explainability=explain_meta,
                    matchTier=tier,
                )
            )

        # Sort matches in descending order of matchScore
        matches.sort(key=lambda x: x.matchScore, reverse=True)

        # Apply minimum match score filter
        has_relying_matches = any(
            m.matchScore >= scoring.MIN_MATCH_SCORE for m in matches
        )
        if has_relying_matches:
            matches = [m for m in matches if m.matchScore >= scoring.MIN_MATCH_SCORE]
        else:
            # Fallback
            matches = matches[:3]
            for m in matches:
                m.reasons.append("Low confidence / limited institutional match")

        return matches


capability_matching_service = CapabilityMatchingService()
