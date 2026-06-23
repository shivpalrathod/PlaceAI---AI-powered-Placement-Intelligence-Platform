//Require the existing Express
const express = require("express");
//Create an Index Router
const router = express.Router();

//Require the Home Router
const homeRouter = require("./home");
//Require the Jobs Router
const jobsRouter = require("./jobs");
//Require the Downloads Router
const downloadsRouter = require("./downloads");
//Require the Students Router
const studentsRouter = require("./students");
//Require the Interviews Router
const interviewsRouter = require("./interviews");

// AI Features
const resumeRouter = require("./resume");
const aiResumeRouter = require("./aiResumeRoutes");
const jobMatchRouter = require("./jobMatchRoutes");
const interviewAIRouter = require("./interviewAIRoutes");
const eligibilityRouter = require("./eligibilityRoutes");
const aiAnalyticsRouter = require("./aiAnalyticsRoutes");

// NEW — AI Platform Features
const jobsRecommendRouter = require("./jobsRecommendRoutes");
const internshipRouter = require("./internshipRoutes");
const careerAgentRouter = require("./careerAgentRoutes");
const skillGapRouter = require("./skillGapRoutes");
const companyIntelRouter = require("./companyIntelRoutes");

//Use the Home Router
router.use("/", homeRouter);
//Use the Jobs Router
router.use("/jobs", jobsRouter);
//Use the Downloads Router
router.use("/report", downloadsRouter);
//Use the Students Router
router.use("/students", studentsRouter);
//Use the Interviews Router
router.use("/interviews", interviewsRouter);

// AI Core Features
router.use("/resume", resumeRouter);
router.use("/ai/resume", aiResumeRouter);
router.use("/ai/job-match", jobMatchRouter);
router.use("/ai/interview", interviewAIRouter);
router.use("/ai/eligibility", eligibilityRouter);
router.use("/ai/analytics", aiAnalyticsRouter);

// AI Platform Features
router.use("/ai/jobs", jobsRecommendRouter);
router.use("/ai/internships", internshipRouter);
router.use("/ai/career-agent", careerAgentRouter);
router.use("/ai/skill-gap", skillGapRouter);
router.use("/ai/companies", companyIntelRouter);

//Export the Index Router
module.exports = router;

