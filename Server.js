const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const User = require("./models/UserModel");

dotenv.config({ path: "config.env" });
const dbconnection = require("./config/database");
const OrderRoutes = require("./Routes/OrderRoutes");
const UserRoutes = require("./Routes/UserRoutes");

//express app
const app = express();

//midileware
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



const Port = process.env.Port || 8000;

app.listen(Port, () => {
  console.log(`server is running in the ${Port}`);
 // ✅ call admin creator here
});
