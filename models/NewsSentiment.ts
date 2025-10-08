import { Schema, models, model } from "mongoose"

const NewsSchema = new Schema(
  {
    title: String,
    description: String,
    link: String,
    pubDate: String,
    source: String,
    sentiment: { type: String, enum: ["positive", "negative", "neutral"] },
    coins: [String], // inferred tickers/ids mentioned
  },
  { timestamps: true },
)

export const NewsSentiment = models.NewsSentiment || model("NewsSentiment", NewsSchema)
