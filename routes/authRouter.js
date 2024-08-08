const Router = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const router = new Router();
const authMiddleware = require("../middleware/auth");

router.post(
  "/register",
  [
    check("email", "Incorrect email address").isEmail(),
    check(
      "password",
      "Password must be longer than 3 and shorter than 12"
    ).isLength({ min: 3, max: 12 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.errors[0].msg, errors });
      }
      const { email, password } = req.body;

      const candidate = await User.findOne({ email });

      if (candidate) {
        return res
          .status(400)
          .json({ message: `User with email ${email} already exist` });
      }

      const hashPassword = await bcrypt.hash(password, 8);
      const user = new User({ email: email, password: hashPassword });
      await user.save();
      return res.json({ message: "User was created" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid email" });
    }

    const isPassValid = await bcrypt.compare(password, user.password);
    if (!isPassValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.secretKey, {
      expiresIn: "24h",
    });

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    
    return res.json({
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});

module.exports = router;
