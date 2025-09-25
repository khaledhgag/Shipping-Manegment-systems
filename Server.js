const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const User = require("./models/UserModel");
const cors = require("cors");



dotenv.config({ path: "config.env" });
const dbconnection = require("./config/database");
const OrderRoutes = require("./Routes/OrderRoutes");
const UserRoutes = require("./Routes/UserRoutes");
const DriverRoutes = require("./Routes/DriveRoutes"); // ✅ إضافة مسارات السائقين
const PaymentRoutes = require("./Routes/PaymentRoutes");
const ReportRoutes = require("./Routes/ReportRoutes");
//express app
const app = express();//midileware
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === `development`) {
  app.use(morgan("dev"));
  console.log(`the mode is ${process.env.NODE_ENV}`);
}

//connection db
dbconnection();

// MOUNT Routes
app.use("/api/v1/Order", OrderRoutes);
app.use("/api/v1/User", UserRoutes);
app.use("/api/v1/Driver", DriverRoutes); // ✅ إضافة مسارات السائقين
app.use("/api/v1/Payment", PaymentRoutes);
app.use("/api/v1/Report", ReportRoutes);


const Port = process.env.Port || 8000;

app.listen(Port, () => {
  console.log(`server is running in the ${Port}`);

});
