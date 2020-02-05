const excel = require("../util/excel");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const multer = require("multer");
const _ = require("lodash");
const { Excel, validate } = require("../model/excel");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/excel");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    return cb(new Error("Invalid file type"), false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

//
//
//
// Receiving Excel file to populate commodities database
router.post(
  "/",
  [auth, admin, upload.single("commoditiesUpdateFile")],
  async (req, res) => {
    // Import from Excel
    const { path, filename, destination } = req.file;
    const exist = await Excel.findOne({ name: filename });
    if (exist) return res.status(400).send("File already exist in database!");

    let response;
    try {
      response = await excel(path, filename, destination);
    } catch (error) {
      return res.status(400).send(error.message);
    }

    const object = { name: filename, path, created: Date.now() };
    const { errors } = validate(object);
    if (errors) return res.status(400).send(errors.details[0].message);

    const file = new Excel(object);
    file.save(function(err, product) {
      if (err) return err;
      // res.send(file);
    });

    if (response.errors.length > 0) {
      return res.status(409).send(response);
    }

    res.send(file);
  }
);

router.get("/", [auth, admin], async (req, res) => {
  const excels = await Excel.find();
  if (!excels) return res.status(400).send("No excel file exist in database");

  res.send(excels);
});

module.exports = router;
