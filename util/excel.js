const xlsx = require("xlsx");
const _ = require("lodash");
const { Commodity, validate } = require("../model/commodity");
const { User } = require("../model/user");
const pathModule = require("path");
const { Excel, validate: validateExcel } = require("../model/excel");
const fs = require("fs");

module.exports = async function(relativePath, filename, destination) {
  const errors = [];
  const erroneousArray = [];
  let array;

  let dir = pathModule.normalize(
    `${pathModule.dirname(__dirname)}/${relativePath}`
  );

  try {
    const wb = await xlsx.readFile(dir, { cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    array = xlsx.utils.sheet_to_json(ws);
    if (array.length === 0) errors.push("Sheet is empty");
  } catch (ex) {
    fs.unlink(dir, err => {
      if (err) throw err;
      throw new Error(error);
    });
  }

  // transferToMongo
  await Promise.all(
    array.map(async data => {
      const dataCopy = { ...data };
      // dataCopy.imgUrl = pathModule.normalize(`uploads/img/${data.sealNum}`);
      const response = await transferToMongo(dataCopy);
      if (response) {
        data.errors = response;
        erroneousArray.push(data);
        errors.push(`${response} on line ${erroneousArray.length + 1}`);
      }
    })
  );

  // Create excel
  if (erroneousArray.length > 0) {
    await createExcel(erroneousArray, filename, destination);
  }

  return { errors, erroneousArray };
};

// Transfer Excel entries to database
async function transferToMongo(data) {
  const user = await User.findOne({ customerNum: data.customerNum });
  if (!user) return `Customer ${data.customerNum} not found!`;

  const copy = { ...data };

  copy.owner = user._id.toString();
  copy.totalWeight = copy["totalWeight(oz)"];
  delete copy["totalWeight(oz)"];
  copy.conversionRate = copy["conversionRate (USD/SGD)"];
  delete copy["conversionRate (USD/SGD)"];

  copy.storageLocation = copy.storageLocation.toString();
  copy.certificateNum = copy.certificateNum.toString();
  copy.sealNum = copy.sealNum.toString();
  copy.customerNum = copy.customerNum.toString();
  copy.serialNum = copy.serialNum.toString();

  const { error } = validate(copy);
  if (error) return error.details[0].message;

  console.log(copy);

  const commodity = new Commodity(
    _.pick(copy, [
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
}

// Create Excel file for errorneous entries
async function createExcel(erroneousArray, filename, destination) {
  const erroneousArraySheet = xlsx.utils.json_to_sheet(erroneousArray);
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, erroneousArraySheet);

  const extname = pathModule.extname(filename);
  const basename = pathModule.basename(filename, extname);

  let path = pathModule.normalize(`${destination}/${basename}-error${extname}`);

  const object = {
    name: `${basename}-error${extname}`,
    path,
    created: Date.now()
  };

  const { error } = validateExcel(object);
  if (error) return errors.details[0].message;

  try {
    const file = new Excel(object);
    file.save(function(err, product) {
      if (err) {
        return err;
      }
      return xlsx.writeFile(newWorkbook, path);
    });
  } catch (ex) {
    return ex;
  }
}
