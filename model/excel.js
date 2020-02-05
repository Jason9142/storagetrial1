const Joi = require("joi");
const mongoose = require("mongoose");

const excelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  path: { type: String, required: true },
  created: {
    type: Date,
    required: true
  }
});

const Excel = mongoose.model("Excel", excelSchema);

function validateExcel(user) {
  const schema = {
    name: Joi.string().required(),
    path: Joi.string().required(),
    created: Joi.date().required()
  };
  return Joi.validate(user, schema);
}

exports.Excel = Excel;
exports.validate = validateExcel;
