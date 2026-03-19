const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  title: { type: String, required: true },
  value: { type: Number, default: 0 },
  stage: { type: String, enum: ['Prospect', 'Negotiation', 'Won', 'Lost'], default: 'Prospect' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deal', DealSchema);