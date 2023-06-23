const express = require("express");
const connectDB = require("./config/db");
const multer = require('multer');
const dotenv = require("dotenv");
const routes = require("./routes/index")

dotenv.config();
connectDB();
const app = express();

// used multer for uploading files
const upload = multer();
app.use(upload.any());

// to accept json data
app.use(express.json()); 

// to use route
app.use("/", routes)

const PORT = process.env.PORT;
app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);
