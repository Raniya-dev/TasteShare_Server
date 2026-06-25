// models/favoriteModel.js

import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Favorite", favoriteSchema);