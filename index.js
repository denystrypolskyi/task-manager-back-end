const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routes/authRouter");
const cors = require("cors");
const taskRouter = require("./routes/taskRouter");
const auth = require("./middleware/auth");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: ["https://task-scheduler-6cfad.web.app", "https://task-scheduler-6cfad.firebaseapp.com"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/task", auth, taskRouter);

const start = async () => {
  try {
    await mongoose.connect(process.env.dbUrl);
    app.listen(PORT, () => {
      console.log("Server started on port ", PORT);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
