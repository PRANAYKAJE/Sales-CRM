const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');

const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).populate('assignedTo', 'name email').lean();
    return res.json(leads);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch leads' });
  }
};

const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id).populate('assignedTo', 'name email').lean();
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    return res.json(lead);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch lead' });
  }
};

const createLead = async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Lead name is required' });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      assignedTo: req.user._id,
    });

    const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email').lean();
    return res.status(201).json(populatedLead);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create lead' });
  }
};

const updateLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const allowedUpdates = ['name', 'email', 'phone', 'company'];

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        lead[key] = req.body[key];
      }
    });

    await lead.save();
    const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email').lean();
    return res.json(populatedLead);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update lead' });
  }
};

const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await Deal.deleteMany({ leadId: lead._id });
    await Activity.deleteMany({ leadId: lead._id });
    await lead.deleteOne();

    return res.json({ message: 'Lead removed' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete lead' });
  }
};

module.exports = { getLeads, getLeadById, createLead, updateLead, deleteLead };
