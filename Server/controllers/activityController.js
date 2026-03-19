const Activity = require('../models/Activity');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');

const getActivities = async (req, res) => {
  try {
    let query = {};

    if (req.query.leadId) {
      query.leadId = req.query.leadId;
    }
    if (req.query.dealId) {
      query.dealId = req.query.dealId;
    }

    if (req.user.role !== 'admin') {
      const userLeadIds = await Lead.find({ assignedTo: req.user._id }).select('_id');
      const leadIds = userLeadIds.map(l => l._id);
      query.leadId = { $in: leadIds };
    }

    const activities = await Activity.find(query)
      .populate('leadId', 'name company')
      .populate('dealId', 'title value stage')
      .sort({ createdAt: -1 })
      .lean();
    return res.json(activities);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to fetch activities' });
  }
};

const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id)
      .populate('leadId', 'name company')
      .populate('dealId', 'title value stage')
      .lean();
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    if (activity.leadId) {
      const lead = await Lead.findById(activity.leadId);
      if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    if (activity.dealId) {
      const deal = await Deal.findById(activity.dealId);
      if (deal) {
        const lead = await Lead.findById(deal.leadId);
        if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized' });
        }
      }
    }

    return res.json(activity);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to fetch activity' });
  }
};

const createActivity = async (req, res) => {
  try {
    const { leadId, dealId, type, description } = req.body;

    if (!leadId && !dealId) {
      return res.status(400).json({ message: 'leadId or dealId is required' });
    }
    if (!type || !description) {
      return res.status(400).json({ message: 'type and description are required' });
    }

    if (leadId) {
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
      if (req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    if (dealId) {
      const deal = await Deal.findById(dealId);
      if (!deal) {
        return res.status(404).json({ message: 'Deal not found' });
      }
      const lead = await Lead.findById(deal.leadId);
      if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    const validTypes = ['Call', 'Meeting', 'Note', 'Follow-up'];
    const activityType = validTypes.includes(type) ? type : 'Note';

    const activity = await Activity.create({
      leadId: leadId || null,
      dealId: dealId || null,
      userId: req.user._id,
      type: activityType,
      description,
    });
    return res.status(201).json(activity);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to create activity' });
  }
};

const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    if (activity.leadId) {
      const lead = await Lead.findById(activity.leadId);
      if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    if (activity.dealId) {
      const deal = await Deal.findById(activity.dealId);
      if (deal) {
        const lead = await Lead.findById(deal.leadId);
        if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized' });
        }
      }
    }

    const allowedUpdates = ['type', 'description', 'leadId', 'dealId'];
    const validTypes = ['Call', 'Meeting', 'Note', 'Follow-up'];

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        if (key === 'type' && !validTypes.includes(req.body.type)) {
          return;
        }
        activity[key] = req.body[key];
      }
    });

    await activity.save();
    return res.json(activity);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to update activity' });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    if (activity.leadId) {
      const lead = await Lead.findById(activity.leadId);
      if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    if (activity.dealId) {
      const deal = await Deal.findById(activity.dealId);
      if (deal) {
        const lead = await Lead.findById(deal.leadId);
        if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Not authorized' });
        }
      }
    }

    await activity.deleteOne();
    return res.json({ message: 'Activity removed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Unable to delete activity' });
  }
};

module.exports = { getActivities, getActivityById, createActivity, updateActivity, deleteActivity };
