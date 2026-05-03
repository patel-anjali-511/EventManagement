const express = require("express");
const {
  registerForEvent,
  getRegistrationsForEvent,
  getMyRegistrations,
  verifyRegistration,
  createCheckoutSession,
  cancelRegistration,
} = require("../controllers/registrationController");
const { protect, admin, hasPermission } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/", protect, registerForEvent);
router.get("/my", protect, getMyRegistrations);
router.post("/:id/cancel", protect, cancelRegistration);
router.get("/:eventId", protect, admin, hasPermission("events"), getRegistrationsForEvent);
router.post("/verify", protect, admin, hasPermission("scanner"), verifyRegistration);

module.exports = router;
