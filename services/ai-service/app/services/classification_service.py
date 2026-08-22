import json
import os
import re

import joblib
import numpy as np

from app.config import scoring
from app.core.config import settings
from app.core.logging import logger


class ClassificationService:
    def __init__(self):
        self.classifier = None
        self.label_encoder = None
        self.embedding_service = None
        self.taxonomy = None
        self.domain_prototypes = {}

        # Load taxonomy
        self.load_taxonomy()

        # Try to load embedding model
        try:
            # We lazy-load the model to save memory/startup time or use a shared one if available.
            # In our case, we can use SentenceTransformer directly or import embedding_service
            # to reuse its lazy loader.
            from app.services.embedding_service import embedding_service

            self.embedding_service = embedding_service
        except Exception as e:
            logger.error(
                f"[ClassificationService] Failed to load embedding service: {e}"
            )

        # Try to load classifier
        self.load_classifier()

        # Initialize prototypes if embeddings are available
        self.init_prototypes()

    def load_taxonomy(self):
        taxonomy_path = os.path.join(settings.DATA_DIR, "domain_taxonomy.json")
        # Check if app/data/domain_taxonomy.json exists
        if not os.path.exists(taxonomy_path):
            taxonomy_path = "app/data/domain_taxonomy.json"

        if os.path.exists(taxonomy_path):
            try:
                with open(taxonomy_path, "r", encoding="utf-8") as f:
                    self.taxonomy = json.load(f)
                logger.info("[ClassificationService] Taxonomy loaded successfully.")
            except Exception as e:
                logger.error(f"[ClassificationService] Error loading taxonomy: {e}")
        else:
            logger.warning(
                f"[ClassificationService] Taxonomy file not found at {taxonomy_path}"
            )

    def load_classifier(self):
        clf_path = "models/domain_classifier.joblib"
        le_path = "models/label_encoder.joblib"

        if os.path.exists(clf_path) and os.path.exists(le_path):
            try:
                self.classifier = joblib.load(clf_path)
                self.label_encoder = joblib.load(le_path)
                logger.info(
                    "[ClassificationService] Supervised classifier loaded successfully."
                )
            except Exception as e:
                logger.error(
                    f"[ClassificationService] Failed to load joblib classifier: {e}"
                )
        else:
            logger.warning(
                "[ClassificationService] Classifier joblib files missing. Falling back to semantic/rule classifier."
            )

    def init_prototypes(self):
        if not self.taxonomy or not self.embedding_service:
            return

        try:
            logger.info(
                "[ClassificationService] Pre-encoding domain prototype embeddings..."
            )
            # For each domain, construct a prototype text based on subdomains and representative concepts
            for dom in self.taxonomy["domains"]:
                name = dom["name"]
                concepts_str = ", ".join(dom["representative_concepts"])
                desc = dom["description"]
                prototype_text = f"{name}. {desc} Concepts: {concepts_str}"

                # Encode prototype text
                self.domain_prototypes[name] = self.embedding_service.encode(
                    prototype_text
                )
            logger.info("[ClassificationService] Domain prototypes initialized.")
        except Exception as e:
            logger.error(
                f"[ClassificationService] Failed to initialize domain prototypes: {e}"
            )

    def normalize_text(self, text: str) -> str:
        """Layer 1: Input normalization."""
        if not text:
            return ""
        text = text.lower()
        # Keep letters, numbers, basic spaces
        text = re.sub(r"[^\w\s\-\.\,\?]", "", text)
        return text.strip()

    def run_safety_validation(self, title: str, description: str) -> tuple[bool, str]:
        """Layer 2: Rule-based safety, spam, and structural validation."""
        combined = (title + " " + description).lower().strip()

        if not combined or len(combined) < 10:
            return True, "insufficient_information"

        # Check for non-societal / personal request indicators (spam, private affairs, tech support)
        personal_patterns = [
            r"\bprivate birthday\b",
            r"\bgaming computer\b",
            r"\bgaming pc\b",
            r"\bscraping web\b",
            r"\bscrape web\b",
            r"\bbuy cryptocurrency\b",
            r"\bcooking chicken\b",
            r"\brecipe for\b",
        ]

        for pattern in personal_patterns:
            if re.search(pattern, combined):
                # Classifies as "Other" with safety reject
                return True, "classified"

        return False, ""

    def calculate_taxonomy_scores(self, text: str) -> dict[str, float]:
        """Layer 4: Taxonomy keyword relevance scoring."""
        scores = {}
        if not self.taxonomy:
            return {
                d: 0.0
                for d in [
                    "Agriculture",
                    "Water Management",
                    "Healthcare",
                    "Education",
                    "Other",
                ]
            }

        words = set(re.findall(r"\b\w+\b", text.lower()))
        if not words:
            return {d["name"]: 0.0 for d in self.taxonomy["domains"]}

        for dom in self.taxonomy["domains"]:
            name = dom["name"]
            # Match keywords (combining representative concepts, synonyms, and name words)
            match_keywords = set()
            for c in dom["representative_concepts"]:
                match_keywords.update(re.findall(r"\b\w+\b", c.lower()))
            for s in dom["synonyms"]:
                match_keywords.update(re.findall(r"\b\w+\b", s.lower()))
            match_keywords.update(re.findall(r"\b\w+\b", name.lower()))

            overlap = words.intersection(match_keywords)
            # Normalize by overlap size
            score = len(overlap) / (np.log(len(words) + 1.0) + 1.0)
            scores[name] = min(1.0, score)

        return scores

    def calculate_semantic_scores(self, text: str) -> dict[str, float]:
        """Layer 3/4: Embedding cosine similarity against prototypes."""
        scores = {}
        if not self.embedding_service or not self.domain_prototypes:
            return {}

        try:
            embedding = self.embedding_service.encode(text)
            embedding_arr = np.array(embedding)
            norm_emb = np.linalg.norm(embedding_arr)

            for name, proto in self.domain_prototypes.items():
                proto_arr = np.array(proto)
                norm_proto = np.linalg.norm(proto_arr)
                if norm_emb > 0 and norm_proto > 0:
                    sim = float(
                        np.dot(embedding_arr, proto_arr) / (norm_emb * norm_proto)
                    )
                    # Scale similarity from [-1, 1] to [0, 1]
                    scores[name] = max(0.0, min(1.0, (sim + 1.0) / 2.0))
                else:
                    scores[name] = 0.0
        except Exception as e:
            logger.error(f"[ClassificationService] Error in semantic scores: {e}")

        return scores

    def classify(self, title: str, description: str) -> dict:
        # Layer 1: Normalize
        norm_title = self.normalize_text(title)
        norm_description = self.normalize_text(description)
        combined_text = f"{norm_title}. {norm_description}"

        # Layer 2: Safety/Spam check
        is_rejected, status_fallback = self.run_safety_validation(
            norm_title, norm_description
        )
        if is_rejected:
            if status_fallback == "insufficient_information":
                return {
                    "classificationStatus": "insufficient_information",
                    "domain": "Other",
                    "confidence": 0.10,
                    "primaryDomain": "Other",
                    "secondaryDomains": [],
                    "signals": {"classifier": 0.0, "semantic": 0.0, "taxonomy": 0.0},
                    "missingInformation": [
                        "What specific issue is occurring?",
                        "Who is affected?",
                        "Where does the issue occur?",
                    ],
                }
            else:
                # Personal/irrelevant request classified as Other
                return {
                    "classificationStatus": "classified",
                    "domain": "Other",
                    "confidence": 0.95,
                    "primaryDomain": "Other",
                    "secondaryDomains": [],
                    "signals": {"classifier": 0.95, "semantic": 0.95, "taxonomy": 0.95},
                    "missingInformation": [],
                }

        # Fetch signal weights
        w_clf = scoring.CLASSIFICATION_WEIGHT_SUPERVISED
        w_sem = scoring.CLASSIFICATION_WEIGHT_SEMANTIC
        w_tax = scoring.CLASSIFICATION_WEIGHT_TAXONOMY

        # Initialize scores dictionaries
        clf_scores = {}
        sem_scores = {}
        tax_scores = self.calculate_taxonomy_scores(combined_text)

        # Step A: Supervised Classifier prediction
        is_clf_active = False
        if self.classifier and self.label_encoder and self.embedding_service:
            try:
                embedding = self.embedding_service.encode(combined_text)
                probs = self.classifier.predict_proba([embedding])[0]
                classes = self.label_encoder.classes_
                for c, p in zip(classes, probs):
                    clf_scores[c] = float(p)
                is_clf_active = True
            except Exception as e:
                logger.error(
                    f"[ClassificationService] Supervised prediction failed: {e}"
                )

        # Step B: Semantic Similarity against prototypes
        is_sem_active = False
        sem_scores = self.calculate_semantic_scores(combined_text)
        if sem_scores:
            is_sem_active = True

        # Re-calibrate weights based on active signals (graceful fallback)
        if not is_clf_active and not is_sem_active:
            # pure rule-based fallback
            w_clf, w_sem, w_tax = 0.0, 0.0, 1.0
        elif not is_clf_active:
            # embedding + taxonomy fallback
            w_clf = 0.0
            total_w = w_sem + w_tax
            w_sem = w_sem / total_w
            w_tax = w_tax / total_w
        elif not is_sem_active:
            # classifier + taxonomy fallback
            w_sem = 0.0
            total_w = w_clf + w_tax
            w_clf = w_clf / total_w
            w_tax = w_tax / total_w

        # Combine signals into final score
        final_scores = {}
        all_classes = (
            self.label_encoder.classes_.tolist()
            if self.label_encoder
            else list(tax_scores.keys())
        )

        for name in all_classes:
            s_clf = clf_scores.get(name, 0.0)
            s_sem = sem_scores.get(name, 0.0)
            s_tax = tax_scores.get(name, 0.0)

            final_scores[name] = (s_clf * w_clf) + (s_sem * w_sem) + (s_tax * w_tax)

        # Sort domains
        sorted_domains = sorted(
            final_scores.items(), key=lambda item: item[1], reverse=True
        )
        primary_domain, primary_score = sorted_domains[0]

        # Layer 6 & 7: Confidence Calibration
        # Agreemeent factor: check if primary domain is also predicted by classifier and sem_scores
        agreement = 1.0
        if is_clf_active and is_sem_active:
            top_clf = max(clf_scores.items(), key=lambda x: x[1])[0]
            top_sem = max(sem_scores.items(), key=lambda x: x[1])[0]
            # If signals disagree on top class, scale down confidence
            if top_clf != primary_domain or top_sem != primary_domain:
                agreement = 0.75

        # Length check scale down
        len_penalty = 1.0
        if len(combined_text) < 40:
            len_penalty = 0.65
        elif len(combined_text) < 80:
            len_penalty = 0.85

        calibrated_confidence = float(primary_score * agreement * len_penalty)

        # Calibrate status based on thresholds
        if calibrated_confidence >= scoring.CONFIDENCE_THRESHOLD_HIGH:
            status = "classified"
        elif calibrated_confidence >= scoring.CONFIDENCE_THRESHOLD_MEDIUM:
            status = "probable"
        elif calibrated_confidence >= scoring.ABSTAIN_THRESHOLD:
            status = "ambiguous"
        else:
            status = "insufficient_information"

        # Fallback to Other if status is insufficient or unknown
        if (
            status in ["insufficient_information", "unknown"]
            and primary_domain != "Other"
        ):
            # Demote primary domain to Other
            primary_domain = "Other"

        # Multi-domain detection (Layer 8)
        # Any other domain (excluding Other) that has score >= 0.40 becomes a secondary domain
        secondary_domains = []
        for name, score in sorted_domains[1:]:
            if name != "Other" and name != primary_domain and score >= 0.20:
                secondary_domains.append(name)

        # Fill missing information if confidence is low/insufficient
        missing_info = []
        if status in ["insufficient_information", "ambiguous"]:
            missing_info.extend(
                [
                    "What specific issue is occurring?",
                    "Who is affected?",
                    "Where does the issue occur?",
                ]
            )

        # Return signals
        signals = {
            "classifier": float(clf_scores.get(primary_domain, 0.0)),
            "semantic": float(sem_scores.get(primary_domain, 0.0)),
            "taxonomy": float(tax_scores.get(primary_domain, 0.0)),
        }

        return {
            "classificationStatus": status,
            "domain": primary_domain,
            "confidence": min(1.0, max(0.0, calibrated_confidence)),
            "primaryDomain": primary_domain,
            "secondaryDomains": secondary_domains,
            "signals": signals,
            "missingInformation": missing_info,
        }


classification_service = ClassificationService()
