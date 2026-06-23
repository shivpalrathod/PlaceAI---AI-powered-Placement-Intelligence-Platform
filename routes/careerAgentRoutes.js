const express = require("express");
const router = express.Router();
const passport = require("../config/passport-local-strategy");
const careerAgentController = require("../controllers/careerAgentController");

router.get("/", passport.checkAuthentication, careerAgentController.agentPage);
router.post("/chat", passport.checkAuthentication, careerAgentController.chat);

module.exports = router;
