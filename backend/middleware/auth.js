const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

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

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify user still exists and is active
        const userQuery = `
            SELECT user_id, username, email, full_name, role, is_active 
            FROM Users 
            WHERE user_id = @userId AND is_active = 1
        `;
        const userResult = await executeQuery(userQuery, { userId: decoded.userId });

        if (userResult.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token or user not found' 
            });
        }

        req.user = {
            userId: userResult[0].user_id,
            username: userResult[0].username,
            email: userResult[0].email,
            fullName: userResult[0].full_name,
            role: userResult[0].role
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

// Admin role middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Admin access required' 
        });
    }
    next();
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

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const userQuery = `
            SELECT user_id, username, email, full_name, role, is_active 
            FROM Users 
            WHERE user_id = @userId AND is_active = 1
        `;
        const userResult = await executeQuery(userQuery, { userId: decoded.userId });

        if (userResult.length > 0) {
            req.user = {
                userId: userResult[0].user_id,
                username: userResult[0].username,
                email: userResult[0].email,
                fullName: userResult[0].full_name,
                role: userResult[0].role
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
    requireAdmin,
    optionalAuth
};
