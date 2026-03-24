const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  company: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
}, {
  indexes: [
    { name: 1 },
    { email: 1 },
    { company: 1 },
    { createdAt: -1 },
  ],
});

module.exports = mongoose.model("Lead", LeadSchema);
