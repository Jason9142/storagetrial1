const pdf = require("../util/pdf");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Commodity } = require("../model/commodity");
const { CommodityArchive } = require("../model/commodityArchive");
const admin = require("../middleware/admin");

router.get("/archive/:id", [auth, admin], async (req, res) => {
  const userID = req.params.id;
  const commodities = await CommodityArchive.find({ owner: userID }).populate(
    "owner"
  );
  const path = pdf(userID, commodities);
  setTimeout(() => {
    res.download(path);
  }, 100);
});

// Generate PDF using web token (user)
router.get("/:id", auth, async (req, res) => {
  const userID = req.params.id;
  const commodities = await Commodity.find({ owner: userID }).populate("owner");

  const path = pdf(userID, commodities);
  setTimeout(() => {
    res.download(path);
  }, 100);
});

// Generate PDF for all commodities (admin)
router.get("/", [auth, admin], async (req, res) => {
  const commodities = await Commodity.find().populate("owner");
  const path = pdf(req.user._id, commodities);
  // res.download(path);
  setTimeout(() => {
    res.download(path);
  }, 100);
});

module.exports = router;
