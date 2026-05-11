const express = require("express");
const router = express.Router();

const Material = require("../models/Material");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, quantity, unit, unitPrice, supplierId } = req.body;

 const material = await Material.create({
  name,
  quantity,
  unit,
  unitPrice,
  supplierId,
});

    res.json({
      message: "Malzeme eklendi",
      material,
    });
  } catch (error) {
    res.status(500).json({
      message: "Hata oluştu",
      error: error.message,
    });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const materials = await Material.findAll();
  res.json(materials);
});

router.delete("/:id", authMiddleware, async (req, res) => {
  await Material.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.json({
    message: "Malzeme silindi",
  });
});

module.exports = router;