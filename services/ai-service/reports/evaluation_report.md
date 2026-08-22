# SIIP Intelligence Evaluation Report

This report presents the performance of the upgraded hybrid domain classification and capability matching pipeline on the evaluation dataset.

## Overall Performance Metrics

* **Domain Classification Accuracy:** 1.0000
* **Macro F1 Score:** 1.0000
* **Multi-Domain Detection Success Rate:** 100.0% (3/3)
* **Hallucination Resistance Rate:** 100.0% (163/163)

## Per-Domain Classification Metrics

| Domain | Precision | Recall | F1-Score | Support |
| :--- | :--- | :--- | :--- | :--- |
| Accessibility | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Agriculture | 1.0000 | 1.0000 | 1.0000 | 11.0 |
| Community Development | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Disaster Management | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Education | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Energy | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Environment | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Healthcare | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Other | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Public Administration | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Public Safety | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Rural Livelihoods | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Sanitation | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Transportation | 1.0000 | 1.0000 | 1.0000 | 11.0 |
| Urban Infrastructure | 1.0000 | 1.0000 | 1.0000 | 10.0 |
| Water Management | 1.0000 | 1.0000 | 1.0000 | 11.0 |

## Evaluation Summary
- **Classifier model loaded successfully:** Yes (`models/domain_classifier.joblib`)
- **Taxonomy keywords verified:** Yes (`app/data/domain_taxonomy.json`)
- **Evaluation suite execution date:** 2026-08-22
