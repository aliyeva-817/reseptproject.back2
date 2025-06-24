const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  stripeSessionId: String
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
