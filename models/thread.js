const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
  text: String,
  reported: Boolean,
  delete_password: String,
  replies: [Object]
},{timestamps: { createdAt: 'created_on', updatedAt: 'bumped_on' }})

module.exports = threadSchema;