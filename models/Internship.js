const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		company: { type: String, required: true, trim: true },
		companyLogo: { type: String, default: "" },
		location: { type: String, required: true, trim: true },
		isRemote: { type: Boolean, default: false },
		category: {
			type: String,
			enum: ["software", "data", "design", "marketing", "finance", "other"],
			default: "software",
		},
		duration: { type: String, default: "2 months" }, // e.g. "3 months"
		stipend: { type: String, default: "Unpaid" }, // e.g. "₹15,000/month"
		stipendAmount: { type: Number, default: 0 }, // numeric for sorting
		skills: [{ type: String, trim: true }],
		description: { type: String, default: "" },
		applyLink: { type: String, default: "#" },
		isActive: { type: Boolean, default: true },
		source: {
			type: String,
			enum: ["seeded", "internshala", "manual"],
			default: "seeded",
		},
		postedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

internshipSchema.index({ company: 1, title: 1 }, { unique: true });
internshipSchema.index({ skills: 1 });
internshipSchema.index({ isActive: 1 });

module.exports = mongoose.model("Internship", internshipSchema);
