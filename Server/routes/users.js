const express = require('express');
const router = express.Router();
const { getAllUsers, getSalesPersons, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.route('/')
  .get(protect, admin, getAllUsers);

router.route('/sales-persons')
  .get(protect, admin, getSalesPersons);

router.route('/:id')
  .get(protect, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
