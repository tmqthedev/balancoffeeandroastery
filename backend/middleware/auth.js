const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access token is required' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'balan-coffee-secret');
        
        // Verify user still exists and is active using MongoDB
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token or user not found' 
            });
        }

        req.user = {
            userId: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false, 
                message: 'Token expired' 
            });
        }
        
        console.error('Authentication error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Authentication failed' 
        });
    }
};

// Optional authentication (for public endpoints that can benefit from user info)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'balan-coffee-secret');
        const user = await User.findById(decoded.userId);

        if (user) {
            req.user = {
                userId: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user info
        req.user = null;
        next();
    }
};

module.exports = {
    authenticateToken,
    optionalAuth
};
