const express = require("express");
const router = express.Router();

const Personnel = require("../models/Personnel");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {

  try {

    const { name, department, title, phone, email } = req.body;

const personnel = await Personnel.create({
  name,
  department,
  title,
  phone,
  email,
});

    res.json({
      message: "Personel eklendi",
      personnel,
    });

  } catch (error) {

    res.status(500).json({
      message: "Hata oluştu",
    });

  }

});

router.get("/", authMiddleware, async (req, res) => {

  const personnels = await Personnel.findAll();

  res.json(personnels);

});
router.delete("/:id", authMiddleware, async (req, res) => {

  await Personnel.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.json({
    message: "Personel silindi",
  });

});

module.exports = router;