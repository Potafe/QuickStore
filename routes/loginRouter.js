var express = require("express");
var router = express.Router();
const loginController = require("../controllers/loginController");
const passport = require("passport");

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.get("/", loginController.getLogin);
router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

module.exports = router;
