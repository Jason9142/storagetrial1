const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const multer = require("multer");
const { Commodity } = require("../model/commodity");
const path = require("path");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/img");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const { mimetype } = file;
  if (
    mimetype === "image/png" ||
    mimetype === "image/jpeg" ||
    mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    return cb(new Error("Invalid file type"), false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post("/", [auth, admin, upload.single("image")], async (req, res) => {
  const { path: dirpath, originalname } = req.file;
  // sealNum === filename
  const sealNum = path.basename(originalname, path.extname(originalname));

  const commodities = await Commodity.find({ sealNum });

  await Promise.all(
    commodities.map(async commodity => {
      commodity.imgUrl = path.normalize(dirpath);
      await commodity.save();
    })
  );
  res.send("Image succesfully uploaded!");
});

// updating sealNum and imgUrl
router.put("/", [auth, admin, upload.single("image")], async (req, res) => {
  const { path: dirpath, originalname } = req.file;
  const { oldSealNum: sealNum } = req.body;
  const filename = path.basename(originalname, path.extname(originalname));

  const commodities = await Commodity.find({ sealNum });
  if (commodities.length === 0)
    return res.status(400).send(`No commodities with seal number ${sealNum}`);

  Promise.all(
    commodities.map(async commodity => {
      commodity.imgUrl = path.normalize(dirpath);
      commodity.sealNum = filename;
      await commodity.save();
    })
  );
  res.send("Seal number updated!");
});

module.exports = router;
