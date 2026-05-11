const express = require("express");
const router = express.Router();

const Supplier = require("../models/Supplier");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    const supplier = await Supplier.create({
      name,
      phone,
      email,
      address,
    });

    res.json({
      message: "Tedarikçi eklendi",
      supplier,
    });
  } catch (error) {
    res.status(500).json({
      message: "Hata oluştu",
      error: error.message,
    });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const suppliers = await Supplier.findAll();
  res.json(suppliers);
});

router.delete("/:id", authMiddleware, async (req, res) => {
  await Supplier.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.json({
    message: "Tedarikçi silindi",
  });
});

module.exports = router;