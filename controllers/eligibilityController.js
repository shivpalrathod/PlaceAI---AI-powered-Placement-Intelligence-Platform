const Student = require("../models/student");
const Company = require("../models/company");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const EligibilityResult = require("../models/EligibilityResult");

const skills = (values) => Array.isArray(values) ? values : [];
module.exports.page = async (req, res) => {
	try { return res.render("eligibility-checker", { title: "AI Eligibility Checker", students: await Student.find({}).sort({ name: 1 }), companies: await Company.find({}).sort({ name: 1 }), result: null }); }
	catch (error) { req.flash("error", "Unable to load eligibility data."); return res.redirect("/"); }
};
module.exports.check = async (req, res) => {
	try {
		const [student, company, analysis] = await Promise.all([Student.findById(req.body.studentId), Company.findById(req.body.companyId), ResumeAnalysis.findOne({ student: req.body.studentId }).sort({ createdAt: -1 })]);
		if (!student || !company) { req.flash("error", "Select a valid student and company."); return res.redirect("back"); }
		if (req.body.minimumCgpa !== "") company.minimumCgpa = Number(req.body.minimumCgpa);
		if (req.body.allowedBacklogs !== "") company.allowedBacklogs = Number(req.body.allowedBacklogs);
		if (req.body.requiredSkills) company.requiredSkills = req.body.requiredSkills.split(",").map((skill) => skill.trim()).filter(Boolean);
		if (req.body.studentCgpa !== "") student.cgpa = Number(req.body.studentCgpa);
		if (req.body.studentBacklogs !== "") student.backlogs = Number(req.body.studentBacklogs);
		await company.save();
		await student.save();
		// Eligibility is deliberately deterministic and explainable; AI resume skills are only an input signal.
		const studentSkills = skills((analysis && analysis.technicalSkills) || student.skills).map((skill) => skill.toLowerCase());
		const requirements = skills(company.requiredSkills);
		const missingSkills = requirements.filter((skill) => !studentSkills.includes(skill.toLowerCase()));
		const reasons = [];
		if (student.cgpa === undefined || student.cgpa === null) reasons.push("Student CGPA has not been recorded.");
		else if (student.cgpa < company.minimumCgpa) reasons.push(`CGPA ${student.cgpa} is below the required ${company.minimumCgpa}.`);
		if ((student.backlogs || 0) > company.allowedBacklogs) reasons.push(`${student.backlogs || 0} backlogs exceed the allowed ${company.allowedBacklogs}.`);
		if (missingSkills.length) reasons.push(`Missing required skills: ${missingSkills.join(", ")}.`);
		if (!reasons.length) reasons.push("Meets the configured CGPA, backlog, and skill criteria.");
		const eligible = reasons.length === 1 && reasons[0].startsWith("Meets");
		const readiness = analysis ? analysis.placementReadinessScore : 40;
		const probability = !eligible ? "Low" : readiness >= 75 && !missingSkills.length ? "High" : "Medium";
		const result = await EligibilityResult.create({ student: student._id, company: company._id, eligible, reasons, selectionProbability: probability, criteriaSnapshot: { minimumCgpa: company.minimumCgpa, allowedBacklogs: company.allowedBacklogs, requiredSkills: requirements } });
		return res.render("eligibility-checker", { title: "AI Eligibility Checker", students: await Student.find({}).sort({ name: 1 }), companies: await Company.find({}).sort({ name: 1 }), result: await result.populate("student company") });
	} catch (error) { console.error(error); req.flash("error", "Eligibility check failed. Check the entered criteria."); return res.redirect("back"); }
};
