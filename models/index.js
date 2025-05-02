const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Url = require('./Url');
const Analytics = require('./Analytics');

// Define associations
User.hasMany(Url, {
    foreignKey: 'userId',
    as: 'urls'
});

Url.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Url.hasMany(Analytics, {
    foreignKey: 'urlId',
    as: 'analytics'
});

Analytics.belongsTo(Url, {
    foreignKey: 'urlId',
    as: 'url'
});

// Export models and sequelize instance
module.exports = {
    sequelize,
    User,
    Url,
    Analytics
};