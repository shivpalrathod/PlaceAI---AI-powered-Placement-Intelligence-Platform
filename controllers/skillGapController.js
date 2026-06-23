const ResumeAnalysis = require("../models/ResumeAnalysis");
const { analyzeSkillGap, INDUSTRY_SKILLS } = require("../services/skillGapService");

module.exports.skillGapPage = async (req, res) => {
	try {
		const targetRole = req.query.role || "Software Developer";

		let studentSkills = [];
		let studentName = "Student";
		let atsScore = 0;
		let hasAnalysis = false;
		let latestAnalysis = null;

		if (req.user && req.user.skills && req.user.skills.length > 0) {
			studentSkills = req.user.skills || [];
			studentName = req.user.name || "Student";
			atsScore = req.user.atsScore || 0;
			latestAnalysis = await ResumeAnalysis.findOne({ employee: req.user._id }).sort({ createdAt: -1 });
			if (latestAnalysis) {
				hasAnalysis = true;
			}
		}

		if (studentSkills.length === 0) {
			// Fallback to latest resume analysis for skills
			latestAnalysis = await ResumeAnalysis.findOne({})
				.sort({ createdAt: -1 })
				.populate("student");

			if (latestAnalysis) {
				studentSkills = latestAnalysis.technicalSkills || [];
				studentName = latestAnalysis.student?.name || "Student";
				atsScore = latestAnalysis.atsScore || 0;
				hasAnalysis = true;
			}
		}

		const gapAnalysis = analyzeSkillGap(studentSkills, targetRole);
		const allRoles = Object.keys(INDUSTRY_SKILLS);

		return res.render("skill-gap", {
			title: "Skill Gap Analysis",
			gapAnalysis,
			studentSkills,
			studentName,
			atsScore,
			hasAnalysis,
			targetRole,
			allRoles,
		});
	} catch (error) {
		console.error(error);
		req.flash("error", "Unable to load skill gap analysis.");
		return res.redirect("/");
	}
};

module.exports.apiAnalyze = async (req, res) => {
	try {
		const { skills, role } = req.body;
		const studentSkills = Array.isArray(skills) ? skills : (skills || "").split(",").map((s) => s.trim()).filter(Boolean);
		const gapAnalysis = analyzeSkillGap(studentSkills, role || "Software Developer");
		return res.json({ success: true, gapAnalysis });
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
};
