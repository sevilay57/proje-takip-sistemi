const express = require("express");
const router = express.Router();

const Material = require("../models/Material");
const authMiddleware = require("../middlewares/authMiddleware");
router.get("/", authMiddleware, async (req, res) => {
  try {
    const materials = await Material.findAll();

    res.json(materials);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Hata oluştu",
    });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      criticalStock,
      unit,
      unitPrice,
      warehouseLocation,
      description,
      supplierId,
    } = req.body;

    const material = await Material.create({
      materialCode: "MLZ-" + Date.now(),
  materialCode: "MLZ-" + Date.now(),
  name,
  category,
  quantity,
  criticalStock,
  unit,
  unitPrice,
  warehouseLocation,
  description,
  supplierId,
});

    res.status(201).json(material);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Hata oluştu",
    });
  }
});
module.exports = router;