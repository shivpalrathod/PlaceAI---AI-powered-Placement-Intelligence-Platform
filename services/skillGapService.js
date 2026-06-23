/**
 * skillGapService.js
 * Compares student skills against industry standards and generates a learning roadmap.
 */

const INDUSTRY_SKILLS = {
	"Software Developer": {
		core: ["JavaScript", "Python", "Java", "Data Structures", "Algorithms", "Git"],
		web: ["React", "Node.js", "Express", "MongoDB", "SQL", "REST API"],
		tools: ["Docker", "AWS", "GitHub", "Linux"],
		nice: ["TypeScript", "GraphQL", "Redis", "Kubernetes"],
	},
	"Data Scientist": {
		core: ["Python", "SQL", "Statistics", "Machine Learning", "Data Analysis"],
		frameworks: ["Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch"],
		tools: ["Jupyter", "Git", "Tableau", "Power BI"],
		nice: ["Deep Learning", "NLP", "AWS", "Spark"],
	},
	"Frontend Developer": {
		core: ["HTML", "CSS", "JavaScript", "React", "Responsive Design"],
		tools: ["Git", "Webpack", "Figma", "TypeScript"],
		frameworks: ["Next.js", "Vue.js", "Tailwind CSS"],
		nice: ["Testing", "Performance Optimization", "SEO"],
	},
	"Backend Developer": {
		core: ["Node.js", "Python", "Java", "SQL", "REST API", "Git"],
		frameworks: ["Express", "Django", "Spring Boot"],
		databases: ["MongoDB", "PostgreSQL", "Redis"],
		tools: ["Docker", "AWS", "Linux"],
		nice: ["Microservices", "Kafka", "Kubernetes"],
	},
	"DevOps Engineer": {
		core: ["Linux", "Git", "Docker", "CI/CD", "Shell Scripting"],
		cloud: ["AWS", "Azure", "GCP"],
		tools: ["Kubernetes", "Terraform", "Ansible", "Jenkins"],
		nice: ["Prometheus", "Grafana", "Helm"],
	},
	"Full Stack Developer": {
		core: ["JavaScript", "HTML", "CSS", "SQL", "Git"],
		frontend: ["React", "TypeScript"],
		backend: ["Node.js", "Express", "MongoDB"],
		tools: ["Docker", "AWS"],
		nice: ["GraphQL", "Redis", "Testing"],
	},
};

const LEARNING_RESOURCES = {
	JavaScript: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
	Python: "https://docs.python.org/3/tutorial/",
	React: "https://react.dev/learn",
	"Node.js": "https://nodejs.org/en/learn",
	Docker: "https://docs.docker.com/get-started/",
	AWS: "https://aws.amazon.com/training/",
	MongoDB: "https://learn.mongodb.com/",
	SQL: "https://www.w3schools.com/sql/",
	Git: "https://git-scm.com/book/en/v2",
	TypeScript: "https://www.typescriptlang.org/docs/handbook/",
	"Machine Learning": "https://www.coursera.org/learn/machine-learning",
	Kubernetes: "https://kubernetes.io/docs/tutorials/",
};

function analyzeSkillGap(studentSkills, targetRole = "Software Developer") {
	const roleSkills = INDUSTRY_SKILLS[targetRole] || INDUSTRY_SKILLS["Software Developer"];
	const allRequired = Object.values(roleSkills).flat();
	const uniqueRequired = [...new Set(allRequired)];

	const studentNorm = new Set(studentSkills.map((s) => s.toLowerCase()));
	const possessed = [];
	const missing = [];

	for (const skill of uniqueRequired) {
		if (studentNorm.has(skill.toLowerCase())) {
			possessed.push(skill);
		} else {
			missing.push(skill);
		}
	}

	const matchPercent = Math.round((possessed.length / uniqueRequired.length) * 100);

	// Prioritize missing core skills
	const coreSkills = roleSkills.core || [];
	const missingCore = coreSkills.filter((s) => !studentNorm.has(s.toLowerCase()));
	const missingOther = missing.filter((s) => !missingCore.includes(s));

	// Generate roadmap
	const roadmap = generateRoadmap(missingCore, missingOther, targetRole);

	// Learning resources for missing skills
	const resources = missing
		.filter((s) => LEARNING_RESOURCES[s])
		.map((s) => ({ skill: s, url: LEARNING_RESOURCES[s] }));

	return {
		targetRole,
		possessed,
		missing,
		missingCore,
		missingAdvanced: missingOther,
		matchPercent,
		readinessLevel:
			matchPercent >= 80
				? "Job Ready"
				: matchPercent >= 60
				? "Nearly Ready"
				: matchPercent >= 40
				? "In Progress"
				: "Beginner",
		roadmap,
		resources,
		allRoles: Object.keys(INDUSTRY_SKILLS),
	};
}

function generateRoadmap(missingCore, missingOther, role) {
	const steps = [];
	if (missingCore.length > 0) {
		steps.push({
			phase: "Phase 1 — Core Foundation (4-6 weeks)",
			priority: "High",
			skills: missingCore.slice(0, 5),
			description: `Master the essential skills for ${role} that most employers require.`,
		});
	}
	if (missingOther.length > 0) {
		steps.push({
			phase: "Phase 2 — Practical Tools (6-8 weeks)",
			priority: "Medium",
			skills: missingOther.slice(0, 6),
			description: "Learn industry-standard tools and frameworks to build real projects.",
		});
	}
	steps.push({
		phase: "Phase 3 — Build Portfolio (2-4 weeks)",
		priority: "Low",
		skills: [],
		description:
			"Create 2-3 projects showcasing your skills. Deploy on GitHub and cloud platforms.",
	});
	return steps;
}

module.exports = { analyzeSkillGap, INDUSTRY_SKILLS };
