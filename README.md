# code-plagiarism-visualizer
"A full-stack web application for detecting code plagiarism using TF-IDF, Cosine Similarity, and Sequence Matching"
# Plag Detector

An advanced, full-stack code plagiarism detection application. It uses a custom obfuscation-resistant algorithm to tokenize source code and mathematically determine similarity using NLP models (TF-IDF and Cosine Similarity).

## Features
- **Obfuscation-Resistant Algorithm**: Normalizes source code by stripping formatting, converting string literals, and removing comments to catch cheating even if students rename variables.
- **Mathematical Similarity Matrix**: Uses `scikit-learn` to build a document matrix and determine an overarching percentage of structural copying.
- **Flagged Pairs Detection**: Extracts exact matching n-gram chunks from both documents so you can see exactly *which* parts of the code were lifted.
- **Premium Glassmorphism UI**: Beautiful, lightweight Vanilla CSS frontend with a zero-dependency architecture.

## Tech Stack
- **Frontend**: Vanilla HTML/JS/CSS (No Node.js or Webpack required)
- **Backend**: Python 3, FastAPI, Uvicorn
- **Machine Learning / NLP**: Scikit-learn, Numpy

## Quickstart

This application is designed to be plug-and-play.

1. Ensure you have Python installed.
2. Run the startup script:
   ```bash
   run.bat
   ```
3. The script will automatically install necessary dependencies and launch the clean user interface in your web browser. 

## Structure
- `backend/main.py`: API Server
- `backend/plag_detector.py`: Core tokenization and Cosine Similarity equations.
- `frontend/`: UI Code and styling.
