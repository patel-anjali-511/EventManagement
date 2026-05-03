const express = require("express");
const {
  registerUser,
  loginUser,
  customerLogin,
  adminLogin,
  createAdminUser,
  getAdmins,
  getCustomers,
  updateAdmin,
  deleteAdmin,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/authController");
const { protect, admin, hasPermission } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/customer/login", customerLogin);

router.post("/admin/login", adminLogin);
router.post("/create-admin", createAdminUser);
router.post("/admin", protect, admin, hasPermission("admins"), createAdminUser);
router.get("/admins", protect, admin, hasPermission("admins"), getAdmins);
router.get("/customers", protect, admin, hasPermission("users"), getCustomers);
router.put("/admin/:id", protect, admin, hasPermission("admins"), updateAdmin);
router.delete("/admin/:id", protect, admin, hasPermission("admins"), deleteAdmin);

router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);
router.put("/updatepassword", protect, updatePassword);

module.exports = router;
