const mongoose = require("mongoose");
require("dotenv").config();

const dbUrl = process.env.DATABASE_URL;

const connectDB = async () => {
  mongoose
    .connect(dbUrl)
    .then(() => {
      console.log("MONGO CONNECTION OPEN!");
    })
    .catch((err) => {
      console.log("OH NO MONGO CONNECTION ERROR!");
      console.log(err);
    });
};

module.exports = connectDB;
