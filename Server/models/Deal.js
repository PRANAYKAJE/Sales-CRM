const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  title: { type: String, required: true },
  value: { type: Number, default: 0 },
  stage: { type: String, enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed'], default: 'Prospecting' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deal', DealSchema);