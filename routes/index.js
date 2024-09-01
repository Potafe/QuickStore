var express = require("express");
var router = express.Router();
const indexController = require("../controllers/indexController");

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get("/", indexController.getIndex);
router.post("/", indexController.postIndex);

module.exports = router;
