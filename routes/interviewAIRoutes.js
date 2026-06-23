const express = require("express");
const passport = require("../config/passport-local-strategy");
const controller = require("../controllers/interviewAIController");
const router = express.Router();
router.get("/", passport.checkAuthentication, controller.page);
router.post("/generate", passport.checkAuthentication, controller.generate);
router.get("/:id", passport.checkAuthentication, controller.result);
module.exports = router;
