import argparse
import os

from sentence_transformers import InputExample, SentenceTransformer, losses
from torch.utils.data import DataLoader

from app.core.config import settings


def main():
    parser = argparse.ArgumentParser(
        description="Fine-tune sentence-transformers model on labeled pairs"
    )
    parser.add_argument(
        "--epochs", type=int, default=1, help="Number of training epochs"
    )
    parser.add_argument(
        "--batch_size", type=int, default=4, help="Batch size for training"
    )
    parser.add_argument(
        "--output_path",
        type=str,
        default="./models/siip-model-tuned",
        help="Output path for tuned model",
    )
    args = parser.parse_args()

    print("==================================================")
    print("SIIP Embedding Model Fine-Tuning Script")
    print("==================================================")
    print(f"Base Model  : {settings.EMBEDDING_MODEL}")
    print(f"Epochs      : {args.epochs}")
    print(f"Batch Size  : {args.batch_size}")
    print(f"Output Path : {args.output_path}\n")

    # 1. Synthesize small prototype dataset of labeled pairs
    # In a real environment, these would be loaded from a dataset file
    train_examples = [
        # Positive Pairs (duplicates or strongly related)
        InputExample(
            texts=[
                "Farmers lose tomatoes due to lack of cold storage.",
                "Tomatoes spoil because farmers lack cold storage.",
            ],
            label=0.95,
        ),
        InputExample(
            texts=[
                "Agricultural fertilizer runoff polluting village drinking wells.",
                "High nitrate contamination in community wells.",
            ],
            label=0.90,
        ),
        InputExample(
            texts=[
                "Traffic gridlock at Metro Station Circle.",
                "Congestion and signal delay at metro boarding hub.",
            ],
            label=0.85,
        ),
        # Negative Pairs (completely unrelated)
        InputExample(
            texts=[
                "Farmers lose tomatoes due to lack of cold storage.",
                "High nitrate contamination in community wells.",
            ],
            label=0.15,
        ),
        InputExample(
            texts=[
                "Traffic gridlock at Metro Station Circle.",
                "Agricultural fertilizer runoff polluting village drinking wells.",
            ],
            label=0.10,
        ),
        InputExample(
            texts=[
                "Farmers lose tomatoes due to lack of cold storage.",
                "Traffic gridlock at Metro Station Circle.",
            ],
            label=0.05,
        ),
    ]

    # 2. Setup DataLoader
    train_dataloader = DataLoader(
        train_examples, shuffle=True, batch_size=args.batch_size
    )

    # 3. Load base model
    print("Loading base model...")
    model = SentenceTransformer(settings.EMBEDDING_MODEL)

    # 4. Use CosineSimilarityLoss since we have float similarity labels
    train_loss = losses.CosineSimilarityLoss(model=model)

    # 5. Fit the model
    print("Starting training...")
    os.makedirs(os.path.dirname(args.output_path), exist_ok=True)

    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=args.epochs,
        warmup_steps=10,
        output_path=args.output_path,
    )

    print(f"\nModel training complete! Tuned weights saved to: {args.output_path}")
    print(
        "To use the tuned model, set EMBEDDING_MODEL in your .env to the output path."
    )


if __name__ == "__main__":
    main()
