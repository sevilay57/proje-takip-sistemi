const express = require("express");
const router = express.Router();

const Offer = require("../models/Offer");
const Company = require("../models/Company");
Offer.belongsTo(Company, {
  foreignKey: "companyId",
});
const Project = require("../models/Project");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, companyId, amount } = req.body;

    const offer = await Offer.create({
      title,
      companyId,
      amount,
    });

    res.json({
      message: "Teklif oluşturuldu",
      offer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Hata oluştu",
      error: error.message,
    });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const offers = await Offer.findAll({
  include: Company,
});
  res.json(offers);
});

router.put("/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;

  const offer = await Offer.findByPk(req.params.id);

  if (!offer) {
    return res.status(404).json({
      message: "Teklif bulunamadı",
    });
  }

  offer.status = status;
  await offer.save();

  res.json({
    message: "Teklif durumu güncellendi",
    offer,
  });
});

router.post("/:id/create-project", authMiddleware, async (req, res) => {
  const offer = await Offer.findByPk(req.params.id);

  if (!offer) {
    return res.status(404).json({
      message: "Teklif bulunamadı",
    });
  }

  const project = await Project.create({
    title: offer.title,
    description: "Tekliften oluşturulan proje",
    status: "Devam Ediyor",
  });

  offer.status = "Onaylandı";
  await offer.save();

  res.json({
    message: "Teklif projeye dönüştürüldü",
    project,
  });
});

router.delete("/:id", authMiddleware, async (req, res) => {
  await Offer.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.json({
    message: "Teklif silindi",
  });
});

module.exports = router;