const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/urls', require('./routes/urls'));
app.use('/api/analytics', require('./routes/analytics'));

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
});

// Start server
app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.error('Database connection failed:', error);
    }
});