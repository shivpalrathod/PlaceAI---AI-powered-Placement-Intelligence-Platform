//Create the same instance of mongoose which is used in the MongoDB configuration inside config
const mongoose = require("mongoose");

//Create the DB Schema
const companySchema = new mongoose.Schema(
	{
		date: {
			type: Date,
			required: true,
		},
		name: {
			type: String,
			trim: true,
			required: true,
		},
		results: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Result",
			},
		],
		interviews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Interview",
			},
		],
		// Optional placement-drive criteria used by the AI matching and eligibility modules.
		jobRole: { type: String, trim: true },
		requiredSkills: [{ type: String, trim: true }],
		minimumCgpa: { type: Number, min: 0, max: 10, default: 0 },
		allowedBacklogs: { type: Number, min: 0, default: 0 },
		// Company Intelligence Fields
		logo: { type: String, default: "" },
		website: { type: String, default: "" },
		package: { type: String, default: "" }, // e.g. "4-8 LPA"
		packageMin: { type: Number, default: 0 },
		packageMax: { type: Number, default: 0 },
		eligibilityDescription: { type: String, default: "" },
		interviewRounds: [{ type: String, trim: true }], // e.g. ["Aptitude", "Technical", "HR"]
		difficulty: {
			type: String,
			enum: ["Easy", "Medium", "Hard"],
			default: "Medium",
		},
		interviewProcess: { type: String, default: "" },
		domain: { type: String, default: "" }, // e.g. "IT Services", "Product"
		companyType: {
			type: String,
			enum: ["MNC", "Product", "Service", "Startup", "Other"],
			default: "Other",
		},
		rating: { type: Number, min: 0, max: 5, default: 0 },
	},
	{
		timestamps: true,
	}
);

companySchema.index({ minimumCgpa: 1, allowedBacklogs: 1 });

//Create a Model/Collection to populate the data with the same name for the schema in the DB
const Company = mongoose.model("Company", companySchema);

//Export the Model
module.exports = Company;
