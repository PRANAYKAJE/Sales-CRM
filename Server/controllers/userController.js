const User = require('../models/User');
const Lead = require('../models/Lead');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({});
    const users = await User.find({})
      .select('-password')
      .lean()
      .skip(skip)
      .limit(limit);

    return successResponse(res, users, 'Users fetched successfully', {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(res, 'Unable to fetch users');
  }
};

const getSalesPersons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments({ role: 'sales' });
    const salesPersons = await User.find({ role: 'sales' })
      .select('-password')
      .lean()
      .skip(skip)
      .limit(limit);

    const salesWithLeadCounts = await Promise.all(
      salesPersons.map(async (user) => {
        const leadCount = await Lead.countDocuments({ assignedTo: user._id });
        return { ...user, leadCount };
      })
    );

    return successResponse(res, salesWithLeadCounts, 'Sales persons fetched successfully', {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(res, 'Unable to fetch sales persons');
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    return successResponse(res, user, 'User fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Unable to fetch user');
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role && (role === 'admin' || role === 'sales')) user.role = role;

    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return successResponse(res, userResponse, 'User updated successfully');
  } catch (error) {
    return errorResponse(res, 'Unable to update user');
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account', data: null });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    await user.deleteOne();
    return successResponse(res, null, 'User removed successfully');
  } catch (error) {
    return errorResponse(res, 'Unable to delete user');
  }
};

module.exports = { getAllUsers, getSalesPersons, getUserById, updateUser, deleteUser };
