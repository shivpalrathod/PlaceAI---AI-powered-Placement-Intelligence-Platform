const express = require("express");
const router = express.Router();
const passport = require("../config/passport-local-strategy");
const internshipController = require("../controllers/internshipController");

router.get("/", passport.checkAuthentication, internshipController.internshipsPage);
router.get("/api", passport.checkAuthentication, internshipController.apiRecommended);

module.exports = router;
