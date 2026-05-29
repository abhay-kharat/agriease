import io
import os
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel
from PIL import Image


app = FastAPI(title="AgriEase Disease AI", version="1.0.0")


DISEASE_KNOWLEDGE = {
    "healthy": {
        "disease": "Healthy plant",
        "recommendation": "No visible disease pattern detected. Continue normal monitoring and balanced irrigation.",
        "description": "The crop image does not match a known disease keyword in the current lightweight model.",
        "prevention": "Scout weekly, avoid overwatering, and remove damaged leaves.",
        "buy_link": "",
    },
    "bacterial_spot": {
        "disease": "Bacterial spot",
        "recommendation": "Remove infected leaves, avoid overhead irrigation, and use copper-based treatment if advised locally.",
        "description": "Bacterial spot commonly causes small dark lesions on leaves and fruit.",
        "prevention": "Use disease-free seed, improve airflow, and avoid working wet plants.",
        "buy_link": "",
    },
    "early_blight": {
        "disease": "Early blight",
        "recommendation": "Remove lower infected leaves and apply a recommended fungicide after local agronomy advice.",
        "description": "Early blight often appears as brown leaf spots with concentric rings.",
        "prevention": "Rotate crops, mulch soil, and avoid leaf wetness.",
        "buy_link": "",
    },
    "late_blight": {
        "disease": "Late blight",
        "recommendation": "Isolate affected plants quickly and consult an agronomist for urgent fungicide action.",
        "description": "Late blight can spread rapidly in cool, humid conditions.",
        "prevention": "Use resistant varieties, increase spacing, and monitor after rain.",
        "buy_link": "",
    },
    "leaf_mold": {
        "disease": "Leaf mold",
        "recommendation": "Improve ventilation, reduce humidity, and remove infected leaves.",
        "description": "Leaf mold is favored by humid, poorly ventilated conditions.",
        "prevention": "Use drip irrigation, prune dense foliage, and avoid excess nitrogen.",
        "buy_link": "",
    },
    "powdery_mildew": {
        "disease": "Powdery mildew",
        "recommendation": "Remove severely infected leaves and use sulfur or approved fungicide if needed.",
        "description": "Powdery mildew creates white powder-like patches on leaves.",
        "prevention": "Improve sunlight exposure and avoid overcrowding.",
        "buy_link": "",
    },
    "rust": {
        "disease": "Rust",
        "recommendation": "Remove infected leaves and apply crop-specific rust management guidance.",
        "description": "Rust typically creates orange or brown pustules on leaf surfaces.",
        "prevention": "Use resistant varieties and avoid prolonged leaf wetness.",
        "buy_link": "",
    },
    "scab": {
        "disease": "Apple scab",
        "recommendation": "Remove infected debris and use a crop-specific fungicide program if symptoms continue.",
        "description": "Scab causes dark, rough lesions on leaves or fruit.",
        "prevention": "Prune for airflow and clear fallen infected leaves.",
        "buy_link": "",
    },
    "black_rot": {
        "disease": "Black rot",
        "recommendation": "Remove infected tissue and keep the field clean of diseased debris.",
        "description": "Black rot can cause dark lesions and tissue decay depending on crop.",
        "prevention": "Use sanitation, crop rotation, and resistant varieties where possible.",
        "buy_link": "",
    },
}


class PredictByPathRequest(BaseModel):
    image_path: str


def normalize_name(name: str) -> str:
    return name.lower().replace("-", "_").replace(" ", "_")


def classify_from_name(filename: str) -> dict:
    normalized = normalize_name(filename)
    for key, payload in DISEASE_KNOWLEDGE.items():
        if key in normalized:
            return {**payload, "confidence": 82.0}
    return {**DISEASE_KNOWLEDGE["healthy"], "confidence": 55.0}


def validate_image(data: bytes) -> None:
    try:
        image = Image.open(io.BytesIO(data))
        image.verify()
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image") from exc


@app.get("/health")
def health():
    return {"status": "ok", "model": os.getenv("MODEL_MODE", "keyword-fallback")}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    validate_image(contents)
    return classify_from_name(file.filename or "")


@app.post("/predict-by-path")
def predict_by_path(request: PredictByPathRequest):
    image_path = Path(request.image_path)
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image path does not exist on this AI service")
    validate_image(image_path.read_bytes())
    return classify_from_name(image_path.name)
