const express = require("express");
const passport = require("../config/passport-local-strategy");
const controller = require("../controllers/analyticsController");
const router = express.Router();
router.get("/", passport.checkAuthentication, controller.dashboard);
module.exports = router;
