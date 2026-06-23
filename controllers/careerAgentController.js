const ResumeAnalysis = require("../models/ResumeAnalysis");
const Student = require("../models/student");
const Job = require("../models/Job");
const Internship = require("../models/Internship");
const { generateText } = require("../services/geminiService");
const { rankJobs, rankInternships } = require("../services/matchingService");

// Intelligent local fallback responses for common career questions
function localCareerResponse(message, resumeData) {
	const msg = message.toLowerCase();
	const skills = resumeData?.technicalSkills || [];
	const atsScore = resumeData?.atsScore || 0;
	const missing = resumeData?.missingSkills || [];

	if (msg.includes("ats") || msg.includes("score") || msg.includes("improve resume")) {
		if (atsScore === 0) {
			return "Upload your resume first in the AI Resume Analyzer to get your ATS score and personalized improvement tips! 📄";
		}
		const tips = resumeData?.improvementSuggestions || [];
		return `Your current ATS score is **${atsScore}/100**. ${atsScore >= 80 ? "🎉 Excellent!" : atsScore >= 60 ? "Good progress!" : "Room to improve!"}\n\n**Top suggestions:**\n${tips.slice(0, 3).map((t) => `• ${t}`).join("\n") || "• Add more technical skills\n• Include quantifiable achievements\n• Add project descriptions"}`;
	}

	if (msg.includes("skill") || msg.includes("learn") || msg.includes("what should")) {
		if (missing.length === 0) {
			return "Upload your resume first to get a personalized skill gap analysis! Then I can tell you exactly what to learn next. 🚀";
		}
		return `Based on your resume, focus on learning these in-demand skills:\n\n${missing.slice(0, 5).map((s) => `• **${s}**`).join("\n")}\n\nThese are highly sought after by top tech companies and will boost your ATS score significantly.`;
	}

	if (msg.includes("job") || msg.includes("match") || msg.includes("eligible")) {
		if (skills.length === 0) {
			return "Upload your resume to get personalized job recommendations! I'll match you with jobs based on your skills. 💼";
		}
		return `With your skills in **${skills.slice(0, 4).join(", ")}**, you're eligible for:\n\n• Software Engineer (TCS, Infosys, Wipro)\n• Full Stack Developer (Startups, MNCs)\n• Backend Developer (Various companies)\n\nVisit the **Jobs** page to see all matches with percentage scores! 🎯`;
	}

	if (msg.includes("internship")) {
		return `Looking for internships? Based on your profile, check out:\n\n• Python/Django Developer Intern\n• Full Stack Developer Intern\n• Software Engineer Intern\n\nVisit the **Internships** page for detailed matches with stipend info! 🏢`;
	}

	if (msg.includes("company") || msg.includes("companies")) {
		return `**Top companies hiring freshers in 2024:**\n\n🏆 **Premium (15+ LPA):** Google, Amazon, Microsoft, Adobe\n💼 **Mid-tier (5-15 LPA):** IBM, Deloitte, Salesforce, Oracle\n📊 **Entry-level (3-5 LPA):** TCS, Infosys, Wipro, Accenture\n\nCheck the **Companies** page for interview processes, required skills, and eligibility criteria!`;
	}

	if (msg.includes("interview") || msg.includes("prepare")) {
		return `**Interview Preparation Guide:**\n\n1. **DSA** — Practice LeetCode (Easy & Medium)\n2. **System Design** — Study basic concepts\n3. **Projects** — Be ready to explain every project\n4. **HR Round** — Prepare STAR method answers\n5. **Communication** — Mock interviews\n\n💡 Use the **AI Interview Generator** in the AI Studio for company-specific questions!`;
	}

	if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
		return `👋 Hello! I'm your **AI Career Agent**.\n\nI can help you with:\n• 📊 Resume & ATS score improvement\n• 💼 Job recommendations\n• 🏢 Internship matching\n• 📚 Skill gap analysis\n• 🎯 Company research\n• 🎤 Interview preparation\n\nWhat would you like to explore today?`;
	}

	return `Great question! Here's what I recommend:\n\n**For career success in tech:**\n• Build a strong portfolio with 2-3 real projects\n• Contribute to open source on GitHub\n• Get relevant certifications (AWS, Google Cloud, etc.)\n• Network on LinkedIn with professionals\n• Practice DSA on LeetCode/HackerRank\n\n💡 Use the AI tools in the platform (Resume Analyzer, Skill Gap, Job Match) for personalized guidance!`;
}

module.exports.agentPage = async (req, res) => {
	try {
		let latestAnalysis = null;
		let studentName = "Student";
		let atsScore = 0;
		let skills = [];

		if (req.user && req.user.skills && req.user.skills.length > 0) {
			skills = req.user.skills || [];
			studentName = req.user.name || "Student";
			atsScore = req.user.atsScore || 0;
			latestAnalysis = await ResumeAnalysis.findOne({ employee: req.user._id }).sort({ createdAt: -1 });
		}

		if (skills.length === 0) {
			latestAnalysis = await ResumeAnalysis.findOne({})
				.sort({ createdAt: -1 })
				.populate("student");

			if (latestAnalysis) {
				skills = latestAnalysis.technicalSkills || [];
				studentName = latestAnalysis.student?.name || "Student";
				atsScore = latestAnalysis.atsScore || 0;
			}
		}

		return res.render("career-agent", {
			title: "AI Career Agent",
			hasResume: !!latestAnalysis,
			studentName: studentName,
			atsScore: atsScore,
			skills: skills,
		});
	} catch (error) {
		console.error(error);
		req.flash("error", "Unable to load Career Agent.");
		return res.redirect("/");
	}
};

module.exports.chat = async (req, res) => {
	try {
		const { message, studentId } = req.body;
		if (!message || message.trim().length === 0) {
			return res.json({ success: false, error: "Empty message." });
		}

		// Fetch resume data for context
		let resumeData = null;
		if (req.user) {
			resumeData = await ResumeAnalysis.findOne({ employee: req.user._id }).sort({ createdAt: -1 });
		}
		if (!resumeData && studentId) {
			resumeData = await ResumeAnalysis.findOne({ student: studentId }).sort({ createdAt: -1 });
		}
		if (!resumeData) {
			resumeData = await ResumeAnalysis.findOne({}).sort({ createdAt: -1 });
		}

		// Fetch jobs and internships to calculate matches for context
		let jobMatchesContext = "";
		let internshipMatchesContext = "";
		try {
			const studentSkills = resumeData?.technicalSkills || [];
			if (studentSkills.length > 0) {
				const activeJobs = await Job.find({ isActive: true });
				const rankedJobs = rankJobs(studentSkills, activeJobs, 3);
				jobMatchesContext = rankedJobs.map(j => `- ${j.title} at ${j.company} (${j.matchPercent}% match)`).join("\n");

				const activeInternships = await Internship.find({ isActive: true });
				const rankedInternships = rankInternships(studentSkills, activeInternships, 3);
				internshipMatchesContext = rankedInternships.map(i => `- ${i.title} at ${i.company} (${i.matchPercent}% match)`).join("\n");
			}
		} catch (err) {
			console.error("Error generating matching context for agent:", err);
		}

		// Build contextual prompt for Gemini
		const context = resumeData
			? `Student Resume Context:
- ATS Score: ${resumeData.atsScore}/100
- Placement Readiness Score: ${resumeData.placementReadinessScore || 0}/100
- Technical Skills: ${(resumeData.technicalSkills || []).join(", ")}
- Soft Skills: ${(resumeData.softSkills || []).join(", ")}
- Missing Skills: ${(resumeData.missingSkills || []).join(", ")}
- Strengths: ${(resumeData.strengths || []).join(", ")}
- Improvement Suggestions: ${(resumeData.improvementSuggestions || []).join("; ")}
- Key Projects: ${(resumeData.projects || []).join(", ")}
- Certifications: ${(resumeData.certifications || []).join(", ")}
- Education: ${(resumeData.education || []).join(", ")}

Top Matching Jobs:
${jobMatchesContext || "No matching jobs found."}

Top Matching Internships:
${internshipMatchesContext || "No matching internships found."}
`
			: "No resume data available yet.";

		const prompt = `You are an expert AI Career Counselor for a placement cell platform helping engineering students find jobs and internships in India. You are friendly, specific, and actionable. Always answer using the actual matching jobs, matching internships, and skills from the context below if the user asks about matches, resume suggestions, or skills.

${context}

Student Question: ${message}

Provide a helpful, concise response (max 200 words). Use bullet points where appropriate. Be encouraging but realistic. Focus on practical advice.`;

		const fallback = localCareerResponse(message, resumeData);
		const result = await generateText(prompt, fallback);

		return res.json({
			success: true,
			response: result.text,
			source: result.source,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ success: false, error: "Chat service unavailable." });
	}
};
