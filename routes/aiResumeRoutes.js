const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const passport = require("../config/passport-local-strategy");
const controller = require("../controllers/aiResumeController");

const uploadDirectory = path.join(__dirname, "..", "storage", "uploads", "resume");
fs.mkdirSync(uploadDirectory, { recursive: true });
const upload = multer({ storage: multer.diskStorage({ destination: uploadDirectory, filename: (req, file, callback) => callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`) }), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, callback) => file.mimetype === "application/pdf" ? callback(null, true) : callback(new Error("Only PDF resumes are supported.")) });
const router = express.Router();

router.get("/", passport.checkAuthentication, controller.uploadPage);
router.post("/analyze", passport.checkAuthentication, upload.single("resume"), controller.analyze);
router.get("/:id", passport.checkAuthentication, controller.result);
module.exports = router;
