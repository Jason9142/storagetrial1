const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { User, validate } = require("../model/user");
const { UserArchive, validateUserArchive } = require("../model/userArchive");
const { Commodity } = require("../model/commodity");
const {
  CommodityArchive,
  validateCommodityArchive
} = require("../model/commodityArchive");

router.get("/", [auth, admin], async (req, res) => {
  const users = await UserArchive.find();
  if (!users) return res.status(400).send("No user found in archive!");

  res.send(users);
});

router.get("/:id", auth, async (req, res) => {
  if (req.params.id !== req.user._id)
    if (!req.user.isAdmin) return res.status(403).send("Permission denied!");

  const user = await UserArchive.findById(req.params.id).populate(
    "commodities"
  );
  if (!user) return res.status(400).send("User not found in archive!");

  res.send(user);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  let userToDelete = {};
  let user = {};
  let userRestore = {};
  let commoditiesRestore = [];

  await UserArchive.findById(req.params.id)
    .then(async response => {
      if (!response) return res.status(400).send("User not found in archive!");

      user = response._doc;
      userToDelete = response;

      const tempUser = await { ...user };
      delete tempUser._id;
      delete tempUser.__v;
      delete tempUser.archiveDate;

      userRestore = new User(tempUser);

      Promise.all([
        Promise.all(
          user.commodities.map(async commodity => {
            // Find commodity from archive to restore
            await CommodityArchive.findOne(commodity).then(async response => {
              // console.log(response);
              const commodityToRestore = { ...response._doc };
              delete commodityToRestore._id;
              delete commodityToRestore.__v;
              delete commodityToRestore.archiveDate;

              const commodityRestore = new Commodity(commodityToRestore);
              commoditiesRestore.push(commodityRestore._id);
              commodityRestore.owner = userRestore._id;

              await commodityRestore.save();
              // delete the response (the commodity from archive)
              await response.delete();
            });
          })
        ),
        await CommodityArchive.find({ owner: user._id }).then(
          async response => {
            const commoditiesInArchive = response;
            Promise.all(
              commoditiesInArchive.map(async commodity => {
                commodity.owner = userRestore._id;
                // commoditiesArchive.push(commodity._id);
                await commodity.save();
              })
            );
          }
        )
      ]).then(async resp => {
        userRestore.commodities = commoditiesRestore;

        await userRestore.save();
        await userToDelete.delete();
        res.send(userRestore);
      });
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

module.exports = router;
