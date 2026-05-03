const express = require("express");
const router = express.Router();
const { getPayments, processRefund, rejectRefund } = require("../controllers/paymentController");
const { protect, admin, hasPermission } = require("../middleware/authMiddleware");

router.get("/", protect, admin, hasPermission("payments"), getPayments);
router.post("/:id/refund", protect, admin, hasPermission("payments"), processRefund);
router.post("/:id/reject-refund", protect, admin, hasPermission("payments"), rejectRefund);

module.exports = router;
