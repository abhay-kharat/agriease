# Agriease AI Backend - Architecture

**Date:** 2026-05-27

## Executive Summary

The AI Backend of Agriease is a specialized microservice designed to provide high-accuracy plant disease detection. It leverages a Convolutional Neural Network (CNN) model trained on a large dataset of plant leaves to identify diseases and provide immediate treatment recommendations.

## Technology Stack

- **Framework**: Flask 1.1.2
- **Language**: Python 3.8+
- **AI/ML Library**: PyTorch 1.8.1, Torchvision 0.9.1
- **Data Analysis**: Pandas, Numpy
- **Image Processing**: PIL (Pillow)
- **Deployment**: Gunicorn

## Architecture Pattern: RESTful AI Service

The service is designed as a standalone inference engine:

1.  **API Interface**: Flask routes expose endpoints for single-image predictions.
2.  **Inference Engine**: A PyTorch-based CNN model (`CNN.py`) loaded with pre-trained weights (`plant_disease_model_1_latest.pt`).
3.  **Knowledge Base**: CSV-based storage (`disease_info.csv`, `supplement_info.csv`) containing detailed descriptions, prevention steps, and supplement recommendations for 38+ classes of plant diseases.

## Key APIs

### `POST /predict-by-path`
- **Purpose**: Used by the Spring Boot backend to request analysis for an already saved image.
- **Input**: JSON `{"image_path": "/absolute/path/to/image.jpg"}`.
- **Output**: JSON containing disease name, confidence score, description, and prevention steps.

### `POST /predict`
- **Purpose**: Standalone multipart file upload API for direct testing or alternative integrations.

## AI Model Details

- **Architecture**: Deep Convolutional Neural Network (CNN).
- **Input Size**: 224x224 RGB images.
- **Output Classes**: 39 classes (including healthy plants and specific diseases for various crops).
- **Inference Hardware**: Optimized for CPU inference to ensure portability and low-cost deployment.

## Data Flow

1.  **Request Received**: Backend provides a file path or direct upload.
2.  **Preprocessing**: Image is resized to 224x224 and converted to a normalized PyTorch tensor.
3.  **Inference**: The CNN model performs a forward pass to generate class logits.
4.  **Post-processing**: Softmax is applied to get confidence scores; the highest probability class index is mapped to the `disease_info` dataset.
5.  **Response**: The service returns a structured JSON object with actionable advice for the farmer.

## Development & Deployment

- **Environment**: Virtualenv or Conda with dependencies from `requirements.txt`.
- **Server**: Flask dev server for local work; Gunicorn for production-like environments.
- **Entry Point**: `python app.py`.

---

_Generated using BMAD Method `document-project` workflow_
