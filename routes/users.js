const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { User, validate } = require("../model/user");
const { UserArchive } = require("../model/userArchive");
const { Commodity } = require("../model/commodity");
const { CommodityArchive } = require("../model/commodityArchive");
const hash = require("../util/hash");
const crypto = require("crypto");
const multer = require("multer");
const {
  sendPasswordRecovery,
  sendResetPasswordNotification,
  sendApproval,
  sendClientUpdateNotification,
  sendReject
} = require("../util/email");
const dateformat = require("dateformat");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/proof");
  },
  filename: function(req, file, cb) {
    const timestamp = dateformat(
      new Date().toLocaleString("default", {
        timeZone: "Asia/Singapore"
      }),
      "ddmmyyHHMMss"
    );
    cb(null, `${req.user._id}${timestamp}${file.originalname}`);
  }
});
const fileFilter = (req, file, cb) => {
  const { mimetype } = file;
  if (
    mimetype === "application/pdf" ||
    mimetype === "image/jpeg" ||
    mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    return cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// Retrieve all users (admin)
router.get("/viewAll", [auth, admin], async (req, res) => {
  const users = await User.find()
    .sort("name")
    .populate("commodities");
  res.send(users);
});

// Retrieve user of specified id (admin)
router.get("/:id", auth, async (req, res) => {
  if (req.params.id !== req.user._id)
    if (!req.user.isAdmin) return res.status(403).send("Permission denied!");

  const user = await User.findById(req.params.id).populate("commodities");
  if (!user) return res.status(400).send("User not found!");
  res.send(user);
});

// Retrieve user based on web token (user)
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -__v");
  res.send(user);
});

// Approve update of information (admin)
router.get("/approval/:id", [auth, admin], async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user)
    return res.status(400).send("The user with given ID is not found!");

  const {
    newIdentificationNum,
    newProofOfIdentification,
    newEmail,
    newAddress,
    newProofOfAddress,
    newContactNum
  } = user;

  if (newIdentificationNum) {
    user.identificationNum = newIdentificationNum;
    user.newIdentificationNum = undefined;
  }

  if (newProofOfIdentification) {
    user.proofOfIdentification = newProofOfIdentification;
    user.newProofOfIdentification = undefined;
  }

  if (newEmail) {
    user.email = newEmail;
    user.newEmail = undefined;
  }

  if (newAddress) {
    user.address = newAddress;
    user.newAddress = undefined;
  }

  if (newProofOfAddress) {
    user.proofOfAddress = newProofOfAddress;
    user.newProofOfAddress = undefined;
  }

  if (newContactNum) {
    user.contactNum = newContactNum;
    user.newContactNum = undefined;
  }

  await user.save();
  await sendApproval(req.headers.origin, user);
  res.send(user);
});

router.get("/reject/:id", [auth, admin], async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user)
    return res.status(400).send("The user with given ID is not found!");

  user.newIdentificationNum = undefined;
  user.newProofOfIdentification = undefined;
  user.newEmail = undefined;
  user.newAddress = undefined;
  user.newProofOfAddress = undefined;
  user.newContactNum = undefined;

  await user.save();
  await sendReject(req.headers.origin, user);
  res.send(user);
});

// Registering user (admin)
router.post(
  "/",
  [
    auth,
    admin,
    upload.fields([
      {
        name: "proofOfIdentification",
        maxCount: 1
      },
      {
        name: "proofOfAddress",
        maxCount: 1
      }
    ])
  ],
  async (req, res) => {
    const { proofOfAddress, proofOfIdentification } = req.files;
    req.body.proofOfAddress = proofOfAddress[0].path;
    req.body.proofOfIdentification = proofOfIdentification[0].path;

    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({
      customerNum: req.body.customerNum
    });
    if (user) return res.status(400).send("Customer no. already in use!");

    user = await User.findOne({
      email: req.body.email
    });
    if (user) return res.status(400).send("Email already in use!");

    let archiveUser = await UserArchive.findOne({
      customerNum: req.body.customerNum
    });
    if (archiveUser)
      return res.status(400).send("Customer no. already in use!");

    archiveUser = await UserArchive.findOne({
      email: req.body.email
    });
    if (archiveUser) return res.status(400).send("Email already in use!");

    user = new User(
      _.pick(req.body, [
        "customerNum",
        "name",
        "dateOfBirth",
        "password",
        "isAdmin",
        "commodities",
        "identificationNum",
        "email",
        "address",
        "contactNum",
        "proofOfAddress",
        "proofOfIdentification",
        "endDate"
      ])
    );

    user.password = await hash(user.password);
    await user.save();

    res.send(user);
  }
);

// Update user's info
router.put(
  "/:id",
  [
    auth,
    upload.fields([
      {
        name: "proofOfIdentification",
        maxCount: 1
      },
      {
        name: "proofOfAddress",
        maxCount: 1
      }
    ])
  ],
  async (req, res) => {
    if (req.files.proofOfAddress !== undefined) {
      const addressPath = req.files.proofOfAddress[0].path;
      if (req.user.isAdmin) {
        req.body.proofOfAddress = addressPath;
      } else {
        req.body.newProofOfAddress = addressPath;
      }
    }

    if (req.files.proofOfIdentification !== undefined) {
      const identificationPath = req.files.proofOfIdentification[0].path;
      if (req.user.isAdmin) {
        req.body.proofOfIdentification = identificationPath;
      } else {
        req.body.newProofOfIdentification = identificationPath;
      }
    }

    const updateDetails = req.user.isAdmin
      ? _.pick(req.body, [
          "isAdmin",
          "customerNum",
          "name",
          "identificationNum",
          "dateOfBirth",
          "email",
          "address",
          "contactNum",
          "proofOfIdentification",
          "proofOfAddress",
          "endDate"
        ])
      : _.pick(req.body, [
          "newIdentificationNum",
          "newEmail",
          "newAddress",
          "newContactNum",
          "newProofOfIdentification",
          "newProofOfAddress"
        ]);

    let user = null;
    const originalUser = await User.findById(req.params.id);

    if (req.user.isAdmin) {
      if (originalUser.customerNum !== req.body.customerNum) {
        user = await User.findOne({
          customerNum: req.body.customerNum
        });

        if (user) {
          return res.status(400).send("Customer no. already in use!");
        } else {
          const commodities = await Commodity.find({
            customerNum: originalUser.customerNum
          });

          const archivedCommodities = await CommodityArchive.find({
            customerNum: originalUser.customerNum
          });

          Promise.all([
            commodities.map(async c => {
              c.customerNum = req.body.customerNum;
              await c.save();
            }),
            archivedCommodities.map(async c => {
              c.customerNum = req.body.customerNum;
              await c.save();
            })
          ]);
        }
      }
    }

    user = await User.findOne({
      $or: [
        {
          email: req.body.email
        },
        {
          $and: [
            {
              newEmail: req.body.newEmail
            },
            {
              newEmail: {
                $not: {
                  $eq: null
                }
              }
            }
          ]
        }
      ]
    });
    if (user) return res.status(400).send("Email already in use!");

    user = await User.findOneAndUpdate(
      {
        _id: req.params.id
      },
      updateDetails,
      {
        new: true
      }
    );

    if (!user)
      return res.status(404).send("The user with given ID is not found!");

    if (!req.user.isAdmin)
      await sendClientUpdateNotification(req.headers.origin, user);

    res.send(user);
  }
);

// Update password (user)
router.put("/updatePassword/:id", auth, async (req, res) => {
  let user = await User.findById(
    req.user.isAdmin ? req.params.id : req.user._id
  );
  if (!user) return res.status(400).send("User not found!");

  if (!req.user.isAdmin) {
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) return res.status(400).send("Incorrect old password");
  }

  // Joi.validate(req.user, {
  //   password: Joi.string().required()
  // });

  req.user.password = await hash(req.body.newPassword);

  // const { error } = validate(userToValidate);
  // if (error) return res.status(400).send(error.details[0].message);

  user = await User.findByIdAndUpdate(
    req.params.id,
    _.pick(req.user, ["password"]),
    {
      new: true
    }
  );
  res.send(user);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  // const user = await User.findById(req.params.id);
  // if (!user)
  let userToDelete = {};
  let user = {};
  let userArchive = {};
  let commoditiesArchive = [];

  await User.findById(req.params.id)
    .then(async response => {
      if (!response) return res.status(400).send("User not found");
      user = response._doc;
      userToDelete = response;

      const tempUser = {
        ...user
      };
      delete tempUser._id;
      delete tempUser.__v;

      userArchive = new UserArchive(tempUser);

      Promise.all([
        await CommodityArchive.find({
          owner: user._id
        }).then(async response => {
          const commoditiesInArchive = response;

          Promise.all(
            commoditiesInArchive.map(async commodity => {
              commodity.owner = userArchive._id;
              // commoditiesArchive.push(commodity._id);
              await commodity.save();
            })
          );
        }),
        Promise.all(
          await user.commodities.map(async commodity => {
            //   await CommodityArchive.
            await Commodity.findOne(commodity).then(async response => {
              // console.log(response);
              const commodityToArchive = {
                ...response._doc
              };
              delete commodityToArchive._id;
              delete commodityToArchive.__v;
              commodityToArchive.archiveStatus = "Released";
              const commodityArchive = new CommodityArchive(commodityToArchive);
              // console.log(commodityArchive);
              commodityArchive.owner = userArchive._id;
              commoditiesArchive.push(commodityArchive._id);

              await commodityArchive.save();
              await response.delete();
            });
          })
        )
      ]).then(async resp => {
        userArchive.commodities = commoditiesArchive;

        await userArchive.save();
        await userToDelete.delete();
        res.send(userArchive);
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).send(err);
    });
});

router.post("/forgetPassword", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({
    email
  });
  if (!user)
    return res.status(400).send("No user registered under the provided email");

  const token = crypto.randomBytes(20).toString("hex");
  user.token = token;
  user.tokenExpires = Date.now() + 300000;

  // send the password to email
  await user.save();
  await sendPasswordRecovery(req.headers.origin, user, token);
  await sendResetPasswordNotification(user);

  res.send(`Email sent to ${email}`);
});

router.get("/resetPassword/:token", async (req, res) => {
  const user = await User.findOne({
    token: req.params.token,
    tokenExpires: {
      $gt: new Date(Date.now())
    }
  });

  if (!user)
    return res
      .status(400)
      .send("Password reset token is invalid or has expired.");

  await user.save();

  res.send("Redirecting to reset password page");
});

router.post("/resetPassword/:token", async (req, res) => {
  const user = await User.findOne({
    token: req.params.token,
    tokenExpires: {
      $gt: Date.now()
    }
  });

  if (!user)
    return res
      .status(400)
      .send("Password reset token is invalid or has expired.");

  user.password = await hash(req.body.newPassword);
  user.token = undefined;
  user.tokenExpires = undefined;

  await user.save();
  res.send("Your password has been changed!");
});

// *********************************************************** \\

module.exports = router;
