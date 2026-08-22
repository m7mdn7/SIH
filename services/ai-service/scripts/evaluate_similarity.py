import os
import json
from app.services.embedding_service import embedding_service
from app.services.similarity_service import similarity_service
from app.core.config import settings

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    test_file = os.path.join(base_dir, "data", "evaluation", "similarity_test_cases.json")
    
    if not os.path.exists(test_file):
        print(f"Test cases file not found at {test_file}")
        return
        
    with open(test_file, 'r', encoding='utf-8') as f:
        cases = json.load(f)
        
    print("==================================================")
    print("Evaluating Challenge Semantic Similarity Metrics")
    print("==================================================")
    print(f"Dataset Size: {len(cases)} pairs")
    print(f"Embedding Model: {settings.EMBEDDING_MODEL}")
    print(f"Duplicate Threshold: {settings.SIMILARITY_DUPLICATE_THRESHOLD}")
    print(f"Related Threshold  : {settings.SIMILARITY_RELATED_THRESHOLD}\n")

    tp = 0  # True Positives
    fp = 0  # False Positives
    fn = 0  # False Negatives
    tn = 0  # True Negatives

    for idx, case in enumerate(cases):
        ch_a = case["challengeA"]
        ch_b = case["challengeB"]
        true_label = case["label"]  # 'duplicate', 'related', or 'unrelated'

        rep_a = embedding_service.get_challenge_text_representation(ch_a["title"], ch_a["description"], ch_a.get("domain"))
        rep_b = embedding_service.get_challenge_text_representation(ch_b["title"], ch_b["description"], ch_b.get("domain"))
        
        vec_a = embedding_service.encode(rep_a)
        vec_b = embedding_service.encode(rep_b)
        
        sim = similarity_service.get_cosine_similarity(vec_a, vec_b)
        hybrid_score = similarity_service.calculate_hybrid_score(sim, ch_a.get("domain"), ch_b.get("domain"), None, None)

        # Classification prediction
        if hybrid_score >= settings.SIMILARITY_DUPLICATE_THRESHOLD:
            pred_label = "duplicate"
        elif hybrid_score >= settings.SIMILARITY_RELATED_THRESHOLD:
            pred_label = "related"
        else:
            pred_label = "unrelated"

        # Check binary performance (Positive = duplicate/related, Negative = unrelated)
        true_is_pos = true_label in ["duplicate", "related"]
        pred_is_pos = pred_label in ["duplicate", "related"]

        status = ""
        if true_is_pos and pred_is_pos:
            tp += 1
            status = "TP"
        elif not true_is_pos and pred_is_pos:
            fp += 1
            status = "FP"
        elif true_is_pos and not pred_is_pos:
            fn += 1
            status = "FN"
        else:
            tn += 1
            status = "TN"

        print(f"Pair #{idx+1}: A='{ch_a['title']}' | B='{ch_b['title']}'")
        print(f"  Similarity Score: {sim:.4f} | Hybrid Score: {hybrid_score:.4f}")
        print(f"  Ground Truth: {true_label:<10} | Prediction: {pred_label:<10} | [{status}]")
        print("-" * 60)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

    print("\nSimilarity Evaluation Summary:")
    print(f"True Positives  : {tp}")
    print(f"False Positives : {fp}")
    print(f"False Negatives : {fn}")
    print(f"True Negatives  : {tn}")
    print(f"Precision       : {precision*100:.1f}%")
    print(f"Recall          : {recall*100:.1f}%")
    print(f"F1-Score        : {f1*100:.1f}%")

if __name__ == "__main__":
    main()
