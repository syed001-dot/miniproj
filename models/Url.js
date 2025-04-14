const mongoose = require('mongoose');
const shortid = require('shortid');

const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true,
        trim: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true,
        default: shortid.generate
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
});

// Index for faster queries
urlSchema.index({ shortUrl: 1 });
urlSchema.index({ userId: 1 });
urlSchema.index({ createdAt: 1 });

const Url = mongoose.model('Url', urlSchema);

module.exports = Url; 