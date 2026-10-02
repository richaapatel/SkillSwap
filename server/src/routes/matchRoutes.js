const express = require('express');
const router = express.Router();
const { getMatches } = require('../controllers/matchController');
const authMiddleware = require('../middleware/authMiddleware');

// All match routes require authentication
router.get('/', authMiddleware, getMatches);

module.exports = router;
