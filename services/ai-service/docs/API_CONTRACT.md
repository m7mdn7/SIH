# SIIP AI API Contract

This document outlines the JSON request and response shapes exposed by the AI service endpoints.

## 1. POST `/analyze`
Used to extract domains, severity, and missing details from a challenge.

### Request Body
```json
{
  "id": "ch_tomato_spoilage",
  "title": "Tomato spoilage at North Mandi Market",
  "description": "Farmers lose massive quantities of fresh tomatoes daily due to lack of cold storage..."
}
```

### Response Body
```json
{
  "id": "an_93fa88ea",
  "challengeId": "ch_tomato_spoilage",
  "domain": "Agriculture",
  "subdomain": "Post-Harvest Management",
  "problemType": "Food Spoilage and Storage",
  "severity": "high",
  "affectedPopulation": "Approximately 150 local mandi vendors and 2,000 daily consumers",
  "scale": "village",
  "keyFactors": [
    "Lack of passive cooling storage",
    "Extreme afternoon temperatures"
  ],
  "missingInformation": [
    "Daily volume of surplus crop supply"
  ],
  "confidence": 0.94
}
```

---

## 2. POST `/similarity`
Performs hybrid semantic search against local database challenges.

### Request Body
```json
{
  "challengeId": "optional-id",
  "title": "Vegetable rot at coop",
  "description": "Vegetables spoil due to lack of cold storage.",
  "domain": "Agriculture",
  "limit": 10
}
```

### Response Body
```json
[
  {
    "challengeId": "ch_tomato_spoilage",
    "score": 0.6104,
    "relationship": "related"
  }
]
```

---

## 3. POST `/gap-analysis`
Performs innovation gap classification.

### Request Body
```json
{
  "challengeId": "ch_tomato_spoilage",
  "description": "Farmers lose fresh tomatoes daily due to lack of cold storage.",
  "aiAnalysis": null
}
```

### Response Body
```json
{
  "id": "gap_83a12b",
  "challengeId": "ch_tomato_spoilage",
  "gapType": "adaptation",
  "description": "Need for off-grid, low-cost evaporative cooling storage system.",
  "rationale": "Standard refrigeration is not viable due to grid unreliability.",
  "recommendedAction": "Design zero-energy evaporative cooling chambers utilizing clay and sand.",
  "requiredExpertise": [
    "Thermal Engineering",
    "Mechanical Engineering",
    "Agricultural Engineering"
  ],
  "confidence": 0.87
}
```

---

## 4. POST `/matches`
Matches challenges to university expertise.

### Request Body
```json
{
  "challengeId": "ch_tomato_spoilage",
  "description": "Farmers lose tomatoes due to lack of cold storage.",
  "gapAnalysis": {
    "requiredExpertise": ["Agricultural Engineering", "Thermal Engineering"]
  }
}
```

### Response Body
```json
[
  {
    "universityId": "uni_agritech",
    "name": "State AgriTech University",
    "matchScore": 92.4,
    "reasons": [
      "Strong match for the Agriculture domain",
      "Expertise in: Agricultural Engineering",
      "Specialized facilities: Cold Storage Prototype Lab"
    ]
  }
]
```
