const Lead = require('../models/Lead');

// Get all leads
const getLeads = async (req, res) => {
 
  let query = {};
  if (req.user.role.toLowerCase() !== 'admin') {
    query.assignedTo = req.user._id;
  }

  const leads = await Lead.find(query).populate('assignedTo', 'name email');
  res.json(leads);
};

//create a new lead
const createLead = async (req, res) => {
  const { name, email, phone, company, status } = req.body;

  const leadData = {
    name,
    email,
    phone,
    company,
    status,
    assignedTo: req.user._id 
  };

  const lead = await Lead.create(leadData);
  res.status(201).json(lead);
};

// Update a lead
const updateLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  if (req.user.role !== 'Admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this lead' });
  }

  const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedLead);
};

// Delete a leadq
const deleteLead = async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  if (req.user.role !== 'Admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await lead.deleteOne();
  res.json({ message: 'Lead removed' });
};


module.exports = { getLeads, createLead, updateLead, deleteLead };