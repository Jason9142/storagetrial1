const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  customerNum: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  password: {
    type: String,
    minlength: 8,
    maxlength: 255,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: true
  },
  commodities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commodity",
      default: []
    }
  ],
  endDate: {
    type: Date,
    default: Date.now()
  },
  // Updatable personal details for users
  identificationNum: {
    // Passport or NRIC
    type: String,
    required: true
  },
  newIdentificationNum: {
    type: String
  },
  proofOfIdentification: {
    type: String,
    required: true
  },
  newProofOfIdentification: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  newEmail: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  newAddress: {
    type: String
  },
  proofOfAddress: {
    type: String,
    required: true
  },
  newProofOfAddress: {
    type: String
  },
  contactNum: {
    type: String,
    required: true
  },
  newContactNum: { type: String },
  // Password reset
  token: {
    type: String,
    default: undefined
  },
  tokenExpires: {
    type: Date,
    default: undefined
  },
  // Login timestamp
  lastLogin: {
    type: Date
  },
  newLogin: {
    type: Date
  }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this.id,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin,
      lastLogin: this.lastLogin
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    customerNum: Joi.string()
      .required()
      .error(errors => {
        return {
          message: "Customer no. is required!"
        };
      }),
    name: Joi.string()
      .required()
      .min(5)
      .max(50),
    isAdmin: Joi.boolean(),
    endDate: Joi.date().required(),
    dateOfBirth: Joi.string().required(),
    password: Joi.string()
      .required()
      .min(5)
      .max(1024)
      .error(errors => {
        return {
          message: "Password is required!"
        };
      }),
    email: Joi.string()
      .required()
      .email(),
    newEmail: Joi.string()
      .optional()
      .email(),
    commodities: Joi.array(),
    identificationNum: Joi.string().required(),
    newIdentificationNum: Joi.string().optional(),
    proofOfIdentification: Joi.string().required(),
    newProofOfIdentification: Joi.string().optional(),
    address: Joi.string().required(),
    newAddress: Joi.string().optional(),
    proofOfAddress: Joi.string().required(),
    newProofOfAddress: Joi.string().optional(),
    contactNum: Joi.string().required(),
    newContactNum: Joi.string().optional(),
    token: Joi.string().optional(),
    tokenExpires: Joi.date().optional()
  };

  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
