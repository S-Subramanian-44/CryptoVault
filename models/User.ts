import { Schema, models, model } from "mongoose"

const UserSchema = new Schema(
  {
    email: { type: String, index: true, unique: true, sparse: true },
    name: String,
    preferences: Object,
  },
  { timestamps: true },
)

export const User = models.User || model("User", UserSchema)
