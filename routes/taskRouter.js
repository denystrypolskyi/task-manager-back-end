const Router = require("express");
const { check, validationResult } = require("express-validator");

const Task = require("../models/Task");
const User = require("../models/User");

const router = new Router();

async function getUserTasks(userId) {
  const tasks = await Task.find();
  const user = await User.findById(userId);

  const userTaskIDs = user.tasks;

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

router.get("/all", async (req, res) => {
  try {
    const { id } = req.user;
    const matchingTasks = await getUserTasks(id);
    return res.json({ tasks: matchingTasks });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params; 
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: `Task ${id} doesn't exist` });
    }
    return res.json({ task: task });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});

router.post(
  "/",
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

      const { subject, description, priority, dueDate } = req.body;

      const { id } = req.user;

      const task = new Task({
        subject: subject,
        description: description,
        priority: priority,
        dueDate: dueDate,
      });
      await task.save();

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.tasks.push(task._id);

      await user.save();

      return res.json({ message: "Task was created" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }
  }
);

router.put(
  "/",
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

      return res.json({ message: "Task was updated", task: updatedTask });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }
  }
);

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.id;

    const deletedTask = await Task.findByIdAndDelete(id);

    const user = await User.findById(userId);

    const taskIndex = user.tasks.indexOf(id);

    if (taskIndex != -1) {
      user.tasks.splice(taskIndex, 1);
    }

    user.save();

    if (!deletedTask) {
      return res.status(404).json({ message: `Task ${id} doesn't exist` });
    }

    return res.json({ message: `Task ${id} deleted`, task: deletedTask });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});

module.exports = router;
