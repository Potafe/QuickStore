var express = require("express");
var router = express.Router();

const multer = require("multer");
const uploaderController = require("../controllers/uploaderController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "application/pdf",
    "text/plain",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get("/", (req, res) => {
  res.redirect("/");
});

router.get("/:id", uploaderController.getUploadFile);

router.post("/delete/:id", uploaderController.postDeleteFile);

router.post("/:id", upload.single("file"), uploaderController.postUploadFile);

module.exports = router;
