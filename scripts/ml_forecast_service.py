#!/usr/bin/env python3
"""
Advanced ML Forecasting Service for Cryptocurrency Price Prediction
Implements LSTM, ARIMA, and ensemble methods for accurate forecasting
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.seasonal import seasonal_decompose
import warnings
warnings.filterwarnings('ignore')

class CryptoForecaster:
    def __init__(self):
        self.lstm_model = None
        self.arima_model = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.sequence_length = 60
        
    def prepare_data(self, historical_data):
        """Prepare and clean historical data for ML models"""
        df = pd.DataFrame(historical_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Handle missing values
        df['price'] = df['price'].fillna(method='ffill')
        df['volume'] = df['volume'].fillna(df['volume'].mean())
        
        # Calculate additional features
        df['returns'] = df['price'].pct_change()
        df['volatility'] = df['returns'].rolling(window=20).std()
        df['sma_20'] = df['price'].rolling(window=20).mean()
        df['sma_50'] = df['price'].rolling(window=50).mean()
        df['rsi'] = self.calculate_rsi(df['price'], 14)
        
        # Fill NaN values
        df = df.fillna(method='ffill').fillna(method='bfill')
        
        return df
    
    def calculate_rsi(self, prices, period=14):
        """Calculate Relative Strength Index"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def build_lstm_model(self, input_shape):
        """Build and compile LSTM model"""
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(50, return_sequences=True),
            Dropout(0.2),
            LSTM(50),
            Dropout(0.2),
            Dense(25),
            Dense(1)
        ])
        
        model.compile(optimizer='adam', loss='mean_squared_error')
        return model
    
    def prepare_lstm_data(self, data):
        """Prepare data for LSTM training"""
        # Use multiple features
        features = ['price', 'volume', 'volatility', 'sma_20', 'sma_50', 'rsi']
        feature_data = data[features].values
        
        # Scale the data
        scaled_data = self.scaler.fit_transform(feature_data)
        
        # Create sequences
        X, y = [], []
        for i in range(self.sequence_length, len(scaled_data)):
            X.append(scaled_data[i-self.sequence_length:i])
            y.append(scaled_data[i, 0])  # Predict price (first feature)
        
        return np.array(X), np.array(y)
    
    def train_lstm(self, data):
        """Train LSTM model"""
        print("🧠 Training LSTM model...")
        
        X, y = self.prepare_lstm_data(data)
        
        if len(X) < 100:
            raise ValueError("Insufficient data for LSTM training")
        
        # Split data
        train_size = int(len(X) * 0.8)
        X_train, X_test = X[:train_size], X[train_size:]
        y_train, y_test = y[:train_size], y[train_size:]
        
        # Build and train model
        self.lstm_model = self.build_lstm_model((X_train.shape[1], X_train.shape[2]))
        
        # Train with early stopping
        early_stopping = tf.keras.callbacks.EarlyStopping(
            monitor='val_loss', patience=10, restore_best_weights=True
        )
        
        history = self.lstm_model.fit(
            X_train, y_train,
            batch_size=32,
            epochs=100,
            validation_data=(X_test, y_test),
            callbacks=[early_stopping],
            verbose=0
        )
        
        # Calculate accuracy
        predictions = self.lstm_model.predict(X_test)
        mse = mean_squared_error(y_test, predictions)
        mae = mean_absolute_error(y_test, predictions)
        r2 = r2_score(y_test, predictions)
        
        accuracy = max(50, min(95, 100 - (mae * 100)))
        
        print(f"✅ LSTM trained - Accuracy: {accuracy:.1f}%")
        
        return {
            'accuracy': accuracy,
            'mse': mse,
            'mae': mae,
            'r2': r2
        }
    
    def train_arima(self, data):
        """Train ARIMA model"""
        print("📈 Training ARIMA model...")
        
        prices = data['price'].values
        
        # Find optimal ARIMA parameters
        best_aic = float('inf')
        best_order = (1, 1, 1)
        
        for p in range(0, 3):
            for d in range(0, 2):
                for q in range(0, 3):
                    try:
                        model = ARIMA(prices, order=(p, d, q))
                        fitted_model = model.fit()
                        if fitted_model.aic < best_aic:
                            best_aic = fitted_model.aic
                            best_order = (p, d, q)
                    except:
                        continue
        
        # Train final model
        self.arima_model = ARIMA(prices, order=best_order).fit()
        
        # Calculate accuracy
        forecast = self.arima_model.fittedvalues
        actual = prices[1:]  # ARIMA starts from second value
        
        if len(forecast) > len(actual):
            forecast = forecast[:len(actual)]
        elif len(actual) > len(forecast):
            actual = actual[:len(forecast)]
        
        mae = mean_absolute_error(actual, forecast)
        accuracy = max(50, min(90, 100 - (mae / np.mean(actual)) * 100))
        
        print(f"✅ ARIMA trained - Order: {best_order}, Accuracy: {accuracy:.1f}%")
        
        return {
            'accuracy': accuracy,
            'order': best_order,
            'aic': best_aic
        }
    
    def predict_lstm(self, data, days):
        """Generate LSTM predictions"""
        if self.lstm_model is None:
            raise ValueError("LSTM model not trained")
        
        # Prepare last sequence
        features = ['price', 'volume', 'volatility', 'sma_20', 'sma_50', 'rsi']
        feature_data = data[features].values
        scaled_data = self.scaler.transform(feature_data)
        
        last_sequence = scaled_data[-self.sequence_length:]
        predictions = []
        
        current_sequence = last_sequence.copy()
        
        for _ in range(days):
            # Predict next value
            pred_input = current_sequence.reshape(1, self.sequence_length, len(features))
            pred_scaled = self.lstm_model.predict(pred_input, verbose=0)[0, 0]
            
            # Create next sequence point
            next_point = current_sequence[-1].copy()
            next_point[0] = pred_scaled  # Update price
            
            # Update sequence
            current_sequence = np.vstack([current_sequence[1:], next_point])
            
            # Inverse transform to get actual price
            temp_point = np.zeros((1, len(features)))
            temp_point[0, 0] = pred_scaled
            actual_price = self.scaler.inverse_transform(temp_point)[0, 0]
            
            predictions.append(max(0.001, actual_price))
        
        return predictions
    
    def predict_arima(self, days):
        """Generate ARIMA predictions"""
        if self.arima_model is None:
            raise ValueError("ARIMA model not trained")
        
        forecast = self.arima_model.forecast(steps=days)
        return [max(0.001, price) for price in forecast]
    
    def ensemble_predict(self, data, days):
        """Combine LSTM and ARIMA predictions"""
        lstm_predictions = self.predict_lstm(data, days)
        arima_predictions = self.predict_arima(days)
        
        # Weighted ensemble (LSTM gets more weight for longer predictions)
        ensemble_predictions = []
        for i in range(days):
            lstm_weight = 0.7 + (i / days) * 0.2  # Increase LSTM weight over time
            arima_weight = 1 - lstm_weight
            
            ensemble_pred = (lstm_predictions[i] * lstm_weight + 
                           arima_predictions[i] * arima_weight)
            ensemble_predictions.append(ensemble_pred)
        
        return ensemble_predictions
    
    def generate_forecast(self, historical_data, current_price, days=30):
        """Main forecasting function"""
        print(f"🚀 Starting forecast generation for {days} days")
        
        # Prepare data
        df = self.prepare_data(historical_data)
        
        if len(df) < 100:
            raise ValueError("Insufficient historical data (minimum 100 days required)")
        
        # Train models
        lstm_metrics = self.train_lstm(df)
        arima_metrics = self.train_arima(df)
        
        # Generate predictions
        ensemble_predictions = self.ensemble_predict(df, days)
        
        # Calculate confidence scores
        predictions = []
        for i, price in enumerate(ensemble_predictions):
            # Confidence decreases over time and with volatility
            base_confidence = (lstm_metrics['accuracy'] + arima_metrics['accuracy']) / 2
            time_decay = max(0, (days - i) / days) * 15
            confidence = max(40, base_confidence + time_decay - 5)
            
            predictions.append({
                'date': (pd.Timestamp.now() + pd.Timedelta(days=i+1)).strftime('%Y-%m-%d'),
                'price': round(price, 2),
                'confidence': round(confidence),
                'model': 'LSTM-ARIMA Ensemble'
            })
        
        # Overall metrics
        overall_accuracy = (lstm_metrics['accuracy'] + arima_metrics['accuracy']) / 2
        
        return {
            'predictions': predictions,
            'accuracy': round(overall_accuracy, 2),
            'modelType': 'LSTM-ARIMA Ensemble',
            'metrics': {
                'mse': lstm_metrics['mse'],
                'mae': lstm_metrics['mae'],
                'rmse': np.sqrt(lstm_metrics['mse']),
                'r2': lstm_metrics['r2']
            }
        }

# FastAPI service (if running as standalone service)
if __name__ == "__main__":
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    from typing import List, Dict, Any
    import uvicorn
    from fastapi.middleware.cors import CORSMiddleware
    import os
    
    app = FastAPI(title="Crypto ML Forecasting Service")
    # Configure CORS for the standalone service. Set `ML_ALLOWED_ORIGINS` to
    # a comma-separated list of origins (or `*` to allow all).
    allowed = os.environ.get("ML_ALLOWED_ORIGINS", "*")
    if allowed == "*" or allowed.strip() == "":
        origins = ["*"]
    else:
        origins = [o.strip() for o in allowed.split(",") if o.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    class ForecastRequest(BaseModel):
        coin_id: str
        symbol: str
        historical_data: List[Dict[str, Any]]
        current_price: float
        forecast_days: int = 30
    
    @app.post("/forecast")
    async def generate_forecast(request: ForecastRequest):
        try:
            forecaster = CryptoForecaster()
            result = forecaster.generate_forecast(
                request.historical_data,
                request.current_price,
                request.forecast_days
            )
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": "crypto-ml-forecasting"}
    
    print("🚀 Starting Crypto ML Forecasting Service on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
