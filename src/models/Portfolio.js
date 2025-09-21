// src/models/Portfolio.js
import mongoose from "mongoose";

const HoldingSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true, // stock or asset ticker like AAPL, TSLA
  },
  shares: {
    type: Number,
    required: true,
    min: 0,
  },
  avgBuyPrice: {
    type: Number,
    default: 0, // optional field: average buy price of the holding
  },
});

const PortfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    holdings: [HoldingSchema],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Portfolio = mongoose.model("Portfolio", PortfolioSchema);

export default Portfolio;
