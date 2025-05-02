const { DataTypes } = require('sequelize');
const shortid = require('shortid');
const sequelize = require('../config/database');

const Url = sequelize.define('Url', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    originalUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    shortUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => shortid.generate()
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    clicks: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'urls'
});

module.exports = Url;