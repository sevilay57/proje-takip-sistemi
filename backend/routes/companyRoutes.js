const express = require("express");
const router = express.Router();

const Company = require("../models/Company");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    const company = await Company.create({
      name,
      phone,
      email,
      address,
    });

    res.json({
      message: "Firma eklendi",
      company,
    });
  } catch (error) {
    res.status(500).json({
      message: "Hata oluştu",
      error: error.message,
    });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const companies = await Company.findAll();
  res.json(companies);
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Company.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (deleted === 0) {
      return res.status(404).json({
        message: "Firma bulunamadı",
      });
    }

    res.json({
      message: "Firma silindi",
    });

  } catch (error) {

    res.status(500).json({
      message: "Firma silinemedi. Bu firma tekliflerde kullanılıyor olabilir.",
      error: error.message,
    });

  }
});

module.exports = router;