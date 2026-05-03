const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/roles", require("./routes/roleRoutes"));

app.get("/", (req, res) => {
  res.send("EventNest API is running...");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
