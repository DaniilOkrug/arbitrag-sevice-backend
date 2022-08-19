const { Schema, model } = require("mongoose");

const CoinPriceModel = new Schema({
  coin: { type: String, required: true },
  timestamp: { type: String, required: true },
});

module.exports = model("BinanceAccount", CoinPriceModel);
