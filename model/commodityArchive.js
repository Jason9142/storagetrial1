const Joi = require("joi");
const mongoose = require("mongoose");

const CommodityArchive = mongoose.model(
  "CommodityArchive",
  new mongoose.Schema({
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserArchive"
    },
    type: {
      type: String,
      required: true,
      enum: ["gold", "silver", "platinum"],
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: 512,
      required: true
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    // endDate: Date,
    certificateNum: {
      type: String,
      required: true
    },
    sealNum: {
      type: String,
      required: true
    },
    serialNum: {
      type: String,
      required: true
    },
    storageLocation: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    totalWeight: {
      type: Number,
      required: true,
      min: 0
    },
    costPerPieceSGD: {
      type: Number,
      required: true,
      min: 0
    },
    costPerPieceUSD: {
      type: Number,
      required: true,
      min: 0
    },
    costPriceTotalSGD: {
      type: Number,
      required: true,
      min: 0
    },
    costPriceTotalUSD: {
      type: Number,
      required: true,
      min: 0
    },
    conversionRate: {
      type: Number,
      required: true,
      min: 0
    },
    imgUrl: {
      type: String
      // required: true
    },
    archiveDate: {
      type: Date,
      default: Date.now(),
      required: true
    },
    archiveStatus: {
      type: String,
      required: true,
      enum: ["Transferred", "Released", "Sold back to GSC"],
      trim: true
    },
    customerNum: {
      type: String,
      required: true
    }
  })
);

function validateCommodities(commodity) {
  const schema = {
    owner: Joi.string().required(),
    type: Joi.string()
      .valid(["gold", "silver", "platinum"])
      .insensitive()
      .required(),
    date: Joi.date(),
    certificateNum: Joi.string().required(),
    sealNum: Joi.string().required(),
    serialNum: Joi.string().required(),
    storageLocation: Joi.string().required(),
    description: Joi.string().required(),
    quantity: Joi.number().required(),
    totalWeight: Joi.number().required(),
    costPerPieceSGD: Joi.number().required(),
    costPerPieceUSD: Joi.number().required(),
    costPriceTotalSGD: Joi.number().required(),
    costPriceTotalUSD: Joi.number().required(),
    conversionRate: Joi.number().required(),
    imgUrl: Joi.string().optional(),
    customerNum: Joi.required(),
    archiveDate: Joi.date().required(),
    archiveStatus: Joi.string().required()
  };

  return Joi.validate(commodity, schema);
}

exports.CommodityArchive = CommodityArchive;
exports.validateCommodityArchive = validateCommodities;
