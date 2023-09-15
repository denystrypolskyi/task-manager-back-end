const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routes/authRouter");
const corsMiddleware = require("./middleware/cors");
const taskRouter = require("./routes/taskRouter");
require("dotenv").config();

const PORT = process.env.PORT || 5000
const app = express();
app.use(corsMiddleware);
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/task", taskRouter);

const start = async () => {
  try {
    await mongoose.connect(process.env.dbUrl);
    app.listen(PORT, () => {
      console.log("Server started on port ", PORT);
    });
  } catch (e) {
    console.log(e);
  }
};

start();
