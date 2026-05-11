const express = require("express");
const router = express.Router();

const ProjectMaterial = require("../models/ProjectMaterial");
const Material = require("../models/Material");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { projectId, materialId, quantityUsed } = req.body;

    const material = await Material.findByPk(materialId);

    if (!material) {
      return res.status(404).json({
        message: "Malzeme bulunamadı",
      });
    }

    if (material.quantity < quantityUsed) {
      return res.status(400).json({
        message: "Stok miktarı yetersiz",
      });
    }

    const totalCost = quantityUsed * material.unitPrice;

    const projectMaterial = await ProjectMaterial.create({
      projectId,
      materialId,
      quantityUsed,
      totalCost,
    });

    material.quantity = material.quantity - quantityUsed;
    await material.save();

    res.json({
      message: "Malzeme projeye eklendi",
      projectMaterial,
    });

  } catch (error) {
    res.status(500).json({
      message: "Hata oluştu",
      error: error.message,
    });
  }
});

router.get("/:projectId", authMiddleware, async (req, res) => {
  const usedMaterials = await ProjectMaterial.findAll({
    where: {
      projectId: req.params.projectId,
    },
  });

  res.json(usedMaterials);
});

module.exports = router;