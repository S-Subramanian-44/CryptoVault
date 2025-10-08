import { Schema, models, model } from "mongoose"

const PredictionSchema = new Schema(
  {
    date: String,
    price: Number,
    confidence: Number,
    model: String,
  },
  { _id: false },
)

const ForecastSchema = new Schema(
  {
    userId: { type: String, index: true },
    coinId: { type: String, index: true },
    symbol: String,
    modelType: { type: String, enum: ["LSTM", "ARIMA", "Advanced TA"], index: true },
    days: Number,
    currentPrice: Number,
    predictions: [PredictionSchema],
    accuracy: Number,
    metrics: {
      mse: Number,
      mae: Number,
      rmse: Number,
      r2: Number,
    },
  },
  { timestamps: true },
)

export const Forecast = models.Forecast || model("Forecast", ForecastSchema)
