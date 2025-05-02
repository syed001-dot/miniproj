const express = require('express');
const router = express.Router();
const { createShortUrl, getUrls, redirect } = require('../controllers/urlControllers');
const auth = require('../middleware/auth');

// Create a short URL (protected route)
router.post('/shorten', auth, createShortUrl);

// Get all URLs for a user (protected route)
router.get('/my-urls', auth, getUrls);

// Redirect to original URL (public route)
router.get('/:shortUrl', redirect);

module.exports = router;