import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl: string = process.env.MONGO_URL || "";

async function dbConnect() {
  // use mongoose to connect this app to our database on mongoDB using the DB_URL (connection string)
  mongoose
    .connect(
      mongoUrl,
    )
    .then(() => {
      console.log("Successfully connected to MongoDB Atlas!");
    })
    .catch((error) => {
      console.log("Unable to connect to MongoDB Atlas!");
      console.error(error);
    });
}

module.exports = dbConnect;