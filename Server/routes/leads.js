const express = require('express');
const router = express.Router();
const { getLeads, createLead, updateLead, deleteLead } = require('../controllers/leadController');
const { protect } = require('../middleware/auth');


router.route('/')
  .get(protect, getLeads)
  .post(protect, createLead);

router.route('/:id')
  .put(protect, updateLead)
  .delete(protect, deleteLead);

module.exports = router;