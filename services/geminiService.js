const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";

function cleanJson(text) {
	const withoutFence = String(text || "").replace(/```json|```/gi, "").trim();
	const first = withoutFence.indexOf("{");
	const last = withoutFence.lastIndexOf("}");
	if (first === -1 || last === -1) throw new Error("Gemini did not return a JSON object.");
	return JSON.parse(withoutFence.slice(first, last + 1));
}

async function generateJson(instruction, fallback) {
	if (!process.env.GEMINI_API_KEY) return { data: fallback, source: "local" };
	try {
		const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
		const model = client.getGenerativeModel({ model: MODEL_NAME });
		const result = await model.generateContent(`${instruction}\nReturn only valid JSON. Do not use markdown fences.`);
		return { data: { ...fallback, ...cleanJson(result.response.text()) }, source: "gemini" };
	} catch (error) {
		// AI is an enhancement, not a single point of failure for placement operations.
		console.error("Gemini generation failed:", error.message);
		return { data: fallback, source: "local" };
	}
}

/**
 * Generate plain text response (for Career Agent chat).
 * @param {string} prompt
 * @param {string} fallback
 * @returns {Promise<{text: string, source: string}>}
 */
async function generateText(prompt, fallback = "") {
	if (!process.env.GEMINI_API_KEY) return { text: fallback, source: "local" };
	try {
		const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
		const model = client.getGenerativeModel({ model: MODEL_NAME });
		const result = await model.generateContent(prompt);
		return { text: result.response.text().trim(), source: "gemini" };
	} catch (error) {
		console.error("Gemini text generation failed:", error.message);
		return { text: fallback, source: "local" };
	}
}

/**
 * Generate a career insight summary for the profile page.
 * @param {object} resumeData - ResumeAnalysis document
 * @returns {Promise<string>}
 */
async function generateCareerInsight(resumeData) {
	const prompt = `You are a career counselor. Based on this student's resume analysis, write a 2-3 sentence personalized career insight:
ATS Score: ${resumeData.atsScore}/100
Technical Skills: ${(resumeData.technicalSkills || []).join(", ")}
Strengths: ${(resumeData.strengths || []).join(", ")}
Missing Skills: ${(resumeData.missingSkills || []).join(", ")}
Write a motivating and specific insight (max 150 words).`;

	const fallback = `Based on your resume analysis, you have a strong foundation with ${(resumeData.technicalSkills || []).slice(0, 3).join(", ")}. Focus on adding ${(resumeData.missingSkills || []).slice(0, 2).join(" and ")} to significantly boost your placement readiness.`;
	const result = await generateText(prompt, fallback);
	return result.text;
}

module.exports = { generateJson, generateText, generateCareerInsight };

