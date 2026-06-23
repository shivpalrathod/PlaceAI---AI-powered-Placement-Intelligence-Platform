const InterviewQuestion = require("../models/InterviewQuestion");
const { generateJson } = require("../services/geminiService");

function fallbackQuestions(role) {
	// A structured local set prevents interview preparation from depending on a remote model call.
	return {
		technicalQuestions: [{ question: `Explain a core concept you would use as a ${role}.`, difficulty: "Easy" }, { question: `How would you debug a production issue in a ${role} application?`, difficulty: "Medium" }, { question: `Design a scalable solution for a key ${role} workflow.`, difficulty: "Hard" }],
		hrQuestions: [{ question: "Tell me about a time you learned something difficult.", difficulty: "Easy" }, { question: "How do you handle feedback under pressure?", difficulty: "Medium" }],
		scenarioQuestions: [{ question: "A teammate disagrees with your approach. How do you move forward?", difficulty: "Medium" }],
		codingQuestions: [{ question: `Write a small, testable function relevant to a ${role} workflow and explain its complexity.`, difficulty: "Easy" }, { question: "Optimize a solution after identifying its performance bottleneck.", difficulty: "Hard" }],
	};
}
function normalize(value) { return Array.isArray(value) ? value.filter((item) => item && typeof item.question === "string").map((item) => ({ question: item.question.trim().slice(0, 500), difficulty: ["Easy", "Medium", "Hard"].includes(item.difficulty) ? item.difficulty : "Medium" })).slice(0, 10) : []; }

module.exports.page = (req, res) => res.render("interview-generator", { title: "AI Interview Preparation" });
module.exports.generate = async (req, res) => {
	try {
		const { jobRole, experienceLevel, companyType } = req.body;
		if (!jobRole || !experienceLevel || !companyType) { req.flash("error", "Complete all interview preparation fields."); return res.redirect("back"); }
		const fallback = fallbackQuestions(jobRole);
		const prompt = `Create interview preparation questions for a ${experienceLevel} ${jobRole} candidate interviewing at a ${companyType}. Return technicalQuestions, hrQuestions, scenarioQuestions, codingQuestions. Every item must be {question, difficulty}, difficulty is Easy, Medium, or Hard. Make questions specific and practical.`;
		// Request category-specific JSON so the view can render questions predictably.
		const generated = await generateJson(prompt, fallback);
		const data = generated.data;
		const questions = await InterviewQuestion.create({ createdBy: req.user._id, jobRole: jobRole.trim(), experienceLevel, companyType: companyType.trim(), technicalQuestions: normalize(data.technicalQuestions), hrQuestions: normalize(data.hrQuestions), scenarioQuestions: normalize(data.scenarioQuestions), codingQuestions: normalize(data.codingQuestions), analysisSource: generated.source });
		return res.redirect(`/ai/interview/${questions._id}`);
	} catch (error) { console.error(error); req.flash("error", "Question generation failed. Please try again."); return res.redirect("back"); }
};
module.exports.result = async (req, res) => {
	try { const questions = await InterviewQuestion.findById(req.params.id); if (!questions) { req.flash("error", "Question set not found."); return res.redirect("/ai/interview"); } return res.render("interview-questions", { title: "Interview Questions", questions }); }
	catch (error) { req.flash("error", "Unable to load interview questions."); return res.redirect("/ai/interview"); }
};
