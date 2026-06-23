const fs = require("fs");
const pdfParse = require("pdf-parse");
const Student = require("../models/student");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const { generateJson } = require("../services/geminiService");

const TECHNICAL_SKILLS = ["JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Express", "MongoDB", "MySQL", "PostgreSQL", "SQL", "Python", "Java", "C++", "C#", "Django", "Flask", "REST API", "Git", "GitHub", "Docker", "AWS", "Kubernetes", "Machine Learning", "Data Structures", "Algorithms"];
const SOFT_SKILLS = ["Communication", "Leadership", "Teamwork", "Problem Solving", "Adaptability", "Collaboration", "Time Management"];
const list = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()).slice(0, 20) : [];
const score = (value, fallback) => Math.max(0, Math.min(100, Number.isFinite(Number(value)) ? Math.round(Number(value)) : fallback));

function localAnalysis(text) {
	// Deterministic baseline keeps resume feedback available when the AI provider is unavailable.
	const lower = text.toLowerCase();
	const technicalSkills = TECHNICAL_SKILLS.filter((skill) => lower.includes(skill.toLowerCase()));
	const softSkills = SOFT_SKILLS.filter((skill) => lower.includes(skill.toLowerCase()));
	const hasProjects = /project|experience|internship/i.test(text);
	const hasEducation = /education|university|college|bachelor/i.test(text);
	const hasContact = /@|linkedin|github|phone/i.test(text);
	const atsScore = Math.min(100, Math.round(technicalSkills.length * 3 + softSkills.length * 2 + (hasProjects ? 20 : 0) + (hasEducation ? 10 : 0) + (hasContact ? 8 : 0)));
	const missingSections = [!hasContact && "Contact details", !hasEducation && "Education", !hasProjects && "Projects or experience"].filter(Boolean);
	return {
		atsScore,
		placementReadinessScore: Math.min(100, Math.round(atsScore * 0.8 + (hasProjects ? 15 : 0))),
		technicalSkills,
		softSkills,
		missingSkills: TECHNICAL_SKILLS.filter((skill) => !technicalSkills.includes(skill)).slice(0, 8),
		strengths: [technicalSkills.length >= 4 && "Demonstrates a practical technical foundation", hasProjects && "Includes project or experience evidence", hasEducation && "Includes academic background"].filter(Boolean),
		weaknesses: [technicalSkills.length < 4 && "Technical skill coverage is limited", !hasProjects && "Project impact is not clearly demonstrated", !hasContact && "Recruiter contact information is incomplete"].filter(Boolean),
		improvementSuggestions: ["Use role-specific keywords in your summary and project bullets", "Quantify project outcomes with metrics", "Keep formatting simple for applicant tracking systems"],
		improvements: { missingSections, weakSections: [!hasProjects && "Projects/experience", technicalSkills.length < 4 && "Technical skills"].filter(Boolean), betterSummary: "Motivated candidate with hands-on project experience, a growth mindset, and a focus on delivering measurable results.", projectSuggestions: ["Describe the problem, your contribution, technology used, and outcome for each project."], skillsSuggestions: ["Group skills by category and place the most role-relevant skills first."], grammarSuggestions: ["Start bullets with action verbs and keep tense consistent."] },
	};
}

module.exports.uploadPage = async (req, res) => {
	try {
		return res.render("upload-resume", { title: "AI Resume Analyzer", students: await Student.find({}).sort({ name: 1 }) });
	} catch (error) { req.flash("error", "Unable to load students for analysis."); return res.redirect("/"); }
};

module.exports.analyze = async (req, res) => {
	try {
		if (!req.file || !req.body.studentId) { req.flash("error", "Choose a student and a PDF resume."); return res.redirect("back"); }
		const student = await Student.findById(req.body.studentId);
		if (!student) { req.flash("error", "Student not found."); return res.redirect("back"); }
		const text = (await pdfParse(await fs.promises.readFile(req.file.path))).text.replace(/\s+/g, " ").trim();
		if (text.length < 40) { req.flash("error", "The PDF does not contain enough readable text to analyze."); return res.redirect("back"); }
		const fallback = localAnalysis(text);
		const prompt = `You are an expert ATS resume reviewer. Analyze this resume and return an object with atsScore, placementReadinessScore, technicalSkills, softSkills, missingSkills, strengths, weaknesses, improvementSuggestions, projects (list of key project titles), certifications (list of certifications), education (list of education degrees/colleges), and improvements {missingSections, weakSections, betterSummary, projectSuggestions, skillsSuggestions, grammarSuggestions}. Scores must be 0-100. Resume:\n${text.slice(0, 30000)}`;
		// Gemini receives extracted text only; its JSON response is normalized before persistence.
		const generated = await generateJson(prompt, fallback);
		const data = generated.data;
		const analysis = await ResumeAnalysis.create({
			student: student._id,
			createdBy: req.user._id,
			resumePath: `/storage/uploads/resume/${req.file.filename}`,
			extractedText: text,
			atsScore: score(data.atsScore, fallback.atsScore),
			placementReadinessScore: score(data.placementReadinessScore, fallback.placementReadinessScore),
			technicalSkills: list(data.technicalSkills),
			softSkills: list(data.softSkills),
			missingSkills: list(data.missingSkills),
			strengths: list(data.strengths),
			weaknesses: list(data.weaknesses),
			improvementSuggestions: list(data.improvementSuggestions),
			projects: list(data.projects || fallback.projects),
			certifications: list(data.certifications || fallback.certifications),
			education: list(data.education || fallback.education),
			improvements: {
				missingSections: list(data.improvements && data.improvements.missingSections),
				weakSections: list(data.improvements && data.improvements.weakSections),
				betterSummary: String(data.improvements && data.improvements.betterSummary || fallback.improvements.betterSummary).slice(0, 1000),
				projectSuggestions: list(data.improvements && data.improvements.projectSuggestions),
				skillsSuggestions: list(data.improvements && data.improvements.skillsSuggestions),
				grammarSuggestions: list(data.improvements && data.improvements.grammarSuggestions)
			},
			analysisSource: generated.source
		});
		student.resumePath = analysis.resumePath;
		student.skills = analysis.technicalSkills;
		student.atsScore = analysis.atsScore;
		student.placementReadinessScore = analysis.placementReadinessScore;
		student.projects = analysis.projects;
		student.certifications = analysis.certifications;
		student.education = analysis.education;
		await student.save();
		return res.redirect(`/ai/resume/${analysis._id}`);
	} catch (error) { console.error(error); req.flash("error", "Resume analysis failed. Please try a text-based PDF."); return res.redirect("back"); }
};

module.exports.result = async (req, res) => {
	try {
		const analysis = await ResumeAnalysis.findById(req.params.id).populate("student");
		if (!analysis) { req.flash("error", "Resume analysis not found."); return res.redirect("/ai/resume"); }
		return res.render("resume-analysis", { title: "Resume Analysis", analysis });
	} catch (error) { req.flash("error", "Unable to load resume analysis."); return res.redirect("/ai/resume"); }
};
