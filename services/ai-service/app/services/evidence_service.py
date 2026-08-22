import re


class EvidenceService:
    def __init__(self):
        pass

    def extract_evidence(self, title: str, description: str, domain: str) -> dict:
        """
        Layer 7: Evidence extraction and claim validation.
        Separates statements into:
        - SUPPORTED_FACT
        - INFERENCE
        - HYPOTHESIS
        - UNKNOWN
        """
        combined = f"{title}. {description}"
        sentences = [s.strip() for s in re.split(r"[.!?]", combined) if s.strip()]

        supported_facts = []
        inferences = []
        hypotheses = []
        unknowns = []

        # 1. Base Unknowns by Domain (from known missing factors)
        unknowns.append("Exact count of affected stakeholders")
        unknowns.append("Historical baseline data metrics")

        if domain == "Agriculture":
            unknowns.append("Electricity availability and reliability")
            unknowns.append("Quantity of crop produce lost")
            unknowns.append("Local environmental and climate conditions")
        elif domain == "Water Management":
            unknowns.append("Source and concentration of chemical contaminants")
            unknowns.append("Current community water purification status")
            unknowns.append("Borewell and groundwater extraction statistics")
        elif domain == "Urban Infrastructure" or domain == "Transportation":
            unknowns.append("Traffic volume and timing configurations")
            unknowns.append("Alternative transit route availability")
        elif domain == "Healthcare":
            unknowns.append("Exact pathogen/disease test statistics")
            unknowns.append("Local healthcare staff capacity")
        else:
            unknowns.append("Local operational constraints")

        # 2. Extract facts and inferences using causal keyword splitters
        # e.g., "Farmers lose tomatoes because affordable cold storage is unavailable."
        for sentence in sentences:
            # Look for causal connectors
            match = re.search(
                r"\b(because|due to|since|leads to|causing|causes|resulting in|so that)\b",
                sentence,
                re.IGNORECASE,
            )
            if match:
                connector = match.group(1).lower()
                parts = sentence.split(match.group(0))
                part_a = parts[0].strip()
                part_b = parts[1].strip() if len(parts) > 1 else ""

                # Format A and B as facts
                if part_a:
                    # Clean up grammar/capitalization
                    fact_a = part_a[0].upper() + part_a[1:]
                    if not fact_a.endswith("."):
                        fact_a += "."
                    supported_facts.append(fact_a)
                if part_b:
                    fact_b = part_b[0].upper() + part_b[1:]
                    if not fact_b.endswith("."):
                        fact_b += "."
                    supported_facts.append(fact_b)

                # Build inference
                if part_a and part_b:
                    if connector in ["because", "due to", "since"]:
                        inferences.append(
                            f"{part_b.capitalize()} may be a contributing factor to {part_a.lower()}."
                        )
                    else:
                        inferences.append(
                            f"{part_a.capitalize()} may lead to {part_b.lower()}."
                        )
            else:
                # Add sentence as a supported fact
                fact = sentence[0].upper() + sentence[1:]
                if not fact.endswith("."):
                    fact += "."
                if any(
                    w in fact.lower()
                    for w in [
                        "might",
                        "may",
                        "could",
                        "possibly",
                        "hypothesis",
                        "assume",
                        "perhaps",
                    ]
                ):
                    hypotheses.append(fact)
                else:
                    supported_facts.append(fact)

        # 3. Add default hypothesis if none found
        if not hypotheses:
            if domain == "Agriculture":
                hypotheses.append(
                    "Existing storage solutions may be financially inaccessible."
                )
            elif domain == "Water Management":
                hypotheses.append(
                    "Contamination may originate from geological formations or nearby agricultural runoff."
                )
            elif domain == "Education":
                hypotheses.append("Lack of resources might be causing dropouts.")
            else:
                hypotheses.append(
                    "Local constraints might be hindering infrastructure development."
                )

        # 4. Remove duplicate entries
        supported_facts = list(dict.fromkeys(supported_facts))
        inferences = list(dict.fromkeys(inferences))
        hypotheses = list(dict.fromkeys(hypotheses))
        unknowns = list(dict.fromkeys(unknowns))

        return {
            "supported_facts": supported_facts,
            "inferences": inferences,
            "hypotheses": hypotheses,
            "unknowns": unknowns,
        }


evidence_service = EvidenceService()
