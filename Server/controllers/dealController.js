const Deal = require('../models/Deal');
const Lead = require('../models/Lead');

// Get all deals
const getDeals = async (req, res) => {
  try {
    let query = {};

    if (req.query.stage) {
      query.stage = req.query.stage;
    }

    if (req.user.role !== 'admin') {
      const userLeads = await Lead.find({ assignedTo: req.user._id }).select('_id');
      const leadIds = userLeads.map(lead => lead._id);
      query.leadId = { $in: leadIds };
    }

    const deals = await Deal.find(query).populate('leadId', 'name company').lean();
    return res.json(deals);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to fetch deals' });
  }
};

// Get a deal by ID
const getDealById = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id).populate('leadId', 'name company').lean();
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    const lead = await Lead.findById(deal.leadId);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    return res.json(deal);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to fetch deal' });
  }
};

// Create new deal
const createDeal = async (req, res) => {
  try {
    const { leadId, title, value, stage } = req.body;

    if (!leadId) {
      return res.status(400).json({ message: 'leadId is required' });
    }
    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const validStages = ['Prospect', 'Negotiation', 'Won', 'Lost'];
    const dealStage = validStages.includes(stage) ? stage : 'Prospect';

    const deal = await Deal.create({ leadId, title, value: value || 0, stage: dealStage });
    return res.status(201).json(deal);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to create deal' });
  }
};

const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    const lead = await Lead.findById(deal.leadId);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedUpdates = ['title', 'value', 'stage'];
    const validStages = ['Prospect', 'Negotiation', 'Won', 'Lost'];

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        if (key === 'stage' && !validStages.includes(req.body.stage)) {
          return;
        }
        deal[key] = req.body[key];
      }
    });

    await deal.save();
    return res.json(deal);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to update deal' });
  }
};

const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    const lead = await Lead.findById(deal.leadId);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await deal.deleteOne();
    return res.json({ message: 'Deal removed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to delete deal' });
  }
};

module.exports = { getDeals, getDealById, createDeal, updateDeal, deleteDeal };