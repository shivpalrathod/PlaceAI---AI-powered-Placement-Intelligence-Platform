const mongoose = require("mongoose");

const eligibilityResultSchema = new mongoose.Schema(
	{
		student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
		company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
		eligible: { type: Boolean, required: true },
		reasons: [{ type: String, trim: true }],
		selectionProbability: { type: String, enum: ["Low", "Medium", "High"], required: true },
		criteriaSnapshot: {
			minimumCgpa: Number,
			allowedBacklogs: Number,
			requiredSkills: [String],
		},
	},
	{ timestamps: true }
);

eligibilityResultSchema.index({ student: 1, company: 1, createdAt: -1 });
module.exports = mongoose.model("EligibilityResult", eligibilityResultSchema);
