const Router = require("express");
const Task = require("../models/Task");
const { check, validationResult } = require("express-validator");
const router = new Router();
const User = require("../models/User");

// Function to get user tasks by user ID
async function getUserTasks(userId) {
  const tasks = await Task.find(); // Get all tasks
  const user = await User.findById(userId); // Get user

  const userTaskIDs = user.tasks; // Get user tasks (their ID's)

  const matchingTasks = [];

  if (userTaskIDs.length == 0) {
    return matchingTasks;
  }

  tasks.forEach((task) => {
    if (
      userTaskIDs.some(
        (userTaskId) => userTaskId.toString() === task._id.toString()
      )
    ) {
      matchingTasks.push(task);
    }
  });

  return matchingTasks;
}

router.get("/getTask", async (req, res) => {
  try {
    const { taskId } = req.query;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: `Task ${taskId} doesn't exist` });
    }
    return res.json({ task: task });
  } catch (e) {
    console.log(e);
    res.status(400).send({ message: "Server error" });
  }
});

router.get("/getUserTasks", async (req, res) => {
  try {
    const { userId } = req.query; // Get user id
    const matchingTasks = await getUserTasks(userId); // Get user tasks
    return res.json({ tasks: matchingTasks });
  } catch (e) {
    console.log(e);
    res.status(400).send({ message: "Server error" });
  }
});

router.post(
  "/createTask",
  [
    check(
      ["subject"],
      "Subject field shouldn't be empty, and its length should be a maximum of 80 characters"
    )
      .notEmpty()
      .isLength({ max: 80 }),
    check(
      ["description"],
      "Description field shouldn't be empty, and its length should be a maximum of 255 characters"
    )
      .notEmpty()
      .isLength({ max: 255 }),
    check("priority", 'Priority must not be "Default"').not().equals("Default"),
    check(["dueDate"], "Due date field shouldn't be empty").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.errors[0].msg, errors });
      }

      const { subject, description, priority, dueDate, userId } = req.body;

      const task = new Task({
        subject: subject,
        description: description,
        priority: priority,
        dueDate: dueDate,
      });
      await task.save();

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.tasks.push(task._id);

      await user.save();

      return res.json({ message: "Task was created" });
    } catch (e) {
      console.log(e);
      res.status(400).send({ message: "Server error" });
    }
  }
);

router.post(
  "/updateTask",
  [
    check(
      ["subject"],
      "Subject field shouldn't be empty, and its length should be a maximum of 80 characters"
    )
      .notEmpty()
      .isLength({ max: 80 }),
    check(
      ["description"],
      "Description field shouldn't be empty, and its length should be a maximum of 255 characters"
    )
      .notEmpty()
      .isLength({ max: 255 }),
    check("priority", 'Priority must not be "Default"').not().equals("Default"),
    check(["dueDate"], "Due date field shouldn't be empty").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.errors[0].msg, errors });
      }

      const { subject, description, priority, dueDate, taskId } = req.body;

      const newTask = {
        subject: subject,
        description: description,
        priority: priority,
        dueDate: dueDate,
      };

      const updatedTask = await Task.findByIdAndUpdate(taskId, newTask, {
        new: true,
      });

      if (!updatedTask) {
        return res
          .status(404)
          .json({ message: `Task ${taskId} doesn't exist` });
      }

      return res.json({ message: "Task was updated" });
    } catch (e) {
      console.log(e);
      res.status(400).send({ message: "Server error" });
    }
  }
);

router.post("/deleteTask", async (req, res) => {
  try {
    const { taskId, userId } = req.body;

    const deletedTask = await Task.findByIdAndDelete(taskId);

    const user = await User.findById(userId);

    const taskIndex = user.tasks.indexOf(taskId);

    if (taskIndex != -1) {
      user.tasks.splice(taskIndex, 1);
    }

    user.save();

    if (!deletedTask) {
      return res.status(404).json({ message: `Task ${taskId} doesn't exist` });
    }

    return res.json({ message: `Task ${taskId} deleted` });
  } catch (e) {
    console.log(e);
    res.status(400).send({ message: "Server error" });
  }
});

module.exports = router;
