const express = require("express");
const router = express.Router();

const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  const users = await User.findAll({
    attributes: ["id", "name", "email", "role"],
  });

  res.json(users);
});

module.exports = router;