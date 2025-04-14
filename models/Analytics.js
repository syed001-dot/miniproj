const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    urlId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Url',
        required: true
    },
    clickTime: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    referrer: {
        type: String
    },
    country: {
        type: String
    },
    city: {
        type: String
    },
    device: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet']
    },
    browser: {
        type: String
    },
    os: {
        type: String
    }
});

// Indexes for faster queries
analyticsSchema.index({ urlId: 1 });
analyticsSchema.index({ clickTime: 1 });
analyticsSchema.index({ country: 1 });
analyticsSchema.index({ device: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics; 