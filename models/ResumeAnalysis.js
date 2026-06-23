const mongoose = require("mongoose");

// Stores a versioned AI analysis for a student or employee's uploaded PDF resume.
const resumeAnalysisSchema = new mongoose.Schema(
	{
		student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: false, index: true },
		employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", index: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
		resumePath: { type: String, required: true },
		extractedText: { type: String, required: true, select: false },
		atsScore: { type: Number, required: true, min: 0, max: 100 },
		placementReadinessScore: { type: Number, required: true, min: 0, max: 100 },
		technicalSkills: [{ type: String, trim: true }],
		softSkills: [{ type: String, trim: true }],
		missingSkills: [{ type: String, trim: true }],
		strengths: [{ type: String, trim: true }],
		weaknesses: [{ type: String, trim: true }],
		improvementSuggestions: [{ type: String, trim: true }],
		projects: [{ type: String, trim: true }],
		certifications: [{ type: String, trim: true }],
		education: [{ type: String, trim: true }],
		improvements: {
			missingSections: [{ type: String, trim: true }],
			weakSections: [{ type: String, trim: true }],
			betterSummary: { type: String, trim: true },
			projectSuggestions: [{ type: String, trim: true }],
			skillsSuggestions: [{ type: String, trim: true }],
			grammarSuggestions: [{ type: String, trim: true }],
		},
		analysisSource: { type: String, enum: ["gemini", "local"], default: "local" },
	},
	{ timestamps: true }
);

resumeAnalysisSchema.index({ student: 1, createdAt: -1 });
resumeAnalysisSchema.index({ employee: 1, createdAt: -1 });
module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
