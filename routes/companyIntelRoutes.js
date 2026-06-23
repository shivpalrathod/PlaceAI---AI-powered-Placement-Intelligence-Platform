const express = require("express");
const router = express.Router();
const passport = require("../config/passport-local-strategy");
const companyIntelController = require("../controllers/companyIntelController");

router.get("/", passport.checkAuthentication, companyIntelController.companiesPage);
router.get("/:name", passport.checkAuthentication, companyIntelController.companyDetail);

module.exports = router;
