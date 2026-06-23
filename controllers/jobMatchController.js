const Student = require("../models/student");
const Company = require("../models/company");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const JobMatch = require("../models/JobMatch");
const { generateJson } = require("../services/geminiService");

const cleanList = (value) => Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean))] : [];
const probability = (score) => score >= 75 ? "High" : score >= 45 ? "Medium" : "Low";

module.exports.page = async (req, res) => {
	try { return res.render("job-match", { title: "AI Job Match", students: await Student.find({}).sort({ name: 1 }), companies: await Company.find({}).sort({ name: 1 }) }); }
	catch (error) { req.flash("error", "Unable to load matching data."); return res.redirect("/"); }
};

module.exports.generate = async (req, res) => {
	try {
		const [student, company, analysis] = await Promise.all([Student.findById(req.body.studentId), Company.findById(req.body.companyId), ResumeAnalysis.findOne({ student: req.body.studentId }).sort({ createdAt: -1 })]);
		if (!student || !company) { req.flash("error", "Select a valid student and company."); return res.redirect("back"); }
		const studentSkills = cleanList((analysis && analysis.technicalSkills) || student.skills || []);
		const requiredSkills = cleanList(company.requiredSkills || []);
		if (!requiredSkills.length) { req.flash("error", "Add required skills to this company's placement criteria before matching."); return res.redirect("back"); }
		const matchedSkills = requiredSkills.filter((skill) => studentSkills.some((studentSkill) => studentSkill.toLowerCase() === skill.toLowerCase()));
		// Exact skill overlap is the auditable baseline; Gemini enriches the learning recommendations.
		const fallbackScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
		const fallback = { matchPercentage: fallbackScore, matchedSkills, missingSkills: requiredSkills.filter((skill) => !matchedSkills.includes(skill)), recommendedLearningPath: requiredSkills.filter((skill) => !matchedSkills.includes(skill)).map((skill) => `Build a small project using ${skill}`), hiringProbability: probability(fallbackScore) };
		const prompt = `Act as a placement career advisor. Compare the candidate skills ${JSON.stringify(studentSkills)} with the ${company.jobRole || company.name} role requirements ${JSON.stringify(requiredSkills)}. Return matchPercentage (0-100), matchedSkills, missingSkills, recommendedLearningPath (short actionable steps), and hiringProbability (Low, Medium, or High).`;
		const generated = await generateJson(prompt, fallback);
		const data = generated.data;
		const numericScore = Math.max(0, Math.min(100, Number.isFinite(Number(data.matchPercentage)) ? Math.round(Number(data.matchPercentage)) : fallbackScore));
		const jobMatch = await JobMatch.create({ student: student._id, company: company._id, resumeAnalysis: analysis && analysis._id, matchPercentage: numericScore, matchedSkills: cleanList(data.matchedSkills), missingSkills: cleanList(data.missingSkills), recommendedLearningPath: cleanList(data.recommendedLearningPath), hiringProbability: ["Low", "Medium", "High"].includes(data.hiringProbability) ? data.hiringProbability : probability(numericScore), analysisSource: generated.source });
		return res.redirect(`/ai/job-match/${jobMatch._id}`);
	} catch (error) { console.error(error); req.flash("error", "Job matching failed. Upload a resume and try again."); return res.redirect("back"); }
};

module.exports.result = async (req, res) => {
	try { const match = await JobMatch.findById(req.params.id).populate("student company"); if (!match) { req.flash("error", "Job match not found."); return res.redirect("/ai/job-match"); } return res.render("job-match-result", { title: "Job Match Result", match }); }
	catch (error) { req.flash("error", "Unable to load job match."); return res.redirect("/ai/job-match"); }
};
