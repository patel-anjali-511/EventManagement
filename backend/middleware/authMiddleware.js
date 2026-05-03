const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Customer = require("../models/Customer");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.decodedRole = decoded.role;

      if (decoded.role === "admin") {
        req.user = await Admin.findById(decoded.id)
          .select("-password")
          .populate("roleId");
      } else {
        req.user = await Customer.findById(decoded.id).select("-password");
      }

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.decodedRole === "admin")) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};

const hasPermission = (page) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  if (!req.user.roleId) {
    return next();
  }
  if (req.user.roleId.permissions.includes(page)) {
    return next();
  }
  return res.status(403).json({ message: "Access denied: insufficient permissions" });
};

module.exports = { protect, admin, hasPermission };
