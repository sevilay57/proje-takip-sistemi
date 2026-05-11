const express = require("express");
const router = express.Router();

const OfferItem = require("../models/OfferItem");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {

  try {

    const {
      offerId,
      productName,
      quantity,
      unitPrice
    } = req.body;

    const totalPrice = quantity * unitPrice;

    const offerItem = await OfferItem.create({
      offerId,
      productName,
      quantity,
      unitPrice,
      totalPrice,
    });

    res.json({
      message: "Teklif kalemi eklendi",
      offerItem,
    });

  } catch (error) {

    res.status(500).json({
      message: "Hata oluştu",
      error: error.message,
    });

  }

});

router.get("/:offerId", authMiddleware, async (req, res) => {

  const items = await OfferItem.findAll({
    where: {
      offerId: req.params.offerId,
    },
  });

  res.json(items);

});

module.exports = router;