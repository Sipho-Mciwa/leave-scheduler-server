require('dotenv').config();

const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
    return (jwt.sign(user, process.env.ACCESS_TOKEN_SECRET));
}

const authenticateToken = (allowedRoles) => {
    return ((req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401).json({ message: 'Access denied' });
        
        try {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) return res.sendStatus(403)
                req.user = user;
                
                if (!allowedRoles.includes(req.user.role)) {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
                next();
            });
        } catch (error) {
            res.status(403).json({ message: 'Invalid token.' });
        }
    })
}

module.exports = {authenticateToken, generateAccessToken}