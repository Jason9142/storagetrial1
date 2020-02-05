const express = require("express");
const router = express.Router();
const _ = require("lodash");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Commodity, validate } = require("../model/commodity");
const { User } = require("../model/user");
const {
  CommodityArchive,
  validateCommodityArchive
} = require("../model/commodityArchive");

router.get("/", [auth, admin], async (req, res) => {
  const commodities = await CommodityArchive.find();
  if (!commodities)
    return res.status(400).send("No commodity found in archive!");
  res.send(commodities);
});

router.get("/owner", auth, async (req, res) => {
  const commodity = await CommodityArchive.find({ owner: req.user._id });
  if (!commodity) return res.status(400).send("No commodity found in archive!");
  res.send(commodity);
});

router.get("/owner/:ownerId", [auth, admin], async (req, res) => {
  const commodity = await CommodityArchive.find({ owner: req.params.ownerId });
  if (!commodity) return res.status(400).send("No commodity found in archive!");
  res.send(commodity);
});

router.get("/:id", auth, async (req, res) => {
  const commodity = await CommodityArchive.findById(req.params.id);

  if (!commodity)
    return res.status(400).send("Commodity not found in archive!");

  if (commodity.owner.toString() !== req.user._id)
    if (!req.user.isAdmin) return res.status(403).send("Permission denied!");

  res.send(commodity);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const commodity = await CommodityArchive.findById(req.params.id);
  if (!commodity)
    return res.status(400).send("Commodity not found in archive!");

  const user = await User.findById(commodity.owner);
  if (!user)
    return res
      .status(400)
      .send("Commodity in archive does not belong to an existing client!");

  let commodityRestore = {};

  user.commodities.push();
  await user.save();

  // delete this from archive and send back to original database
  await CommodityArchive.findById(commodity._id).then(async response => {
    const commodity = { ...response._doc };
    delete commodity.__v;
    delete commodity._id;
    delete commodity.archiveDate;
    delete commodity.archiveStatus;

    commodityRestore = new Commodity(commodity);

    user.commodities.push(commodityRestore._id);

    await commodityRestore.save();
    await user.save();
    await response.delete();
  });

  res.send(commodityRestore);
});

module.exports = router;
