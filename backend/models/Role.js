const mongoose = require("mongoose");

const PAGES = ["dashboard", "events", "scanner", "users", "admins", "roles", "payments"];

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    permissions: [
      {
        type: String,
        enum: PAGES,
      },
    ],
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);
module.exports = Role;
module.exports.PAGES = PAGES;
