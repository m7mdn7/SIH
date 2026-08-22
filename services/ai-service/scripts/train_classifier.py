import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import joblib
from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

from app.core.config import settings


def train():
    print("==================================================")
    print("Training SIIP Domain Classifier Model")
    print("==================================================")

    # 1. Load train dataset
    train_path = "data/training/train_dataset.json"
    if not os.path.exists(train_path):
        raise FileNotFoundError(
            f"Train dataset not found at {train_path}. Run generate_training_data.py first."
        )

    with open(train_path, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    print(f"Loaded {len(dataset)} examples for training.")

    descriptions = []
    labels = []

    for x in dataset:
        # Combine title and description to enrich input content
        text = f"{x['title']}. {x['description']}"
        descriptions.append(text)
        labels.append(x["domain"])

    # 2. Encode labels
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(labels)

    # 3. Load embedding model and extract features
    print(f"Loading SentenceTransformer model: {settings.EMBEDDING_MODEL}")
    embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)

    print(
        "Extracting sentence embeddings for training data (this may take a few seconds)..."
    )
    X = embedding_model.encode(
        descriptions, show_progress_bar=True, convert_to_numpy=True
    )
    print(f"Extracted feature matrix shape: {X.shape}")

    # 4. Train Logistic Regression classifier
    print("Training LogisticRegression classifier...")
    # C=1.0, multi_class='multinomial', max_iter=1000
    clf = LogisticRegression(C=2.0, max_iter=1000, random_state=42)
    clf.fit(X, y)

    # Evaluate self accuracy
    train_acc = clf.score(X, y)
    print(f"Training set accuracy: {train_acc:.4f}")

    # 5. Persist artifacts
    os.makedirs("models", exist_ok=True)

    classifier_path = "models/domain_classifier.joblib"
    label_encoder_path = "models/label_encoder.joblib"
    metadata_path = "models/classifier_metadata.json"

    joblib.dump(clf, classifier_path)
    joblib.dump(label_encoder, label_encoder_path)

    import datetime

    import numpy as np
    import pydantic
    import sentence_transformers
    import sklearn
    from sklearn.metrics import confusion_matrix

    # Compute training confusion matrix
    y_pred = clf.predict(X)
    cm = confusion_matrix(y, y_pred)

    metadata = {
        "modelVersion": "1.0.0",
        "datasetVersion": "v2",
        "taxonomyVersion": "v1",
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "embedding_model": settings.EMBEDDING_MODEL,
        "classes": label_encoder.classes_.tolist(),
        "trainingConfig": {
            "classifier": "LogisticRegression",
            "C": 2.0,
            "max_iter": 1000,
            "random_state": 42,
        },
        "libraryVersions": {
            "python": sys.version,
            "joblib": joblib.__version__,
            "scikit-learn": sklearn.__version__,
            "sentence-transformers": sentence_transformers.__version__,
            "numpy": np.__version__,
            "pydantic": pydantic.__version__,
        },
        "metrics": {
            "training_accuracy": float(train_acc),
            "num_training_samples": len(dataset),
            "feature_dimension": int(X.shape[1]),
            "confusion_matrix": cm.tolist(),
        },
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("Artifacts successfully saved:")
    print(f"  - Classifier: {classifier_path}")
    print(f"  - Label Encoder: {label_encoder_path}")
    print(f"  - Metadata: {metadata_path}")
    print("==================================================")


if __name__ == "__main__":
    train()
