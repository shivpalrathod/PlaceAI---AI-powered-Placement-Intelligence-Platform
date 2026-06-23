const Internship = require("../models/Internship");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const Student = require("../models/student");
const { rankInternships } = require("../services/matchingService");

module.exports.internshipsPage = async (req, res) => {
	try {
		const internships = await Internship.find({ isActive: true }).sort({ stipendAmount: -1 });

		let studentSkills = [];
		let latestAnalysis = null;
		let recommendedInterns = [];

		if (req.user && req.user.skills && req.user.skills.length > 0) {
			studentSkills = req.user.skills || [];
			latestAnalysis = await ResumeAnalysis.findOne({ employee: req.user._id }).sort({ createdAt: -1 });
		}

		if (studentSkills.length === 0) {
			const analyses = await ResumeAnalysis.find({}).sort({ createdAt: -1 }).limit(1);
			if (analyses.length > 0) {
				latestAnalysis = analyses[0];
				studentSkills = latestAnalysis.technicalSkills || [];
			}
		}

		if (studentSkills.length > 0) {
			recommendedInterns = rankInternships(studentSkills, internships, 20);
		} else {
			recommendedInterns = internships.slice(0, 20).map((i) => ({
				...i.toObject(),
				matchPercent: 0,
				matched: [],
				missing: i.skills || [],
			}));
		}

		const categories = ["software", "data", "design", "marketing", "finance", "other"];

		return res.render("ai-internships", {
			title: "AI Internship Recommendations",
			internships: recommendedInterns,
			categories,
			studentSkills,
			hasAnalysis: !!latestAnalysis,
			totalInternships: internships.length,
		});
	} catch (error) {
		console.error(error);
		req.flash("error", "Unable to load internship recommendations.");
		return res.redirect("/");
	}
};

module.exports.apiRecommended = async (req, res) => {
	try {
		const { studentId } = req.query;
		let studentSkills = [];

		if (studentId) {
			const student = await Student.findById(studentId);
			if (student) studentSkills = student.skills || [];
		}

		if (studentSkills.length === 0) {
			const analysis = await ResumeAnalysis.findOne({}).sort({ createdAt: -1 });
			if (analysis) studentSkills = analysis.technicalSkills || [];
		}

		const internships = await Internship.find({ isActive: true }).sort({ stipendAmount: -1 });
		const ranked = rankInternships(studentSkills, internships, 15);

		return res.json({ success: true, internships: ranked, studentSkills });
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};
