const Admin = require("./models/Admin");
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();
    console.log('Connected to Database.');
    // Clear existing Admins
    await Admin.deleteMany();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@admin.com";
    const adminExists = await Admin.findOne({ email: adminEmail });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      const adminUser = new Admin({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });

      await adminUser.save();
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
    process.exit();
  } catch (error) {
    console.error('Error with seeder:', error);
    process.exit(1);
  }
};

seedAdmin();
