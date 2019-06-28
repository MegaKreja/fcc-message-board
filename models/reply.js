const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  text: String,
  reported: Boolean,
  delete_password: String,
  created_on: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Reply", replySchema);