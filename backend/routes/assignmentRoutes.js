const express = require("express");
const router = express.Router();

const ProjectPersonnel = require("../models/ProjectPersonnel");
const Personnel = require("../models/Personnel");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { projectId, personnelId } = req.body;

    const assignment = await ProjectPersonnel.create({
      projectId,
      personnelId,
    });

    res.json({
      message: "Personel projeye atandı",
      assignment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Hata oluştu",
      error: error.message,
    });
  }
});

router.get("/:projectId", authMiddleware, async (req, res) => {
  try {
    const assignments = await ProjectPersonnel.findAll({
      where: {
        projectId: req.params.projectId,
      },
    });

    const personnelIds = assignments.map((item) => item.personnelId);

    const personnels = await Personnel.findAll({
      where: {
        id: personnelIds,
      },
    });

    res.json(personnels);
  } catch (error) {
    res.status(500).json({
      message: "Hata oluştu",
      error: error.message,
    });
  }
});

router.delete("/:projectId/:personnelId", authMiddleware, async (req, res) => {
  try {
    await ProjectPersonnel.destroy({
      where: {
        projectId: req.params.projectId,
        personnelId: req.params.personnelId,
      },
    });

    res.json({
      message: "Personel projeden kaldırıldı",
    });
  } catch (error) {
    res.status(500).json({
      message: "Hata oluştu",
      error: error.message,
    });
  }
});

module.exports = router;