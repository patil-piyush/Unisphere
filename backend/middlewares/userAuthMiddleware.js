const jwt = require('jsonwebtoken');

const userAuthMiddleware = (req, res, next) => {
    try{
        const userToken = req.cookies.userToken;
        if (!userToken)
          return res
            .status(401)
            .json({ message: "Access denied. No token provided." });

        const decoded = jwt.verify(userToken, process.env.JWT_SECRET);

        req.userId = decoded.id;
        next();
    }catch(error){
        res.status(401).json({message: "Invalid or expired token."});
    }
}
module.exports = {
    userAuthMiddleware,
}