const mongoose = require("mongoose");

const dbconnection = () => {
  mongoose
    .connect(process.env.DB_URI, {
      dbName: process.env.DB_NAME, // اختياري: يخليك تدخل على database معينة
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("✅ Database connection successful");
    })
    .catch((err) => {
      console.error(`❌ Database Error: ${err.message}`);
      process.exit(1);
    });
};

module.exports = dbconnection;
