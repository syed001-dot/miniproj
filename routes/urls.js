const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Url = require('../models/Url');
const QRCode = require('qrcode');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Shorten URL
router.post('/shorten', auth, [
    body('originalUrl').isURL().withMessage('Please enter a valid URL'),
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { originalUrl, title, description, expiresAt } = req.body;

        // Create new URL
        const url = new Url({
            originalUrl,
            userId: req.userId,
            title,
            description,
            expiresAt: expiresAt ? new Date(expiresAt) : null
        });

        await url.save();

        // Generate QR code
        const qrCode = await QRCode.toDataURL(`${process.env.BASE_URL}/${url.shortUrl}`);

        res.status(201).json({
            url: {
                id: url._id,
                originalUrl: url.originalUrl,
                shortUrl: `${process.env.BASE_URL}/${url.shortUrl}`,
                title: url.title,
                description: url.description,
                clicks: url.clicks,
                createdAt: url.createdAt,
                expiresAt: url.expiresAt,
                isActive: url.isActive
            },
            qrCode
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all URLs for a user
router.get('/my-urls', auth, async (req, res) => {
    try {
        const urls = await Url.find({ userId: req.userId })
            .sort({ createdAt: -1 });

        res.json(urls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get URL details
router.get('/:shortUrl', async (req, res) => {
    try {
        const url = await Url.findOne({ shortUrl: req.params.shortUrl });
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }

        if (!url.isActive || (url.expiresAt && url.expiresAt < new Date())) {
            return res.status(400).json({ message: 'URL is expired or inactive' });
        }

        res.json(url);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update URL
router.put('/:id', auth, [
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('expiresAt').optional().isISO8601().withMessage('Invalid expiration date'),
    body('isActive').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const url = await Url.findOne({ _id: req.params.id, userId: req.userId });
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }

        const { title, description, expiresAt, isActive } = req.body;

        if (title) url.title = title;
        if (description) url.description = description;
        if (expiresAt) url.expiresAt = new Date(expiresAt);
        if (isActive !== undefined) url.isActive = isActive;

        await url.save();

        res.json(url);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete URL
router.delete('/:id', auth, async (req, res) => {
    try {
        const url = await Url.findOne({ _id: req.params.id, userId: req.userId });
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }

        await url.remove();
        res.json({ message: 'URL deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 