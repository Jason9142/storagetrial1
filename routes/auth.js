// login
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { User } = require("../model/user");
const { twoFactorAuthorisation } = require("../util/email");

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password");

  user.token = crypto.randomBytes(20).toString("hex");
  user.tokenExpires = Date.now() + 300000; // valid for 5 minutes

  await user.save();
  await twoFactorAuthorisation(req.headers.origin, user.email, user.token);

  res.send("Please check your email to perform 2-factor authorization.");
});

router.get("/:token", async (req, res) => {
  const token = req.params.token;

  const user = await User.findOne({ token, tokenExpires: { $gt: Date.now() } });
  if (!user) return res.status(400).send("Invalid token or token has expired!");

  user.lastLogin = user.newLogin ? user.newLogin : Date.now();
  user.newLogin = Date.now();
  user.token = undefined;
  user.tokenExpires = undefined;

  const jwt = user.generateAuthToken();
  await user.save();

  res.send(jwt);
});

function validateUser(req) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;
