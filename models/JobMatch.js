const mongoose = require("mongoose");

const jobMatchSchema = new mongoose.Schema(
	{
		student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
		company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
		resumeAnalysis: { type: mongoose.Schema.Types.ObjectId, ref: "ResumeAnalysis" },
		matchPercentage: { type: Number, required: true, min: 0, max: 100 },
		matchedSkills: [{ type: String, trim: true }],
		missingSkills: [{ type: String, trim: true }],
		recommendedLearningPath: [{ type: String, trim: true }],
		hiringProbability: { type: String, enum: ["Low", "Medium", "High"], required: true },
		analysisSource: { type: String, enum: ["gemini", "local"], default: "local" },
	},
	{ timestamps: true }
);

jobMatchSchema.index({ student: 1, company: 1, createdAt: -1 });
module.exports = mongoose.model("JobMatch", jobMatchSchema);
