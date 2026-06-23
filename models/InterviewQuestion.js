const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
	{
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
		jobRole: { type: String, required: true, trim: true, index: true },
		experienceLevel: { type: String, enum: ["Fresher", "Junior", "Mid-level"], required: true },
		companyType: { type: String, required: true, trim: true },
		technicalQuestions: [{ question: String, difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] } }],
		hrQuestions: [{ question: String, difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] } }],
		scenarioQuestions: [{ question: String, difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] } }],
		codingQuestions: [{ question: String, difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] } }],
		analysisSource: { type: String, enum: ["gemini", "local"], default: "local" },
	},
	{ timestamps: true }
);

questionSchema.index({ jobRole: 1, experienceLevel: 1, createdAt: -1 });
module.exports = mongoose.model("InterviewQuestion", questionSchema);
