const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
    });

    console.log(`
=================================
 MongoDB Connected Successfully
 Host: ${conn.connection.host}
 Database: ${conn.connection.name}
=================================
`);
  } catch (error) {
    console.error(`
=================================
 MongoDB Connection Failed
 Error: ${error.message}
=================================
`);

    process.exit(1); // stop app instead of infinite reconnect
  }
};

// Connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected");
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

module.exports = connectDB;