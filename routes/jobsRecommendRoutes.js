const express = require("express");
const router = express.Router();
const passport = require("../config/passport-local-strategy");
const jobsController = require("../controllers/jobsRecommendController");

router.get("/", passport.checkAuthentication, jobsController.jobsPage);
router.get("/api", passport.checkAuthentication, jobsController.apiRecommended);

module.exports = router;
