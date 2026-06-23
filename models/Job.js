const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		company: { type: String, required: true, trim: true },
		companyLogo: { type: String, default: "" },
		location: { type: String, required: true, trim: true },
		type: {
			type: String,
			enum: ["full-time", "part-time", "contract", "remote"],
			default: "full-time",
		},
		category: {
			type: String,
			enum: ["software", "data", "devops", "design", "management", "other"],
			default: "software",
		},
		experience: { type: String, default: "0-1 years (Fresher)" },
		package: { type: String, default: "" }, // e.g. "4.5 LPA"
		packageMin: { type: Number, default: 0 }, // numeric for sorting
		skills: [{ type: String, trim: true }],
		description: { type: String, default: "" },
		applyLink: { type: String, default: "#" },
		isActive: { type: Boolean, default: true },
		isFresher: { type: Boolean, default: true },
		source: {
			type: String,
			enum: ["seeded", "adzuna", "jsearch", "manual"],
			default: "seeded",
		},
		postedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

jobSchema.index({ company: 1, title: 1 }, { unique: true });
jobSchema.index({ skills: 1 });
jobSchema.index({ isActive: 1, isFresher: 1 });

module.exports = mongoose.model("Job", jobSchema);
