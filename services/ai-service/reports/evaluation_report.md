# SIIP Intelligence Evaluation Report

This report presents the performance of the upgraded hybrid domain classification and capability matching pipeline on the evaluation dataset.

## Overall Performance Metrics

* **Domain Classification Accuracy:** 0.9911
* **Macro F1 Score:** 0.9912
* **Multi-Domain Detection Success Rate:** 100.0% (1/1)
* **Hallucination Resistance Rate:** 100.0% (225/225)

## Per-Domain Classification Metrics

| Domain | Precision | Recall | F1-Score | Support |
| :--- | :--- | :--- | :--- | :--- |
| Accessibility | 0.9333 | 1.0000 | 0.9655 | 14.0 |
| Agriculture | 1.0000 | 1.0000 | 1.0000 | 14.0 |
| Community Development | 1.0000 | 1.0000 | 1.0000 | 14.0 |
| Disaster Management | 1.0000 | 1.0000 | 1.0000 | 14.0 |
| Education | 1.0000 | 0.9286 | 0.9630 | 14.0 |
| Energy | 1.0000 | 1.0000 | 1.0000 | 14.0 |
| Environment | 1.0000 | 1.0000 | 1.0000 | 14.0 |
| Healthcare | 1.0000 | 1.0000 | 1.0000 | 14.0 |
| Other | 1.0000 | 1.0000 | 1.0000 | 14.0 |
| Public Administration | 1.0000 | 1.0000 | 1.0000 | 14.0 |
| Public Safety | 1.0000 | 1.0000 | 1.0000 | 14.0 |
| Rural Livelihoods | 1.0000 | 1.0000 | 1.0000 | 14.0 |
| Sanitation | 1.0000 | 1.0000 | 1.0000 | 14.0 |
| Transportation | 1.0000 | 0.9333 | 0.9655 | 15.0 |
| Urban Infrastructure | 0.9333 | 1.0000 | 0.9655 | 14.0 |
| Water Management | 1.0000 | 1.0000 | 1.0000 | 14.0 |

## Evaluation Summary
- **Classifier model loaded successfully:** Yes (`models/domain_classifier.joblib`)
- **Taxonomy keywords verified:** Yes (`app/data/domain_taxonomy.json`)
- **Evaluation suite execution date:** 2026-08-22
