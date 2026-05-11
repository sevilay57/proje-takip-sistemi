const express = require("express");
const router = express.Router();

const Project = require("../models/Project");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {

  const { title, description, startDate, endDate, offerAmount } = req.body;

const project = await Project.create({
  title,
  description,
  startDate,
  endDate,
  offerAmount,
});
    res.json({
      message: "Proje oluşturuldu",
      project,
    });

  } catch (error) {

    res.status(500).json({
      message: "Hata oluştu",
      error: error.message,
    });

  }
});

router.get("/", authMiddleware, async (req, res) => {

  const projects = await Project.findAll();

  res.json(projects);

});
router.delete("/:id", authMiddleware, async (req, res) => {

  await Project.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.json({
    message: "Proje silindi",
  });

});
module.exports = router;