const Company = require("../models/company");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const { calculateMatch } = require("../services/matchingService");

// Static company intelligence database
const COMPANY_INTEL = {
	TCS: { package: "3.5 LPA", difficulty: "Easy", interviewRounds: ["Online Test", "Technical Interview", "HR Round"], interviewProcess: "TCS conducts a national qualifier test (NQT) followed by HR discussions. Focus on aptitude, verbal, and basic coding.", domain: "IT Services", companyType: "MNC", rating: 3.8, website: "https://www.tcs.com" },
	Infosys: { package: "3.6 LPA", difficulty: "Easy", interviewRounds: ["Online Aptitude Test", "Technical Interview", "HR Round"], interviewProcess: "Infosys InfyTQ certification followed by aptitude test. Prepare basic DSA, verbal ability, and OOP concepts.", domain: "IT Services", companyType: "MNC", rating: 3.9, website: "https://www.infosys.com" },
	Wipro: { package: "3.5 LPA", difficulty: "Easy", interviewRounds: ["Online Test", "Technical Round", "HR Round"], interviewProcess: "Wipro NLTH (National Level Talent Hunt). Aptitude, English, coding tests followed by technical and HR interviews.", domain: "IT Services", companyType: "MNC", rating: 3.7, website: "https://www.wipro.com" },
	Accenture: { package: "4.5 LPA", difficulty: "Medium", interviewRounds: ["Cognitive Assessment", "Coding Test", "Technical Interview", "HR Round"], interviewProcess: "Accenture's recruitment has a cognitive & technical assessment, followed by virtual interviews covering problem-solving and behavioral questions.", domain: "Consulting & IT", companyType: "MNC", rating: 4.0, website: "https://www.accenture.com" },
	Cognizant: { package: "3.5 LPA", difficulty: "Easy", interviewRounds: ["GenC Assessment", "Technical Interview", "HR Interview"], interviewProcess: "CTS GenC program assessment covering aptitude and coding. Technical round focuses on Java, SQL, and data structures.", domain: "IT Services", companyType: "MNC", rating: 3.6, website: "https://www.cognizant.com" },
	Capgemini: { package: "3.8 LPA", difficulty: "Medium", interviewRounds: ["Pseudo Code Test", "Behavioral Test", "Technical Interview", "HR Round"], interviewProcess: "Capgemini uses game-based assessment + behavioral/pseudocode tests. Technical interview covers full stack basics.", domain: "IT Services", companyType: "MNC", rating: 3.8, website: "https://www.capgemini.com" },
	IBM: { package: "5 LPA", difficulty: "Medium", interviewRounds: ["Aptitude Test", "Coding Test", "Technical Interview", "HR Round"], interviewProcess: "IBM's process includes an aptitude + coding round followed by technical (Java/Python, DBMS, OS) and behavioral HR interview.", domain: "Technology & Consulting", companyType: "MNC", rating: 4.2, website: "https://www.ibm.com" },
	Deloitte: { package: "7 LPA", difficulty: "Medium", interviewRounds: ["Online Assessment", "Group Discussion", "Technical Interview", "Partner Round"], interviewProcess: "Deloitte focuses on analytical thinking and communication. Group discussion + technical interviews testing problem solving and technology knowledge.", domain: "Consulting", companyType: "MNC", rating: 4.1, website: "https://www2.deloitte.com" },
	"HCL Technologies": { package: "3.8 LPA", difficulty: "Easy", interviewRounds: ["Online Test", "Technical Interview", "HR Round"], interviewProcess: "HCL TechBee and graduate hiring. Straightforward process with aptitude + basic technical knowledge interview.", domain: "IT Services", companyType: "MNC", rating: 3.5, website: "https://www.hcltech.com" },
	"Tech Mahindra": { package: "3.8 LPA", difficulty: "Easy", interviewRounds: ["Online Aptitude Test", "Technical Round", "HR Round"], interviewProcess: "Tech Mahindra tests on aptitude, verbal reasoning, and basic CS fundamentals followed by a friendly HR round.", domain: "IT Services", companyType: "MNC", rating: 3.6, website: "https://www.techmahindra.com" },
	Salesforce: { package: "8 LPA", difficulty: "Hard", interviewRounds: ["Phone Screen", "Technical Rounds (x2)", "System Design", "HR Round"], interviewProcess: "Salesforce has a rigorous multi-round process: phone screening, 2 technical rounds (DSA + full stack), system design, and cultural fit interview.", domain: "CRM & Cloud", companyType: "Product", rating: 4.5, website: "https://www.salesforce.com" },
	Microsoft: { package: "20 LPA", difficulty: "Hard", interviewRounds: ["Online Assessment", "Technical Round (x3)", "Hiring Manager Round"], interviewProcess: "Microsoft HIRE: 3 technical interview rounds covering DSA, problem-solving, and system design. Strong algorithms focus required.", domain: "Technology", companyType: "Product", rating: 4.7, website: "https://www.microsoft.com" },
	Google: { package: "35 LPA", difficulty: "Hard", interviewRounds: ["Phone Screen", "Coding Rounds (x4)", "Behavioral Round"], interviewProcess: "Google's legendary process: 4 coding interviews (LeetCode hard level), behavioral round using 'Googleyness'. Requires extensive DSA preparation.", domain: "Technology", companyType: "Product", rating: 4.9, website: "https://careers.google.com" },
	Amazon: { package: "30 LPA", difficulty: "Hard", interviewRounds: ["Online Assessment", "Technical Rounds (x4)", "Bar Raiser Round"], interviewProcess: "Amazon uses Leadership Principles heavily. 4 technical rounds + Bar Raiser (behavioral). Strong DSA + system design + LP examples needed.", domain: "E-commerce & Cloud", companyType: "Product", rating: 4.6, website: "https://www.amazon.jobs" },
	Oracle: { package: "10 LPA", difficulty: "Medium", interviewRounds: ["Online Test", "Technical Rounds (x2)", "HR Round"], interviewProcess: "Oracle's hiring focuses on Java, SQL, and cloud technologies. 2 technical rounds + HR. Database knowledge is essential.", domain: "Database & Cloud", companyType: "Product", rating: 4.0, website: "https://careers.oracle.com" },
	Zoho: { package: "5 LPA", difficulty: "Medium", interviewRounds: ["Written Test", "Programming Round", "Technical Interview", "HR Round"], interviewProcess: "Zoho's unique process: written aptitude + in-person programming test. Strong emphasis on problem-solving ability over resume.", domain: "SaaS Products", companyType: "Product", rating: 4.1, website: "https://careers.zohocorp.com" },
	SAP: { package: "8 LPA", difficulty: "Medium", interviewRounds: ["Online Assessment", "Technical Interview", "Manager Round", "HR Round"], interviewProcess: "SAP focuses on Java, cloud, and ERP knowledge. Culture fit is important. Good communication and technical depth required.", domain: "ERP & Cloud", companyType: "Product", rating: 4.2, website: "https://jobs.sap.com" },
	Adobe: { package: "15 LPA", difficulty: "Hard", interviewRounds: ["Online Coding Test", "Technical Rounds (x3)", "Hiring Manager Round"], interviewProcess: "Adobe emphasizes strong CS fundamentals, creative problem-solving, and a portfolio for design roles. 3 technical rounds.", domain: "Software & Creative", companyType: "Product", rating: 4.5, website: "https://careers.adobe.com" },
};

module.exports.companiesPage = async (req, res) => {
	try {
		// Fetch interview companies from DB and enrich with intel
		const dbCompanies = await Company.find({}).sort({ name: 1 });

		// Get student skills for match calculation
		let latestAnalysis = null;
		let studentSkills = [];

		if (req.user && req.user.skills && req.user.skills.length > 0) {
			studentSkills = req.user.skills || [];
			latestAnalysis = await ResumeAnalysis.findOne({ employee: req.user._id }).sort({ createdAt: -1 });
		}

		if (studentSkills.length === 0) {
			latestAnalysis = await ResumeAnalysis.findOne({}).sort({ createdAt: -1 });
			studentSkills = latestAnalysis?.technicalSkills || [];
		}

		// Build enriched company list combining DB + static intel
		const enrichedCompanies = Object.entries(COMPANY_INTEL).map(([name, intel]) => {
			const dbCompany = dbCompanies.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));
			const requiredSkills = dbCompany?.requiredSkills || [];
			const matchResult = studentSkills.length > 0 && requiredSkills.length > 0
				? calculateMatch(studentSkills, requiredSkills)
				: { matchPercent: 0, matched: [], missing: requiredSkills };

			return {
				_id: dbCompany?._id || name,
				name,
				...intel,
				requiredSkills,
				minimumCgpa: dbCompany?.minimumCgpa || 6.0,
				allowedBacklogs: dbCompany?.allowedBacklogs || 0,
				matchPercent: matchResult.matchPercent,
				isInDB: !!dbCompany,
			};
		});

		return res.render("company-intel", {
			title: "Company Intelligence",
			companies: enrichedCompanies,
			studentSkills,
			hasAnalysis: !!latestAnalysis,
			totalCompanies: enrichedCompanies.length,
		});
	} catch (error) {
		console.error(error);
		req.flash("error", "Unable to load company data.");
		return res.redirect("/");
	}
};

module.exports.companyDetail = async (req, res) => {
	try {
		const companyName = decodeURIComponent(req.params.name);
		const intel = COMPANY_INTEL[companyName];

		if (!intel) {
			req.flash("error", "Company not found.");
			return res.redirect("/ai/companies");
		}

		const dbCompany = await Company.find({})
			.then((cs) => cs.find((c) => c.name.toLowerCase().includes(companyName.toLowerCase())));

		let latestAnalysis = null;
		let studentSkills = [];

		if (req.user && req.user.skills && req.user.skills.length > 0) {
			studentSkills = req.user.skills || [];
			latestAnalysis = await ResumeAnalysis.findOne({ employee: req.user._id }).sort({ createdAt: -1 });
		}

		if (studentSkills.length === 0) {
			latestAnalysis = await ResumeAnalysis.findOne({}).sort({ createdAt: -1 });
			studentSkills = latestAnalysis?.technicalSkills || [];
		}
		const requiredSkills = dbCompany?.requiredSkills || [];
		const matchResult = calculateMatch(studentSkills, requiredSkills);

		return res.render("company-detail", {
			title: `${companyName} — Company Intelligence`,
			company: { name: companyName, ...intel, requiredSkills, minimumCgpa: dbCompany?.minimumCgpa || 6.0, allowedBacklogs: dbCompany?.allowedBacklogs || 0 },
			matchResult,
			studentSkills,
			hasAnalysis: !!latestAnalysis,
		});
	} catch (error) {
		console.error(error);
		req.flash("error", "Unable to load company details.");
		return res.redirect("/ai/companies");
	}
};

module.exports.COMPANY_INTEL = COMPANY_INTEL;
