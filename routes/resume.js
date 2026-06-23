const express = require("express");
const router = express.Router();

const multer = require("multer");
const resumeController = require("../controllers/resume_controller");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "storage/uploads/resume");
    },

    filename: function(req, file, cb) {
        cb(
            null,
            Date.now() + "-" + file.originalname
        );
    }
});

const upload = multer({ storage });

router.post(
    "/upload",
    upload.single("resume"),
    resumeController.uploadResume
);

module.exports = router;