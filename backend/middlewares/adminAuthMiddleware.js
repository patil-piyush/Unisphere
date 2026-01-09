const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (req, res, next) => {
    try{
        const adminToken = req.cookies.adminToken;

        if (!adminToken)
          return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
        const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);
        if(decoded.role != 'admin') {
            return res.status(403).json({message: "Access denied. Admins only."});
        }
        req.adminId = decoded.id;
        next();
    }catch(error){
        res.status(401).json({message: "Invalid or expired token."});
    }
}

module.exports = {
    adminAuthMiddleware
}