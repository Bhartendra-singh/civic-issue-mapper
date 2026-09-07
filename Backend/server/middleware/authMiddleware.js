import jwt from 'jsonwebtoken';


export const protect = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
    
};


export const isAdmin = (req, res, next) => {
    if(req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, admin only' });
    }

    next();
};