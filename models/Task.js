const { Schema, model } = require("mongoose");

const taskSchema = new Schema({
  subject: { type: String, required: true },
  description: { type: String },
  priority: { type: String, default: "Normal" },
  dueDate: { type: String },
  createdAt: {
    type: String,
    required: true,
    default: new Date().toLocaleDateString(),
  },
});

module.exports = model("Task", taskSchema);
