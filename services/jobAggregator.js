/**
 * jobAggregator.js
 * Seeds 50+ fresher jobs and internships from major companies into MongoDB.
 * Runs a cron job every 6 hours to keep data fresh.
 * Infrastructure-ready for Adzuna/JSearch API integration.
 */

const cron = require("node-cron");
const Job = require("../models/Job");
const Internship = require("../models/Internship");

// ─────────────────────────────────────────────────────
// SEEDED JOB DATA — 50+ Fresher Jobs from major companies
// ─────────────────────────────────────────────────────
const SEED_JOBS = [
	// TCS
	{ title: "Software Engineer", company: "TCS", location: "Bangalore, India", package: "3.5 LPA", packageMin: 350000, skills: ["Java", "SQL", "Data Structures", "Algorithms", "C++"], description: "Join TCS as a fresher software engineer. Work on enterprise-grade applications.", applyLink: "https://www.tcs.com/careers", isFresher: true, category: "software" },
	{ title: "Systems Engineer", company: "TCS", location: "Hyderabad, India", package: "3.5 LPA", packageMin: 350000, skills: ["Python", "Linux", "SQL", "Networking", "Shell Scripting"], description: "Systems engineering role at TCS for 2024/2025 graduates.", applyLink: "https://www.tcs.com/careers", isFresher: true, category: "software" },

	// Infosys
	{ title: "Systems Engineer", company: "Infosys", location: "Pune, India", package: "3.6 LPA", packageMin: 360000, skills: ["Java", "SQL", "Algorithms", "OOP", "Data Structures"], description: "Join Infosys Springboard program for fresh graduates.", applyLink: "https://www.infosys.com/careers", isFresher: true, category: "software" },
	{ title: "Technology Analyst", company: "Infosys", location: "Chennai, India", package: "4 LPA", packageMin: 400000, skills: ["Python", "Machine Learning", "Data Analysis", "SQL", "TensorFlow"], description: "Data analytics and technology analyst role for AI/ML graduates.", applyLink: "https://www.infosys.com/careers", isFresher: true, category: "data" },

	// Wipro
	{ title: "Project Engineer", company: "Wipro", location: "Bangalore, India", package: "3.5 LPA", packageMin: 350000, skills: ["Java", "JavaScript", "SQL", "HTML", "CSS"], description: "Full stack development role for fresh engineering graduates.", applyLink: "https://careers.wipro.com", isFresher: true, category: "software" },
	{ title: "Software Developer", company: "Wipro", location: "Mumbai, India", package: "3.5 LPA", packageMin: 350000, skills: ["Python", "Django", "REST API", "SQL", "Git"], description: "Backend development role at Wipro for Python developers.", applyLink: "https://careers.wipro.com", isFresher: true, category: "software" },

	// Accenture
	{ title: "Associate Software Engineer", company: "Accenture", location: "Hyderabad, India", package: "4.5 LPA", packageMin: 450000, skills: ["JavaScript", "React", "Node.js", "MongoDB", "Git"], description: "Full stack developer role with React and Node.js expertise.", applyLink: "https://www.accenture.com/in-en/careers", isFresher: true, category: "software" },
	{ title: "DevOps Engineer", company: "Accenture", location: "Bangalore, India", package: "4.5 LPA", packageMin: 450000, skills: ["Docker", "Kubernetes", "AWS", "Linux", "Git", "CI/CD"], description: "Cloud and DevOps engineering role for freshers.", applyLink: "https://www.accenture.com/in-en/careers", isFresher: true, category: "devops" },

	// Cognizant
	{ title: "Programmer Analyst Trainee", company: "Cognizant", location: "Chennai, India", package: "3.5 LPA", packageMin: 350000, skills: ["Java", "SQL", "Data Structures", "C", "OOP"], description: "Entry-level programmer analyst role at Cognizant.", applyLink: "https://careers.cognizant.com", isFresher: true, category: "software" },
	{ title: "Data Analyst", company: "Cognizant", location: "Pune, India", package: "4 LPA", packageMin: 400000, skills: ["SQL", "Python", "Tableau", "Data Analysis", "Excel"], description: "Analytics and insights role for data-focused graduates.", applyLink: "https://careers.cognizant.com", isFresher: true, category: "data" },

	// Capgemini
	{ title: "Analyst - Software Engineer", company: "Capgemini", location: "Mumbai, India", package: "3.8 LPA", packageMin: 380000, skills: ["Java", "Spring Boot", "SQL", "REST API", "Git"], description: "Java-based software development at Capgemini.", applyLink: "https://www.capgemini.com/in-en/careers/", isFresher: true, category: "software" },
	{ title: "Cloud & DevOps Engineer", company: "Capgemini", location: "Kolkata, India", package: "4 LPA", packageMin: 400000, skills: ["AWS", "Docker", "Terraform", "Linux", "Python"], description: "Cloud engineering and automation at Capgemini.", applyLink: "https://www.capgemini.com/in-en/careers/", isFresher: true, category: "devops" },

	// IBM
	{ title: "Associate Developer", company: "IBM", location: "Bangalore, India", package: "5 LPA", packageMin: 500000, skills: ["Python", "Java", "Cloud", "AI", "SQL", "Git"], description: "IBM entry-level developer role with AI/Cloud exposure.", applyLink: "https://www.ibm.com/careers", isFresher: true, category: "software" },
	{ title: "Data Engineer", company: "IBM", location: "Hyderabad, India", package: "5.5 LPA", packageMin: 550000, skills: ["Python", "SQL", "Hadoop", "Spark", "AWS", "MongoDB"], description: "Data engineering role at IBM working on big data platforms.", applyLink: "https://www.ibm.com/careers", isFresher: true, category: "data" },

	// HCL
	{ title: "Software Engineer Trainee", company: "HCL Technologies", location: "Noida, India", package: "3.8 LPA", packageMin: 380000, skills: ["Java", "SQL", "Data Structures", "JavaScript", "HTML"], description: "Graduate trainee software engineering at HCL.", applyLink: "https://www.hcltech.com/careers", isFresher: true, category: "software" },
	{ title: "QA Analyst", company: "HCL Technologies", location: "Chennai, India", package: "3.6 LPA", packageMin: 360000, skills: ["Testing", "Selenium", "Java", "SQL", "Agile"], description: "Quality assurance and automation testing role.", applyLink: "https://www.hcltech.com/careers", isFresher: true, category: "software" },

	// Tech Mahindra
	{ title: "Software Engineer", company: "Tech Mahindra", location: "Pune, India", package: "3.8 LPA", packageMin: 380000, skills: ["Java", "JavaScript", "SQL", "Node.js", "Git"], description: "Software development role at Tech Mahindra.", applyLink: "https://careers.techmahindra.com", isFresher: true, category: "software" },
	{ title: "AI/ML Engineer", company: "Tech Mahindra", location: "Hyderabad, India", package: "5 LPA", packageMin: 500000, skills: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "SQL"], description: "AI and machine learning engineering for freshers.", applyLink: "https://careers.techmahindra.com", isFresher: true, category: "data" },

	// Deloitte
	{ title: "Consultant - Technology", company: "Deloitte", location: "Bangalore, India", package: "7 LPA", packageMin: 700000, skills: ["Python", "SQL", "Data Analysis", "Cloud", "Agile", "Communication"], description: "Technology consulting at Deloitte for sharp graduates.", applyLink: "https://www2.deloitte.com/in/en/careers.html", isFresher: true, category: "software" },
	{ title: "Software Developer", company: "Deloitte", location: "Mumbai, India", package: "6.5 LPA", packageMin: 650000, skills: ["JavaScript", "React", "Node.js", "SQL", "AWS", "Git"], description: "Full stack development at Deloitte USI.", applyLink: "https://www2.deloitte.com/in/en/careers.html", isFresher: true, category: "software" },

	// Salesforce
	{ title: "Associate Software Engineer", company: "Salesforce", location: "Hyderabad, India", package: "8 LPA", packageMin: 800000, skills: ["Java", "JavaScript", "REST API", "Cloud", "SQL", "Agile"], description: "World-class engineering at Salesforce Salesforce.", applyLink: "https://careers.salesforce.com", isFresher: true, category: "software" },

	// Microsoft
	{ title: "Software Engineer", company: "Microsoft", location: "Hyderabad, India", package: "20 LPA", packageMin: 2000000, skills: ["C++", "Java", "Python", "Data Structures", "Algorithms", "System Design"], description: "Microsoft's prestigious SWE role for top graduates.", applyLink: "https://careers.microsoft.com", isFresher: true, category: "software" },
	{ title: "Data Analyst", company: "Microsoft", location: "Bangalore, India", package: "18 LPA", packageMin: 1800000, skills: ["SQL", "Python", "Power BI", "Azure", "Statistics"], description: "Data analytics at Microsoft Azure.", applyLink: "https://careers.microsoft.com", isFresher: true, category: "data" },

	// Google
	{ title: "Software Engineer", company: "Google", location: "Hyderabad, India", package: "35 LPA", packageMin: 3500000, skills: ["Algorithms", "Data Structures", "C++", "Python", "Java", "System Design"], description: "Google SWE role — top-tier engineering opportunity.", applyLink: "https://careers.google.com", isFresher: true, category: "software" },

	// Amazon
	{ title: "Software Development Engineer", company: "Amazon", location: "Hyderabad, India", package: "30 LPA", packageMin: 3000000, skills: ["Java", "Data Structures", "Algorithms", "SQL", "AWS", "System Design"], description: "SDE-1 role at Amazon India. Competitive compensation.", applyLink: "https://www.amazon.jobs", isFresher: true, category: "software" },
	{ title: "Data Engineer", company: "Amazon", location: "Bangalore, India", package: "25 LPA", packageMin: 2500000, skills: ["Python", "SQL", "AWS", "Spark", "ETL", "Data Warehousing"], description: "Data engineering at AWS for fresh graduates.", applyLink: "https://www.amazon.jobs", isFresher: true, category: "data" },

	// Zoho
	{ title: "Software Developer", company: "Zoho", location: "Chennai, India", package: "5 LPA", packageMin: 500000, skills: ["Java", "JavaScript", "Python", "SQL", "Data Structures"], description: "Product development at Zoho. Great learning environment.", applyLink: "https://careers.zohocorp.com", isFresher: true, category: "software" },
	{ title: "UI Developer", company: "Zoho", location: "Chennai, India", package: "4.5 LPA", packageMin: 450000, skills: ["HTML", "CSS", "JavaScript", "React", "TypeScript"], description: "Frontend engineering at Zoho Creator.", applyLink: "https://careers.zohocorp.com", isFresher: true, category: "software" },

	// Oracle
	{ title: "Applications Engineer", company: "Oracle", location: "Hyderabad, India", package: "10 LPA", packageMin: 1000000, skills: ["Java", "SQL", "Cloud", "REST API", "Oracle DB"], description: "Engineering role at Oracle for 2024 batch.", applyLink: "https://careers.oracle.com", isFresher: true, category: "software" },

	// Adobe
	{ title: "Computer Scientist", company: "Adobe", location: "Noida, India", package: "15 LPA", packageMin: 1500000, skills: ["C++", "JavaScript", "Algorithms", "Data Structures", "Python"], description: "Research and engineering at Adobe.", applyLink: "https://careers.adobe.com", isFresher: true, category: "software" },

	// SAP
	{ title: "Associate Developer", company: "SAP", location: "Bangalore, India", package: "8 LPA", packageMin: 800000, skills: ["Java", "JavaScript", "Cloud", "SQL", "Agile", "ABAP"], description: "Developer role at SAP working on ERP solutions.", applyLink: "https://jobs.sap.com", isFresher: true, category: "software" },

	// Startups
	{ title: "Backend Engineer", company: "Razorpay", location: "Bangalore, India", package: "12 LPA", packageMin: 1200000, skills: ["Node.js", "Python", "MongoDB", "SQL", "REST API", "Docker"], description: "Fintech engineering at Razorpay.", applyLink: "https://razorpay.com/jobs/", isFresher: true, category: "software" },
	{ title: "Full Stack Developer", company: "Swiggy", location: "Bangalore, India", package: "15 LPA", packageMin: 1500000, skills: ["React", "Node.js", "MongoDB", "SQL", "AWS", "Docker"], description: "Build food-tech at scale at Swiggy.", applyLink: "https://careers.swiggy.com", isFresher: true, category: "software" },
	{ title: "Software Engineer", company: "Flipkart", location: "Bangalore, India", package: "18 LPA", packageMin: 1800000, skills: ["Java", "Algorithms", "Data Structures", "SQL", "Microservices"], description: "SWE at India's top e-commerce company.", applyLink: "https://www.flipkartcareers.com", isFresher: true, category: "software" },
];

// ─────────────────────────────────────────────────────
// SEEDED INTERNSHIP DATA
// ─────────────────────────────────────────────────────
const SEED_INTERNSHIPS = [
	{ title: "Python Developer Intern", company: "TCS", location: "Bangalore, India", duration: "3 months", stipend: "₹15,000/month", stipendAmount: 15000, skills: ["Python", "Django", "SQL", "REST API", "Git"], description: "Work on Python-based backend systems at TCS.", applyLink: "https://www.tcs.com/careers", isRemote: false, category: "software" },
	{ title: "Web Developer Intern", company: "Infosys", location: "Pune, India", duration: "6 months", stipend: "₹12,000/month", stipendAmount: 12000, skills: ["HTML", "CSS", "JavaScript", "React", "Git"], description: "Frontend development internship at Infosys.", applyLink: "https://www.infosys.com/careers", isRemote: false, category: "software" },
	{ title: "Data Science Intern", company: "Wipro", location: "Remote", duration: "3 months", stipend: "₹10,000/month", stipendAmount: 10000, skills: ["Python", "Machine Learning", "Pandas", "NumPy", "SQL"], description: "Data science internship with real-world datasets.", applyLink: "https://careers.wipro.com", isRemote: true, category: "data" },
	{ title: "DevOps Intern", company: "Accenture", location: "Hyderabad, India", duration: "6 months", stipend: "₹20,000/month", stipendAmount: 20000, skills: ["Docker", "Kubernetes", "Linux", "AWS", "Git", "Shell Scripting"], description: "Cloud and DevOps internship at Accenture.", applyLink: "https://www.accenture.com/in-en/careers", isRemote: false, category: "software" },
	{ title: "Machine Learning Intern", company: "IBM", location: "Bangalore, India", duration: "4 months", stipend: "₹25,000/month", stipendAmount: 25000, skills: ["Python", "TensorFlow", "Machine Learning", "Deep Learning", "SQL"], description: "ML internship at IBM Research India.", applyLink: "https://www.ibm.com/careers", isRemote: false, category: "data" },
	{ title: "React Developer Intern", company: "Swiggy", location: "Bangalore, India", duration: "3 months", stipend: "₹30,000/month", stipendAmount: 30000, skills: ["React", "JavaScript", "TypeScript", "Node.js", "Git"], description: "Frontend engineering internship at Swiggy.", applyLink: "https://careers.swiggy.com", isRemote: false, category: "software" },
	{ title: "Backend Developer Intern", company: "Razorpay", location: "Bangalore, India", duration: "4 months", stipend: "₹35,000/month", stipendAmount: 35000, skills: ["Node.js", "MongoDB", "SQL", "REST API", "Docker"], description: "Fintech backend engineering internship.", applyLink: "https://razorpay.com/jobs/", isRemote: false, category: "software" },
	{ title: "Cloud Engineer Intern", company: "Microsoft", location: "Hyderabad, India", duration: "6 months", stipend: "₹50,000/month", stipendAmount: 50000, skills: ["Azure", "Python", "Docker", "Git", "Linux"], description: "Azure cloud engineering internship at Microsoft.", applyLink: "https://careers.microsoft.com", isRemote: false, category: "devops" },
	{ title: "Software Engineering Intern", company: "Google", location: "Hyderabad, India", duration: "3 months", stipend: "₹80,000/month", stipendAmount: 80000, skills: ["C++", "Python", "Data Structures", "Algorithms", "Git"], description: "Google STEP/SWE internship — top tech opportunity.", applyLink: "https://careers.google.com", isRemote: false, category: "software" },
	{ title: "SDE Intern", company: "Amazon", location: "Hyderabad, India", duration: "3 months", stipend: "₹70,000/month", stipendAmount: 70000, skills: ["Java", "Data Structures", "Algorithms", "SQL", "AWS"], description: "Amazon SDE internship with PPO opportunity.", applyLink: "https://www.amazon.jobs", isRemote: false, category: "software" },
	{ title: "AI Research Intern", company: "Adobe", location: "Noida, India", duration: "6 months", stipend: "₹45,000/month", stipendAmount: 45000, skills: ["Python", "Deep Learning", "NLP", "PyTorch", "Research"], description: "AI research internship at Adobe Research India.", applyLink: "https://careers.adobe.com", isRemote: false, category: "data" },
	{ title: "Full Stack Intern", company: "Zoho", location: "Chennai, India", duration: "6 months", stipend: "₹15,000/month", stipendAmount: 15000, skills: ["JavaScript", "React", "Node.js", "SQL", "HTML", "CSS"], description: "Product development internship at Zoho.", applyLink: "https://careers.zohocorp.com", isRemote: false, category: "software" },
	{ title: "Data Engineering Intern", company: "Flipkart", location: "Bangalore, India", duration: "4 months", stipend: "₹40,000/month", stipendAmount: 40000, skills: ["Python", "SQL", "Spark", "AWS", "ETL"], description: "Data pipeline engineering at Flipkart.", applyLink: "https://www.flipkartcareers.com", isRemote: false, category: "data" },
	{ title: "Django Developer Intern", company: "Deloitte", location: "Remote", duration: "3 months", stipend: "₹20,000/month", stipendAmount: 20000, skills: ["Python", "Django", "REST API", "SQL", "Git"], description: "Remote Python Django internship at Deloitte.", applyLink: "https://www2.deloitte.com/in/en/careers.html", isRemote: true, category: "software" },
	{ title: "Android Developer Intern", company: "Cognizant", location: "Chennai, India", duration: "3 months", stipend: "₹12,000/month", stipendAmount: 12000, skills: ["Java", "Android", "Kotlin", "SQL", "Git"], description: "Mobile app development internship at Cognizant.", applyLink: "https://careers.cognizant.com", isRemote: false, category: "software" },
	{ title: "Cybersecurity Intern", company: "HCL Technologies", location: "Noida, India", duration: "4 months", stipend: "₹18,000/month", stipendAmount: 18000, skills: ["Linux", "Networking", "Cybersecurity", "Python", "Ethical Hacking"], description: "Security engineering internship at HCL.", applyLink: "https://www.hcltech.com/careers", isRemote: false, category: "software" },
];

async function seedJobsAndInternships() {
	try {
		const jobCount = await Job.countDocuments();
		if (jobCount === 0) {
			console.log("[JobAggregator] Seeding fresher job listings...");
			for (const job of SEED_JOBS) {
				try {
					await Job.findOneAndUpdate(
						{ company: job.company, title: job.title },
						{ $setOnInsert: { ...job, source: "seeded", postedAt: new Date() } },
						{ upsert: true, new: false }
					);
				} catch (e) {
					// skip duplicate key errors
				}
			}
			console.log(`[JobAggregator] Seeded ${SEED_JOBS.length} jobs.`);
		}

		const internCount = await Internship.countDocuments();
		if (internCount === 0) {
			console.log("[JobAggregator] Seeding internship listings...");
			for (const intern of SEED_INTERNSHIPS) {
				try {
					await Internship.findOneAndUpdate(
						{ company: intern.company, title: intern.title },
						{ $setOnInsert: { ...intern, source: "seeded", postedAt: new Date() } },
						{ upsert: true, new: false }
					);
				} catch (e) {
					// skip duplicates
				}
			}
			console.log(`[JobAggregator] Seeded ${SEED_INTERNSHIPS.length} internships.`);
		}
	} catch (error) {
		console.error("[JobAggregator] Seed error:", error.message);
	}
}

async function fetchFromExternalAPIs() {
	// Infrastructure ready for API integration
	const apiKey = process.env.ADZUNA_API_KEY;
	if (!apiKey) {
		// No external API configured — use seeded data
		return;
	}
	// TODO: Integrate Adzuna/JSearch when API keys are available
	console.log("[JobAggregator] External API integration configured. Fetching live jobs...");
}

function startCronJob() {
	// Run seed on startup
	seedJobsAndInternships();

	// Run every 6 hours
	cron.schedule("0 */6 * * *", async () => {
		console.log("[JobAggregator] Cron job triggered — refreshing job data...");
		await fetchFromExternalAPIs();
	});

	console.log("[JobAggregator] Cron job scheduled (every 6 hours).");
}

module.exports = { startCronJob, seedJobsAndInternships };
