const Job = require("../models/Job");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const Student = require("../models/student");
const { rankJobs } = require("../services/matchingService");

module.exports.jobsPage = async (req, res) => {
	try {
		const jobs = await Job.find({ isActive: true }).sort({ packageMin: -1 });

		// Get student skills if a student is linked to session or query
		let studentSkills = [];
		let latestAnalysis = null;
		let recommendedJobs = [];

		if (req.user && req.user.skills && req.user.skills.length > 0) {
			studentSkills = req.user.skills || [];
			latestAnalysis = await ResumeAnalysis.findOne({ employee: req.user._id }).sort({ createdAt: -1 });
		}

		if (studentSkills.length === 0) {
			// Try to get latest resume analysis for any student
			const analyses = await ResumeAnalysis.find({}).sort({ createdAt: -1 }).limit(1);
			if (analyses.length > 0) {
				latestAnalysis = analyses[0];
				studentSkills = latestAnalysis.technicalSkills || [];
			}
		}

		if (studentSkills.length > 0) {
			recommendedJobs = rankJobs(studentSkills, jobs, 20);
		} else {
			recommendedJobs = jobs.slice(0, 20).map((j) => ({
				...j.toObject(),
				matchPercent: 0,
				matched: [],
				missing: j.skills || [],
			}));
		}

		// Category filter
		const categories = ["software", "data", "devops", "design", "management", "other"];
		const companySummary = {};
		jobs.forEach((j) => {
			if (!companySummary[j.company]) companySummary[j.company] = 0;
			companySummary[j.company]++;
		});

		return res.render("ai-jobs", {
			title: "AI Job Recommendations",
			jobs: recommendedJobs,
			allJobs: jobs,
			categories,
			companySummary,
			studentSkills,
			hasAnalysis: !!latestAnalysis,
			totalJobs: jobs.length,
		});
	} catch (error) {
		console.error(error);
		req.flash("error", "Unable to load job recommendations.");
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

		const jobs = await Job.find({ isActive: true }).sort({ packageMin: -1 });
		const ranked = rankJobs(studentSkills, jobs, 15);

		return res.json({ success: true, jobs: ranked, studentSkills });
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};
