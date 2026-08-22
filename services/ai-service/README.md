# SIIP AI/ML Service

The intelligence and structured reasoning layer for the Societal Innovation Intelligence Platform (SIIP).

## Features
- **Challenge Analysis**: Categorize challenges into 10 controlled domains, extract severity, affected populations, scale, and missing factors.
- **Semantic Embedding & Similarity**: Compute unit-normalized embeddings via `all-MiniLM-L6-v2` locally and detect duplicates/related challenges.
- **Clustering**: Group challenges dynamically using custom DBSCAN.
- **Innovation Gap Discovery**: Classify issues into 5 gap types and extract required expertise.
- **Fuzzy Normalization**: Clean required expertise tags using RapidFuzz matching.
- **University Matching**: Deterministic weighted scoring to match challenges to departments and specialized facilities.

---

## Setup & Python Environment

1. Navigate to the AI service directory:
   ```bash
   cd services/ai-service
   ```

2. Create virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate virtual environment:
   - **Windows PowerShell**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - **Linux/macOS**:
     ```bash
     source .venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt -r requirements-dev.txt
   ```

5. Configure environment files:
   ```bash
   cp .env.example .env
   ```

---

## Running the Server

Start the Uvicorn development server:
```bash
uvicorn app.main:app --reload --port 8000
```
API docs are available at `http://localhost:8000/docs`.

---

## Running Scripts

- **Seed Data Generation**:
  ```bash
  python -m scripts.bootstrap_data
  ```

- **Challenge Clustering**:
  ```bash
  python -m scripts.cluster_challenges
  ```

- **Evaluation Suite**:
  ```bash
  python -m scripts.evaluate_analysis
  ```
  ```bash
  python -m scripts.evaluate_similarity
  ```
  ```bash
  python -m scripts.evaluate_gap_analysis
  ```

- **Optional Embedding Fine-Tuning**:
  ```bash
  python -m scripts.train_embedding_model --epochs 1
  ```

---

## Running Tests

Run the test suite:
```bash
python -m pytest
```

---

## Switching LLM Providers

By default, `LLM_PROVIDER` is set to `mock` in `.env`, which executes locally without any internet connection. 

To use OpenAI:
1. Set `LLM_PROVIDER=openai` in `.env`.
2. Add your API key: `OPENAI_API_KEY=your-api-key-here`.
3. (Optional) Tune model name: `OPENAI_MODEL=gpt-4o-mini`.
