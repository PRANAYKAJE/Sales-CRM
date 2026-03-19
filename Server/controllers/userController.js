const User = require('../models/User');
const Lead = require('../models/Lead');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch users' });
  }
};

const getSalesPersons = async (req, res) => {
  try {
    const salesPersons = await User.find({ role: 'sales' }).select('-password').lean();
    
    const salesWithLeadCounts = await Promise.all(
      salesPersons.map(async (user) => {
        const leadCount = await Lead.countDocuments({ assignedTo: user._id });
        return { ...user, leadCount };
      })
    );
    
    return res.json(salesWithLeadCounts);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch sales persons' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password').lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
    
    return res.json(userResponse);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    return res.json({ message: 'User removed' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete user' });
  }
};

module.exports = { getAllUsers, getSalesPersons, getUserById, updateUser, deleteUser };
