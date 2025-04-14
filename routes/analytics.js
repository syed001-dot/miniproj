const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Analytics = require('../models/Analytics');
const Url = require('../models/Url');

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

// Track URL click
router.post('/track', async (req, res) => {
    try {
        const { urlId, ipAddress, userAgent, referrer, country, city, device, browser, os } = req.body;

        // Create analytics record
        const analytics = new Analytics({
            urlId,
            ipAddress,
            userAgent,
            referrer,
            country,
            city,
            device,
            browser,
            os
        });

        await analytics.save();

        // Update URL click count
        await Url.findByIdAndUpdate(urlId, { $inc: { clicks: 1 } });

        res.status(201).json({ message: 'Click tracked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get analytics for a specific URL
router.get('/url/:urlId', auth, async (req, res) => {
    try {
        // Verify URL ownership
        const url = await Url.findOne({ _id: req.params.urlId, userId: req.userId });
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }

        const analytics = await Analytics.find({ urlId: req.params.urlId })
            .sort({ clickTime: -1 });

        res.json(analytics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get analytics summary for a specific URL
router.get('/url/:urlId/summary', auth, async (req, res) => {
    try {
        // Verify URL ownership
        const url = await Url.findOne({ _id: req.params.urlId, userId: req.userId });
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }

        const summary = await Analytics.aggregate([
            { $match: { urlId: url._id } },
            {
                $group: {
                    _id: null,
                    totalClicks: { $sum: 1 },
                    uniqueVisitors: { $addToSet: '$ipAddress' },
                    byCountry: { $push: '$country' },
                    byDevice: { $push: '$device' },
                    byBrowser: { $push: '$browser' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalClicks: 1,
                    uniqueVisitors: { $size: '$uniqueVisitors' },
                    byCountry: {
                        $reduce: {
                            input: '$byCountry',
                            initialValue: {},
                            in: {
                                $mergeObjects: [
                                    '$$value',
                                    { [this.byCountry]: { $add: ['$$value[this.byCountry]', 1] } }
                                ]
                            }
                        }
                    },
                    byDevice: {
                        $reduce: {
                            input: '$byDevice',
                            initialValue: {},
                            in: {
                                $mergeObjects: [
                                    '$$value',
                                    { [this.byDevice]: { $add: ['$$value[this.byDevice]', 1] } }
                                ]
                            }
                        }
                    },
                    byBrowser: {
                        $reduce: {
                            input: '$byBrowser',
                            initialValue: {},
                            in: {
                                $mergeObjects: [
                                    '$$value',
                                    { [this.byBrowser]: { $add: ['$$value[this.byBrowser]', 1] } }
                                ]
                            }
                        }
                    }
                }
            }
        ]);

        res.json(summary[0] || {
            totalClicks: 0,
            uniqueVisitors: 0,
            byCountry: {},
            byDevice: {},
            byBrowser: {}
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get time-based analytics for a specific URL
router.get('/url/:urlId/time', auth, async (req, res) => {
    try {
        // Verify URL ownership
        const url = await Url.findOne({ _id: req.params.urlId, userId: req.userId });
        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }

        const { period = 'day' } = req.query;
        let groupBy;

        switch (period) {
            case 'hour':
                groupBy = { $hour: '$clickTime' };
                break;
            case 'day':
                groupBy = { $dayOfMonth: '$clickTime' };
                break;
            case 'month':
                groupBy = { $month: '$clickTime' };
                break;
            default:
                return res.status(400).json({ message: 'Invalid period' });
        }

        const timeAnalytics = await Analytics.aggregate([
            { $match: { urlId: url._id } },
            {
                $group: {
                    _id: groupBy,
                    clicks: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(timeAnalytics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 