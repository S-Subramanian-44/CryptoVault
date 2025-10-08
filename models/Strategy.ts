import { Schema, models, model } from "mongoose"

const StrategySchema = new Schema(
  {
    userId: { type: String, index: true },
    title: String,
    description: String,
    actions: [String],
    tags: [String],
    coinId: String,
    impact: String, // e.g., "risk-reduction", "recovery"
  },
  { timestamps: true },
)

export const Strategy = models.Strategy || model("Strategy", StrategySchema)
