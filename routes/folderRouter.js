var express = require("express");
var router = express.Router();
const folderController = require("../controllers/folderController");

router.get("/", folderController.getAllFolders);

router.get("/:id", folderController.getFolder);

router.post("/:id", folderController.postFolder);

router.post("/:id/rename", folderController.postFolderRename);

router.post("/:id/delete", folderController.postFolderDelete);

module.exports = router;
