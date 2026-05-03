const express = require("express");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getAdminStats,
} = require("../controllers/eventController");
const { protect, admin, hasPermission } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.route("/stats").get(protect, admin, hasPermission("dashboard"), getAdminStats);
router.route("/").get(getEvents);
router.route("/").post(protect, admin, hasPermission("events"), upload.single("image"), createEvent);
router.route("/:id").get(getEventById);
router.route("/:id").put(protect, admin, hasPermission("events"), upload.single("image"), updateEvent);
router.route("/:id").delete(protect, admin, hasPermission("events"), deleteEvent);

module.exports = router;
