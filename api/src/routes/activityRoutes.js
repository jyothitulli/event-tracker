const express = require('express');
const router = express.Router();
const { createActivity } = require('../controllers/activityController');

// POST /api/v1/activities
router.post('/activities', createActivity);

module.exports = router;