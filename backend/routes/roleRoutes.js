const express = require("express");
const { getRoles, createRole, updateRole, deleteRole } = require("../controllers/roleController");
const { protect, admin, hasPermission } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, admin, getRoles);
router.post("/", protect, admin, hasPermission("roles"), createRole);
router.put("/:id", protect, admin, hasPermission("roles"), updateRole);
router.delete("/:id", protect, admin, hasPermission("roles"), deleteRole);

module.exports = router;
