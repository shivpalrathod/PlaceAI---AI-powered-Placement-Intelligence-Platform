const express = require("express");
const passport = require("../config/passport-local-strategy");
const controller = require("../controllers/eligibilityController");
const router = express.Router();
router.get("/", passport.checkAuthentication, controller.page);
router.post("/check", passport.checkAuthentication, controller.check);
module.exports = router;
