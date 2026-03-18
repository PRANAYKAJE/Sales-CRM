console.log('About to require Deal model...');

try {
  const Deal = require('../models/Deal'); 
  console.log('Deal model loaded successfully');
} catch (error) {
  console.error('ERROR REQUIRING DEAL MODEL:', error);
  process.exit(1); // Stop the server so you can read the error
}

const Lead = require('../models/Lead');
// ... rest of code
const Deal = require('../models/Deal');
const Lead = require('../models/Lead');

//  Get all deals

const getDeals = async (req, res) => {
  try {
    let query = {};

    if (req.query.stage) {
      query.stage = req.query.stage;
    }

    if (req.user.role !== 'Admin') {
      const userLeads = await Lead.find({ assignedTo: req.user._id }).select('_id');
      const leadIds = userLeads.map(lead => lead._id);
      query.leadId = { $in: leadIds };
    }

    const deals = await Deal.find(query)
      .populate('leadId', 'name company'); 

    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//     Create new deal
const createDeal = async (req, res) => {
  const { leadId, title, value, stage } = req.body;

  try {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role !== 'Admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create deal for this lead' });
    }

    const deal = await Deal.create({
      leadId,
      title,
      value,
      stage
    });

    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//    Update deal

const updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    const lead = await Lead.findById(deal.leadId);

    if (req.user.role !== 'Admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedDeal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDeal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Delete deal

const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    const lead = await Lead.findById(deal.leadId);


    if (req.user.role !== 'Admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await deal.deleteOne();
    res.json({ message: 'Deal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDeals, createDeal, updateDeal, deleteDeal };