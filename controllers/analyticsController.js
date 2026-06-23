const Student = require("../models/student");
const Company = require("../models/company");
const Interview = require("../models/interview");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const InterviewQuestion = require("../models/InterviewQuestion");
const Job = require("../models/Job");
const Internship = require("../models/Internship");

const frequency = (items) =>
	Object.entries(
		items.reduce((all, item) => {
			all[item] = (all[item] || 0) + 1;
			return all;
		}, {})
	)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);

// Escape JSON embedded into an inline script
const safeJson = (value) =>
	JSON.stringify(value)
		.replace(/</g, "\\u003c")
		.replace(/>/g, "\\u003e")
		.replace(/&/g, "\\u0026");

module.exports.dashboard = async (req, res) => {
	try {
		const [students, companies, interviews, analyses, questions, jobs, internships] =
			await Promise.all([
				Student.countDocuments(),
				Company.find({}),
				Interview.countDocuments(),
				ResumeAnalysis.find({}).sort({ createdAt: -1 }),
				InterviewQuestion.find({}),
				Job.countDocuments({ isActive: true }),
				Internship.countDocuments({ isActive: true }),
			]);

		// ATS stats
		const averageAts = analyses.length
			? Math.round(analyses.reduce((sum, item) => sum + item.atsScore, 0) / analyses.length)
			: 0;
		const topAts = analyses.length
			? Math.max(...analyses.map((a) => a.atsScore))
			: 0;

		// 1. Top skills across resumes
		const topSkills = frequency(analyses.flatMap((item) => item.technicalSkills || []));

		// 2. Demanded skills from companies
		const demandedSkills = frequency(companies.flatMap((item) => item.requiredSkills || []));

		// 3. Placement readiness distribution
		const readiness = { "0-39 (Beginner)": 0, "40-69 (Developing)": 0, "70-100 (Ready)": 0 };
		analyses.forEach((item) => {
			const score = item.placementReadinessScore;
			readiness[score < 40 ? "0-39 (Beginner)" : score < 70 ? "40-69 (Developing)" : "70-100 (Ready)"] += 1;
		});

		// 4. ATS Score Distribution (histogram buckets)
		const atsDistribution = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
		analyses.forEach((item) => {
			const s = item.atsScore;
			atsDistribution[s <= 20 ? "0-20" : s <= 40 ? "21-40" : s <= 60 ? "41-60" : s <= 80 ? "61-80" : "81-100"] += 1;
		});

		// 5. Monthly hiring trends (based on interview dates)
		const allInterviews = await Interview.find({}).populate("company");
		const monthlyHiring = {};
		const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		allInterviews.forEach((iv) => {
			if (iv.company && iv.company.date) {
				const d = new Date(iv.company.date);
				const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
				monthlyHiring[key] = (monthlyHiring[key] || 0) + 1;
			}
		});

		// 6. Top hiring companies by interview count
		const companyHiring = companies
			.map((c) => [c.name, (c.interviews || []).length])
			.sort((a, b) => b[1] - a[1])
			.slice(0, 8);

		// 7. Job categories
		const jobDocs = await Job.find({ isActive: true });
		const jobCategories = frequency(jobDocs.map((j) => j.category || "other"));

		// 8. Resume health overview (from analyses)
		const resumeHealth = {
			"Has Technical Skills": analyses.filter((a) => (a.technicalSkills || []).length > 3).length,
			"Has Soft Skills": analyses.filter((a) => (a.softSkills || []).length > 0).length,
			"ATS > 60": analyses.filter((a) => a.atsScore > 60).length,
			"Gemini Analyzed": analyses.filter((a) => a.analysisSource === "gemini").length,
			"Local Analyzed": analyses.filter((a) => a.analysisSource === "local").length,
		};

		return res.render("ai-analytics", {
			title: "AI Placement Analytics",
			metrics: {
				students,
				companies: companies.length,
				interviews,
				jobs,
				internships,
				averageAts,
				topAts,
				questionSets: questions.length,
				totalAnalyses: analyses.length,
			},
			chartData: {
				readiness: safeJson(readiness),
				demandedSkills: safeJson(demandedSkills),
				topSkills: safeJson(topSkills),
				atsDistribution: safeJson(atsDistribution),
				monthlyHiring: safeJson(monthlyHiring),
				companyHiring: safeJson(companyHiring),
				jobCategories: safeJson(jobCategories),
				resumeHealth: safeJson(resumeHealth),
			},
		});
	} catch (error) {
		console.error(error);
		req.flash("error", "Unable to load AI analytics.");
		return res.redirect("/");
	}
};

