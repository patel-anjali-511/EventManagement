const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "customer",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  },
);

// Virtual for registrations
customerSchema.virtual('registrations', {
  ref: 'Registration',
  localField: '_id',
  foreignField: 'user'
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
