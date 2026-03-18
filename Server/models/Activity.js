const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
  type: {
    type: String,
    enum: ["Call", "Meeting", "Note", "Follow-up"],
    required: true,
  },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Activity", ActivitySchema);
