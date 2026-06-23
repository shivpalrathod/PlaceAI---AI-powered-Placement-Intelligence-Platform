const express = require("express");
const router = express.Router();
const passport = require("../config/passport-local-strategy");
const skillGapController = require("../controllers/skillGapController");

router.get("/", passport.checkAuthentication, skillGapController.skillGapPage);
router.post("/analyze", passport.checkAuthentication, skillGapController.apiAnalyze);

module.exports = router;
