let express = require("express"),
  multer = require("multer"),
  mongoose = require("mongoose"),
  { v4: uuidv4 } = require("uuid"), // TODO Remove UUID; use MD5 of contents
  router = express.Router();

// TODO Read from env var
const DIR = "/public/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    console.log("Filename: " + fileName);
    cb(null, uuidv4() + "-" + fileName);
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

let Company = require("../models/Company");
let company;

router.post(
  "/upload-pitch-deck",
  upload.single("pitchDeck"),
  (req, res, next) => {
    const url = `${req.protocol}://${req.get("host")}`;
    console.log("URL is: ", url);
    //console.log("Request is: ", req);

    company = new Company({
      _id: new mongoose.Types.ObjectId(),
      name: req.file.filename,
      pitchDeck: `${url}${DIR}${req.file.originalname}`,
    });

    company
      .save()
      .then((result) => {
        console.log(result);
        res.status(201).json({
          message: "Pitch deck has been uploaded successfully.",
          companyCreated: {
            _id: result._id,
            name: result.name,
            pitchDeck: result.pitchDeck,
          },
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          error: error,
        });
      });
  }
);

router.get("/", (req, res, next) => {
  Company.find().then((data) => {
    res.status(200).json({
      message: "Pitch deck retrieved successfully",
      companies: data,
    });
  });
});

module.exports = router;
