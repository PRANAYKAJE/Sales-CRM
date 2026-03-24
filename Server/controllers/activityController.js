const Activity = require('../models/Activity');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

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

    const search = req.query.search || '';
    if (search.length >= 2) {
      const matchingLeads = await Lead.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const matchingLeadIds = matchingLeads.map(l => l._id);

      const searchConditions = [
        { description: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
      if (matchingLeadIds.length > 0) {
        searchConditions.push({ leadId: { $in: matchingLeadIds } });
      }

      query = { $and: [query, { $or: searchConditions }] };
    }

    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .populate('leadId', 'name company')
      .populate('dealId', 'title value stage')
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse(res, activities, 'Activities fetched successfully', {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(res, 'Unable to fetch activities');
  }
};

const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id)
      .populate('leadId', 'name company')
      .populate('dealId', 'title value stage')
      .lean();
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found', data: null });

    if (activity.leadId) {
      const lead = await Lead.findById(activity.leadId);
      if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized', data: null });
      }
    }

    if (activity.dealId) {
      const deal = await Deal.findById(activity.dealId);
      if (deal) {
        const lead = await Lead.findById(deal.leadId);
        if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: 'Not authorized', data: null });
        }
      }
    }

    return successResponse(res, activity, 'Activity fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Unable to fetch activity');
  }
};

const createActivity = async (req, res) => {
  try {
    const { leadId, dealId, type, description } = req.body;

    if (!leadId && !dealId) {
      return res.status(400).json({ success: false, message: 'leadId or dealId is required', data: null });
    }
    if (!type || !description) {
      return res.status(400).json({ success: false, message: 'type and description are required', data: null });
    }

    if (leadId) {
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({ success: false, message: 'Lead not found', data: null });
      }
      if (req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized', data: null });
      }
    }

    if (dealId) {
      const deal = await Deal.findById(dealId);
      if (!deal) {
        return res.status(404).json({ success: false, message: 'Deal not found', data: null });
      }
      const lead = await Lead.findById(deal.leadId);
      if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized', data: null });
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
    return successResponse(res, activity, 'Activity created successfully', null, 201);
  } catch (error) {
    return errorResponse(res, 'Unable to create activity');
  }
};

const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found', data: null });
    }

    if (activity.leadId) {
      const lead = await Lead.findById(activity.leadId);
      if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized', data: null });
      }
    }

    if (activity.dealId) {
      const deal = await Deal.findById(activity.dealId);
      if (deal) {
        const lead = await Lead.findById(deal.leadId);
        if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: 'Not authorized', data: null });
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
    return successResponse(res, activity, 'Activity updated successfully');
  } catch (error) {
    return errorResponse(res, 'Unable to update activity');
  }
};

const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found', data: null });
    }

    if (activity.leadId) {
      const lead = await Lead.findById(activity.leadId);
      if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized', data: null });
      }
    }

    if (activity.dealId) {
      const deal = await Deal.findById(activity.dealId);
      if (deal) {
        const lead = await Lead.findById(deal.leadId);
        if (lead && req.user.role !== 'admin' && lead.assignedTo.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: 'Not authorized', data: null });
        }
      }
    }

    await activity.deleteOne();
    return successResponse(res, null, 'Activity removed successfully');
  } catch (error) {
    return errorResponse(res, 'Unable to delete activity');
  }
};

module.exports = { getActivities, getActivityById, createActivity, updateActivity, deleteActivity };
