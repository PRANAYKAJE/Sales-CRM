const Deal = require('../models/Deal');
const Lead = require('../models/Lead');

const getDeals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.query.stage) {
      query.stage = req.query.stage;
    }

    if (req.user.role !== 'admin') {
      const userLeads = await Lead.find({ assignedTo: req.user._id }).select('_id');
      const leadIds = userLeads.map(lead => lead._id);
      query.leadId = { $in: leadIds };
    }

    const search = req.query.search || '';
    if (search.length >= 2) {
      const leadIds = await Lead.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      query.leadId = query.leadId
        ? { $and: [query.leadId, { leadId: { $in: leadIds.map(l => l._id) } }] }
        : { $in: leadIds.map(l => l._id) };
    }

    const total = await Deal.countDocuments(query);
    const deals = await Deal.find(query)
      .populate('leadId', 'name company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      message: 'Deals fetched successfully',
      data: deals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch deals' });
  }
};

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
    return res.status(500).json({ message: 'Unable to fetch deal' });
  }
};

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
    return res.status(500).json({ message: 'Unable to delete deal' });
  }
};

module.exports = { getDeals, getDealById, createDeal, updateDeal, deleteDeal };
