# Run locally: uvicorn python-ml-service:app --host 0.0.0.0 --port 8000
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime, timedelta
import math
import random
from pymongo import MongoClient
import os
import httpx

MONGODB_URI = os.environ.get("MONGODB_URI")
mongo_client = None
db = None
if MONGODB_URI:
    try:
        mongo_client = MongoClient(MONGODB_URI, tlsAllowInvalidCertificates=True)
        db = mongo_client.get_database("cryptodashboard")
    except Exception as e:
        mongo_client = None
        db = None

app = FastAPI(title="Crypto ML Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class HistoricalPoint(BaseModel):
    date: str
    price: float
    volume: float | None = None
    change24h: float | None = None

class ForecastIn(BaseModel):
    coin_id: str
    symbol: str
    historical_data: List[HistoricalPoint]
    current_price: float
    forecast_days: int = 7
    model_type: Literal["LSTM", "ARIMA"] = "LSTM"

class Prediction(BaseModel):
    date: str
    price: float
    confidence: int
    model: str

class ForecastOut(BaseModel):
    predictions: List[Prediction]
    accuracy: float
    modelType: str
    metrics: dict

@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}

@app.get("/historical")
def historical(coin_id: str, days: int = 90):
    """
    Fetch historical data for a coin from CoinGecko.
    Returns [{date, price, volume, change24h}] for the last N days.
    """
    try:
        url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart?vs_currency=usd&days={days}"
        with httpx.Client(timeout=20.0) as client:
            r = client.get(url, headers={"Accept": "application/json"})
            r.raise_for_status()
            data = r.json()
        prices = data.get("prices", [])
        vols = {int(v[0]/1000): v[1] for v in data.get("total_volumes", [])}
        out = []
        prev_price = None
        for ts, price in prices:
            day_key = int(ts/1000)
            vol = vols.get(day_key)
            change24h = None
            if prev_price is not None and prev_price > 0:
                change24h = ((price - prev_price) / prev_price) * 100.0
            prev_price = price
            out.append({
                "date": datetime.utcfromtimestamp(day_key).date().isoformat(),
                "price": float(price),
                "volume": float(vol) if vol is not None else None,
                "change24h": float(change24h) if change24h is not None else 0.0
            })
        return {"success": True, "data": out}
    except Exception as e:
        return {"success": False, "error": str(e)}

def naive_arima_forecast(prices: List[float], start_price: float, days: int):
    # Simple AR(1)-like process using recent drift
    if len(prices) < 5:
      prices = [start_price] * 5
    diffs = [prices[i] - prices[i-1] for i in range(1, len(prices))]
    avg_diff = sum(diffs[-5:]) / min(5, len(diffs)) if diffs else 0.0
    preds = []
    p = start_price
    for i in range(days):
        noise = random.uniform(-0.25, 0.25) * abs(avg_diff)
        p = max(0.0001, p + avg_diff + noise)
        preds.append(p)
    return preds

def naive_lstm_forecast(prices: List[float], start_price: float, days: int):
    # Momentum + mean reversion + noise
    window = prices[-10:] if len(prices) >= 10 else prices
    if not window: window = [start_price]
    momentum = (window[-1] - window[0]) / max(1e-8, window[0])
    preds = []
    p = start_price
    for i in range(days):
        drift = 0.01 * momentum
        reversion = 0.05 * ( (sum(window)/len(window)) - p ) / max(1e-8, p)
        noise = random.uniform(-0.02, 0.02)
        p = max(0.0001, p * (1 + drift + reversion + noise))
        preds.append(p)
    return preds

@app.post("/forecast", response_model=ForecastOut)
def forecast(payload: ForecastIn):
    prices = [pt.price for pt in payload.historical_data]
    days = payload.forecast_days or 7
    start = payload.current_price

    if payload.model_type == "ARIMA":
        series = naive_arima_forecast(prices, start, days)
        model_label = "ARIMA"
    else:
        series = naive_lstm_forecast(prices, start, days)
        model_label = "LSTM"

    predictions = []
    for i, price in enumerate(series, 1):
        date = (datetime.utcnow() + timedelta(days=i)).date().isoformat()
        confidence = max(50, 90 - i * 5)
        predictions.append(Prediction(date=date, price=round(price, 2), confidence=confidence, model=model_label))

    # Simple placeholder metrics
    out = ForecastOut(
        predictions=predictions,
        accuracy=75.0,
        modelType=model_label,
        metrics={"mse": 0.0, "mae": 0.0, "rmse": 0.0, "r2": 0.0},
    )
    
    # Store forecast result in MongoDB if available
    try:
        if db:
            db["forecasts"].insert_one({
                "coinId": payload.coin_id,
                "symbol": payload.symbol,
                "modelType": model_label,
                "days": days,
                "currentPrice": payload.current_price,
                "predictions": [p.dict() for p in predictions],
                "accuracy": out.accuracy,
                "metrics": out.metrics,
                "createdAt": datetime.utcnow()
            })
    except Exception:
        # ignore db errors
        pass
    
    return out
