//Create the same instance of mongoose which is used in the MongoDB configuration inside config
const mongoose = require("mongoose");

//Create the DB Schema
const studentSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: [3, "Name must be at least 3 Characters Long ❌"],
		},
		age: {
			type: Number,
			required: true,
			min: [1, "Age must be at least 1 Year Old ❌"],
			max: [100, "Age must be at most 100 Years Old ❌"],
		},
		gender: {
			type: String,
			required: true,
			lowercase: true,
			enum: ["male", "female", "other"],
		},
		college: {
			type: String,
			required: true,
			trim: true,
			minlength: 1,
		},
		status: {
			type: String,
			default: "not placed",
			trim: true,
			lowercase: true,
			enum: ["placed", "not placed"],
		},
		batch: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Batch",
		},
		interviews: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Interview",
			},
		],
		scores: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Score",
			},
		],
		results: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Result",
			},
		],
		avatar: {
			type: String,
		},
		// Optional placement data. These fields are additive so existing student records remain valid.
		cgpa: {
			type: Number,
			min: 0,
			max: 10,
		},
		backlogs: {
			type: Number,
			default: 0,
			min: 0,
		},
		skills: [{ type: String, trim: true }],
		resumePath: { type: String },
		atsScore: { type: Number, default: 0 },
		placementReadinessScore: { type: Number, default: 0 },
		projects: [{ type: String, trim: true }],
		certifications: [{ type: String, trim: true }],
		education: [{ type: String, trim: true }],
	},
	{
		timestamps: true,
	}
);

studentSchema.index({ cgpa: 1, backlogs: 1 });

//Create a Model/Collection to populate the data with the same name for the schema in the DB
const Student = mongoose.model("Student", studentSchema);

//Export the Model/Collection
module.exports = Student;
