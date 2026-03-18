const express = require('express');
const router = express.Router();
const { getDeals, createDeal, updateDeal, deleteDeal } = require('../controllers/dealController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.route('/')
  .get(protect, getDeals)             
  .post(protect, createDeal);       

router.route('/:id')
  .put(protect, updateDeal)           
  .delete(protect, deleteDeal);       

module.exports = router;