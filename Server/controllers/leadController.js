const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');

// Get all leads
const getLeads = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role !== 'admin') {
      query.assignedTo = req.user._id;
    }

    const leads = await Lead.find(query).populate('assignedTo', 'name email').lean();
    return res.json(leads);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to fetch leads' });
  }
};

// Get a lead by ID
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id).populate('assignedTo', 'name email').lean();
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role !== 'admin' && lead.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    return res.json(lead);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to fetch lead' });
  }
};

// Create a new lead
const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Lead name is required' });
    }

    const validStatuses = ['New Lead', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
    const leadStatus = validStatuses.includes(status) ? status : 'New Lead';

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      status: leadStatus,
      assignedTo: req.user._id,
    });
    return res.status(201).json(lead);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to create lead' });
  }
};

// Update a lead
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedUpdates = ['name', 'email', 'phone', 'company', 'status'];
    const validStatuses = ['New Lead', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        if (key === 'status' && !validStatuses.includes(req.body.status)) {
          return;
        }
        lead[key] = req.body[key];
      }
    });

    await lead.save();
    return res.json(lead);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to update lead' });
  }
};

// Delete a lead
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Deal.deleteMany({ leadId: lead._id });
    await Activity.deleteMany({ leadId: lead._id });
    await lead.deleteOne();

    return res.json({ message: 'Lead removed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to delete lead' });
  }
};

module.exports = { getLeads, getLeadById, createLead, updateLead, deleteLead };
