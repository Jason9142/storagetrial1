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

// Retrieve all commodities (admin)
router.get("/viewAll", [auth, admin], async (req, res) => {
  const commodities = await Commodity.find()
    .populate("owner", "-password -__v -commodities")
    .select("-__v");
  res.send(commodities);
});

// Retrieve 1 commodity by commodity._id (admin)
router.get("/:id", auth, async (req, res) => {
  const commodity = await Commodity.findOne({ _id: req.params.id })
    .select("-__v")
    .populate("owner");

  if (
    commodity.owner._id.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    return res.status(403).send("Access denied!");
  }

  res.send(commodity);
});

// Retrieve all commodities of 1 user (admin) - using id / email
router.get("/getByOwner/:id", [auth, admin], async (req, res) => {
  const commodities = await Commodity.find({ owner: req.params.id }).select(
    "-__v"
  );
  res.send(commodities);
});

// Retrieve all commodities of users (user) - using web token
router.get("/", auth, async (req, res) => {
  const commodities = await Commodity.find({ owner: req.user._id })
    // .populate({
    //   path: "owner",
    //   select: "-password -__v -commodities"
    // })
    .select("-__v")
    .populate("owner", "-password -__v -commodities");
  res.send(commodities);
});

// passing commodity id
router.put("/:id", [auth, admin], async (req, res) => {
  let commodity = await Commodity.findById({ _id: req.params.id });
  if (!commodity) return res.status(400).send("Invalid commodity");

  let reqBodyUser = await User.findOne({ customerNum: req.body.customerNum });
  if (!reqBodyUser) return res.status(400).send("Invalid user");

  // different owner, need to delete from old, create new
  if (reqBodyUser._id.toString() !== commodity.owner.toString()) {
    const oldUser = await User.findById(commodity.owner);
    oldUser.commodities = _.remove(
      oldUser.commodities,
      c => c.toString() !== commodity._id.toString()
    );
    await oldUser.save();

    reqBodyUser.commodities.push(commodity._id);
    await reqBodyUser.save();
    req.body.owner = reqBodyUser._id.toString();
  } else {
    req.body.owner = commodity.owner.toString();
  }

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  commodity = await Commodity.findOneAndUpdate(
    { _id: req.params.id },
    _.pick(req.body, [
      "owner",
      "type",
      "description",
      "date",
      "certificateNum",
      "sealNum",
      "serialNum",
      "storageLocation",
      "quantity",
      "totalWeight",
      "costPerPieceSGD",
      "costPerPieceUSD",
      "costPriceTotalSGD",
      "costPriceTotalUSD",
      "conversionRate",
      "customerNum"
    ]),
    { new: true }
  );

  await commodity.save();
  res.send(commodity);
});

router.post("/:id", [auth, admin], async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("Invalid customer");

  req.body.owner = user._id.toString();
  req.body.customerNum = user.customerNum;
  req.body.costPriceTotalSGD = Number(req.body.costPriceTotalSGD);
  req.body.costPriceTotalUSD = Number(req.body.costPriceTotalUSD);
  delete req.body._id;

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const commodity = new Commodity(
    _.pick(req.body, [
      "owner",
      "type",
      "description",
      "date",
      "certificateNum",
      "sealNum",
      "serialNum",
      "storageLocation",
      "quantity",
      "totalWeight",
      "costPerPieceSGD",
      "costPerPieceUSD",
      "costPriceTotalSGD",
      "costPriceTotalUSD",
      "conversionRate",
      "customerNum"
    ])
  );

  user.commodities.push(commodity._id);
  await user.save();

  await commodity.save();
  return res.send(commodity);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const commodity = await Commodity.findById(req.params.id);
  if (!commodity) return res.status(400).send("Commodity not found!");

  const user = await User.findById(commodity.owner);
  if (!user)
    return res.status(400).send("Commodity does not belong to a client!");

  user.commodities = _.remove(user.commodities, c => {
    return c.toString() !== commodity._id.toString();
  });
  await user.save();

  let commodityArchive = {};
  await Commodity.findById(commodity._id).then(async function(response) {
    const commodity = { ...response._doc };

    delete commodity.__v;
    delete commodity._id;
    commodity.archiveStatus = req.body.archiveStatus;

    commodityArchive = new CommodityArchive(commodity);

    await commodityArchive.save();
    await response.delete();
  });
  res.send(commodityArchive);
});

module.exports = router;

// try {
//   await new Fawn.Task()
//     .initModel("commodities", {
//       owner: { type: mongoose.Schema.Types.ObjectId, required: true },
//       imgUrl: { type: String, required: true },
//       description: { type: String, required: true },
//       date: { type: Date, required: true }
//     })
//     .save("commodities", commodity)
//     .update(
//       "users",
//       { _id: user._id },
//       {
//         $push: { commodities: commodity._id }
//       }
//     )
//     .run({ useMongoose: true });

//   return res.send(commodity);
// } catch (ex) {
//   console.log(ex);
//   return res.status(500).send(ex);
// }
