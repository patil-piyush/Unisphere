const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const clubToken = req.cookies.clubToken;

    if (!clubToken)
      return res.status(401).json({ message: "Unauthorized: No token" });

    const decoded = jwt.verify(clubToken, process.env.JWT_SECRET);

    if (decoded.role !== "president" || decoded.type !== "club") {
      return res.status(403).json({ message: "Forbidden: Club access only" });
    }

    req.clubId = decoded.id;
    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};