const express = require('express');
const router = express.Router();
const { trackVisit, getAnalytics } = require('../controllers/analyticsControllers');
const auth = require('../middleware/auth');

// Track URL visit
router.post('/:shortUrl/track', trackVisit);

// Get analytics for a URL (protected route)
router.get('/:urlId', auth, getAnalytics);

module.exports = router;