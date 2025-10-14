const jwt = require('jsonwebtoken');
const { getCollection, toObjectId, handleDatabaseError } = require('./mongoHelpers');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        console.log('🔐 Auth Middleware: Starting authentication');
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            console.log('❌ Auth Middleware: No token provided');
            return res.status(401).json({ 
                success: false, 
                message: 'Access token is required' 
            });
        }

        console.log('🔍 Auth Middleware: Verifying token...');
        const jwtSecret = process.env.JWT_SECRET || 'balan-coffee-secret-2024';
        if (!process.env.JWT_SECRET) {
            console.warn('⚠️ Auth Middleware: JWT_SECRET not configured, using default');
        }
        const decoded = jwt.verify(token, jwtSecret);
        console.log('✅ Auth Middleware: Token decoded successfully:', { userId: decoded.userId, email: decoded.email });
        
        // Verify user still exists and is active using MongoDB native driver
        console.log('👤 Auth Middleware: Looking up user in database');
        const usersCollection = getCollection(req, 'users');
        
        // Try both ObjectId and string ID formats for user lookup
        let user = null;
        try {
            // First try as ObjectId if it matches the format
            if (typeof decoded.userId === 'string' && decoded.userId.match(/^[0-9a-fA-F]{24}$/)) {
                const objectId = toObjectId(decoded.userId);
                user = await usersCollection.findOne({ _id: objectId });
                console.log('🔍 Auth Middleware: Tried ObjectId lookup:', !!user);
            }
        } catch (error) {
            console.log('⚠️ Auth Middleware: ObjectId lookup failed, trying string lookup');
        }
        
        // If ObjectId lookup failed or user ID is not ObjectId format, try string lookup
        if (!user) {
            user = await usersCollection.findOne({ _id: decoded.userId });
            console.log('🔍 Auth Middleware: Tried string ID lookup:', !!user);
        }
        
        // If still no user found, try looking by custom ID field (if exists)
        if (!user) {
            user = await usersCollection.findOne({ userId: decoded.userId });
            console.log('🔍 Auth Middleware: Tried userId field lookup:', !!user);
        }

        if (!user) {
            console.log('❌ Auth Middleware: User not found in database:', decoded.userId);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token or user not found' 
            });
        }

        console.log('✅ Auth Middleware: User found:', { id: user._id, email: user.email });
        req.user = {
            userId: user._id || user.userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        };

        console.log('🎯 Auth Middleware: Authentication successful, proceeding to next middleware');
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            console.log('❌ Auth Middleware: Invalid token:', error.message);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            console.log('❌ Auth Middleware: Token expired:', error.message);
            return res.status(401).json({
                success: false, 
                message: 'Token expired' 
            });
        }
        
        console.error('❌ Auth Middleware: Authentication error:', error);
        return handleDatabaseError(error, res, 'Authentication');
    }
};

// Optional authentication (for public endpoints that can benefit from user info)
const optionalAuth = async (req, res, next) => {
    try {
        console.log('🔓 Optional Auth: Starting optional authentication');
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.log('💭 Optional Auth: No token, continuing without user');
            req.user = null;
            return next();
        }

        console.log('🔍 Optional Auth: Verifying token...');
        const jwtSecret = process.env.JWT_SECRET || 'balan-coffee-secret-2024';
        const decoded = jwt.verify(token, jwtSecret);
        const usersCollection = getCollection(req, 'users');
        
        // Try multiple lookup methods for user
        let user = null;
        try {
            // First try as ObjectId if it matches the format
            if (typeof decoded.userId === 'string' && decoded.userId.match(/^[0-9a-fA-F]{24}$/)) {
                const objectId = toObjectId(decoded.userId);
                user = await usersCollection.findOne({ _id: objectId });
            }
        } catch (error) {
            // Ignore ObjectId conversion errors
        }
        
        // If ObjectId lookup failed, try string lookup
        if (!user) {
            user = await usersCollection.findOne({ _id: decoded.userId });
        }
        
        // If still no user found, try looking by custom ID field
        if (!user) {
            user = await usersCollection.findOne({ userId: decoded.userId });
        }

        if (user) {
            console.log('✅ Optional Auth: User found, adding to request');
            req.user = {
                userId: user._id || user.userId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            };
        } else {
            console.log('⚠️ Optional Auth: User not found, continuing without user');
            req.user = null;
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user info
        console.log('⚠️ Optional Auth: Token invalid, continuing without user:', error.message);
        req.user = null;
        next();
    }
};

module.exports = {
    authenticateToken,
    optionalAuth
};
