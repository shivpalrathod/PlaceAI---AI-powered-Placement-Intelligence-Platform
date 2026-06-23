/**
 * matchingService.js
 * AI-powered skill matching between student resume and job/internship requirements.
 */

const SKILL_ALIASES = {
	"node.js": ["node", "nodejs"],
	"react.js": ["react", "reactjs"],
	"vue.js": ["vue", "vuejs"],
	"express.js": ["express", "expressjs"],
	"next.js": ["next", "nextjs"],
	javascript: ["js"],
	typescript: ["ts"],
	postgresql: ["postgres"],
	kubernetes: ["k8s"],
	"machine learning": ["ml"],
	"deep learning": ["dl"],
	"natural language processing": ["nlp"],
	"data science": ["ds"],
	"artificial intelligence": ["ai"],
};

function normalizeSkill(skill) {
	return skill.toLowerCase().trim();
}

function expandSkills(skills) {
	const expanded = new Set(skills.map(normalizeSkill));
	for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
		if (expanded.has(canonical)) {
			aliases.forEach((a) => expanded.add(a));
		}
		for (const alias of aliases) {
			if (expanded.has(alias)) {
				expanded.add(canonical);
			}
		}
	}
	return expanded;
}

/**
 * Calculate match percentage between student skills and required skills.
 * @param {string[]} studentSkills
 * @param {string[]} requiredSkills
 * @returns {{ matchPercent: number, matched: string[], missing: string[] }}
 */
function calculateMatch(studentSkills, requiredSkills) {
	if (!requiredSkills || requiredSkills.length === 0) {
		return { matchPercent: 50, matched: [], missing: [] };
	}
	if (!studentSkills || studentSkills.length === 0) {
		return { matchPercent: 0, matched: [], missing: requiredSkills };
	}

	const studentSet = expandSkills(studentSkills);
	const matched = [];
	const missing = [];

	for (const req of requiredSkills) {
		const normalized = normalizeSkill(req);
		// Check direct match or alias match
		if (studentSet.has(normalized)) {
			matched.push(req);
		} else {
			missing.push(req);
		}
	}

	const matchPercent = Math.round((matched.length / requiredSkills.length) * 100);
	return { matchPercent, matched, missing };
}

/**
 * Score and rank a list of jobs against a student's skills.
 * @param {string[]} studentSkills
 * @param {object[]} jobs
 * @param {number} limit
 * @returns {object[]} sorted jobs with matchPercent, matched, missing
 */
function rankJobs(studentSkills, jobs, limit = 10) {
	return jobs
		.map((job) => {
			const { matchPercent, matched, missing } = calculateMatch(
				studentSkills,
				job.skills || []
			);
			return {
				...job.toObject ? job.toObject() : job,
				matchPercent,
				matched,
				missing,
			};
		})
		.sort((a, b) => b.matchPercent - a.matchPercent)
		.slice(0, limit);
}

/**
 * Score and rank internships against student skills.
 */
function rankInternships(studentSkills, internships, limit = 10) {
	return internships
		.map((intern) => {
			const { matchPercent, matched, missing } = calculateMatch(
				studentSkills,
				intern.skills || []
			);
			return {
				...intern.toObject ? intern.toObject() : intern,
				matchPercent,
				matched,
				missing,
			};
		})
		.sort((a, b) => b.matchPercent - a.matchPercent)
		.slice(0, limit);
}

module.exports = { calculateMatch, rankJobs, rankInternships };
