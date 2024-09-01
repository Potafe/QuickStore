var express = require("express");
var router = express.Router();
const signupController = require("../controllers/signupController");
const passport = require("passport");

router.get("/", signupController.getSignUp);
router.post("/", signupController.postSignUp);

module.exports = router;
