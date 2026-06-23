//Require the Validation Result Module from the Express validator
const { validationResult } = require("express-validator");
//Require the Database Validation Middleware
const { DBValidation } = require("../config/middleware");
//Require the Path Finder Middleware
const { pathFinder } = require("../config/middleware");
//Require the Employee Model
const Employee = require("../models/employee");
//Require the Student Model
const Student = require("../models/student");
//Require the Interview Model
const Interview = require("../models/interview");
//Require the Result Model
const Result = require("../models/result");
//Require the Company Model
const Company = require("../models/company");
//Require File System Module for the Directory
const fs = require("fs");
//Require Path Module for the Directory
const path = require("path");
//Require the BCryptJS Module
const bcrypt = require("bcryptjs");
//Require Mongoose Library
const mongoose = require("mongoose");
const pdfParse = require("pdf-parse");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const { generateJson } = require("../services/geminiService");

const TECHNICAL_SKILLS = ["JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Express", "MongoDB", "MySQL", "PostgreSQL", "SQL", "Python", "Java", "C++", "C#", "Django", "Flask", "REST API", "Git", "GitHub", "Docker", "AWS", "Kubernetes", "Machine Learning", "Data Structures", "Algorithms"];
const SOFT_SKILLS = ["Communication", "Leadership", "Teamwork", "Problem Solving", "Adaptability", "Collaboration", "Time Management"];
const list = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()).slice(0, 20) : [];
const score = (value, fallback) => Math.max(0, Math.min(100, Number.isFinite(Number(value)) ? Math.round(Number(value)) : fallback));


//Displays the Home Page or the Login Page
module.exports.homepage = async (req, res) => {
	//If the User is Logged In
	if (req.isAuthenticated()) {
		try {
			let query1 = [
				{
					path: "company",
				},
				{
					path: "result",
				},
				{
					path: "student",
				},
			];
			let query2 = [
				{
					path: "student",
				},
				{
					path: "course",
				},
			];
			let query3 = [
				{
					path: "student",
				},
				{
					path: "interview",
				},
				{
					path: "company",
				},
			];
			//Find all the Students
			let students = await Student.find({})
				.populate("batch")
				.populate({
					path: "interviews",
					populate: query1,
				})
				.populate({
					path: "scores",
					populate: query2,
				})
				.populate({
					path: "results",
					populate: query3,
				});
			//Find all the Companies
			let companies = await Company.find({})
				.populate({
					path: "results",
					populate: query3,
				})
				.populate({
					path: "interviews",
					populate: query1,
				});

			// Find all Interviews
			let interviews = await Interview.find({})
				.populate("company")
				.populate("student")
				.populate("result");

			// Get active jobs and internships for matches
			const Job = require("../models/Job");
			const Internship = require("../models/Internship");
			const { rankJobs, rankInternships } = require("../services/matchingService");
			
			const activeJobs = await Job.find({ isActive: true });
			const activeInternships = await Internship.find({ isActive: true });

			// Enrich students list with their latest ResumeAnalysis and match counts
			const studentsWithAnalysis = [];
			for (let s of students) {
				const analysis = await ResumeAnalysis.findOne({ student: s._id }).sort({ createdAt: -1 });
				const sSkills = s.skills || [];
				const recommendedJobsCount = sSkills.length > 0 ? rankJobs(sSkills, activeJobs, 100).filter(j => j.matchPercent >= 50).length : 0;
				const recommendedInternshipsCount = sSkills.length > 0 ? rankInternships(sSkills, activeInternships, 100).filter(i => i.matchPercent >= 50).length : 0;
				
				studentsWithAnalysis.push({
					...s.toObject ? s.toObject() : s,
					analysis: analysis,
					recommendedJobsCount,
					recommendedInternshipsCount
				});
			}

			// Get logged-in user specific variables
			const loggedInUser = req.user;
			const userAnalysis = await ResumeAnalysis.findOne({ employee: loggedInUser._id }).sort({ createdAt: -1 });
			
			const userJobMatches = loggedInUser.skills && loggedInUser.skills.length > 0 ? rankJobs(loggedInUser.skills, activeJobs, 100) : [];
			const userInternshipMatches = loggedInUser.skills && loggedInUser.skills.length > 0 ? rankInternships(loggedInUser.skills, activeInternships, 100) : [];

			return res.render("home", {
				title: "Home 🏠",
				student: loggedInUser,
				students: studentsWithAnalysis,
				interviews: interviews,
				companies: companies,
				atsScore: loggedInUser.atsScore || (userAnalysis ? userAnalysis.atsScore : 0),
				readinessScore: loggedInUser.placementReadinessScore || (userAnalysis ? userAnalysis.placementReadinessScore : 0),
				skills: loggedInUser.skills || (userAnalysis ? userAnalysis.technicalSkills : []),
				resumeSummary: userAnalysis && userAnalysis.improvements && userAnalysis.improvements.betterSummary ? userAnalysis.improvements.betterSummary : "No summary available. Upload resume.",
				jobMatches: userJobMatches,
				internshipMatches: userInternshipMatches,
			});
		} catch (err) {
			console.log(err);
			req.flash("error", err);
			return res.redirect("back");
		}
	}
	//If there are no Employees in the Database then delete all the uploaded files
	try {
		let employee = await Employee.find({});
		if (employee.length === 0) {
			//Read the Directory
			const files = await fs.promises.readdir(
				path.join(__dirname, "..", Employee.filePath)
			);
			//Delete all the Files
			for (let file of files) {
				fs.unlinkSync(path.join(__dirname, "..", Employee.filePath, file));
			}
		}
	} catch (error) {
		console.log(error);
	}
	return res.render("home", {
		title: "Login 👋",
	});
};

//Displays the Sign Up Page
module.exports.signup = (req, res) => {
	if (req.isAuthenticated()) return res.redirect("/");

	return res.render("signup", {
		title: "Sign Up 📝",
	});
};

//Creates a New User
module.exports.createUser = async (req, res) => {
	if (req.isAuthenticated()) return res.redirect("/");

	//BACKEND VALIDATION :: Validation Result from the Router
	const errors = validationResult(req);

	//If there are Errors in the Validation of the Form
	if (!errors.isEmpty()) {
		const error = errors.array();
		req.flash("error", error[0].msg);
		return res.redirect("back");
	}

	//Custom BACKEND VALIDATION :: Form
	if (req.body.password !== req.body.confirm_password) {
		req.flash("error", "Password didn't Match ❌");
		return res.redirect("back");
	}

	//Check if the User already exists
	try {
		let employee = await Employee.findOne({ email: req.body.email });
		if (!employee) {
			//New User Creation
			employee = await Employee.create(req.body);
			try {
				//Hashes the Password
				const salt = await bcrypt.genSalt(10);
				const hashedPassword = await bcrypt.hash(req.body.password, salt);
				employee.password = hashedPassword;
				//Saves the Employee Avatar Path with Blank Avatar
				employee.avatarPath = pathFinder("images/empty-avatar.png");
				await employee.save();
				req.flash("success", "User Created Successfully 🎊 🥳");
				return res.redirect("/");
			} catch (err) {
				console.log(err);
				req.flash("error", err);
				return res.redirect("back");
			}
		} else {
			req.flash("error", "User Already Exists 😲");
			return res.redirect("back");
		}
	} catch (error) {
		console.log(error);
		const obj = DBValidation(req, res, error);
		req.flash("error", obj.message);
		return res.redirect("back");
	}
};

//Creates a New Session or Logs the User In
module.exports.createSession = (req, res) => {
	if (req.isAuthenticated()) return res.redirect("/");
	req.flash("success", "Logged In Successfully 🔥");
	return res.redirect("/");
};

//Destroys the Session or Logs the User Out
module.exports.destroySession = (req, res) => {
	req.logout((err) => {
		if (err) return next(err);
		req.flash("success", "Logged Out Successfully 🚀");
		return res.redirect("/");
	});
};

//Displays the Profile Page
module.exports.profile = async (req, res) => {
	try {
		const CHECK = mongoose.Types.ObjectId.isValid(req.params.id);
		if (!CHECK) {
			return res.status(200).json({
				status: "error",
				message:
					"Something Went Wrong with your Browser. Please Refresh the Page 🤷‍♂️",
			});
		}

		//Find the Employee to show the Profile
		const employee = await Employee.findById(req.params.id);
		if (!employee) {
			req.flash("error", "Profile not found.");
			return res.redirect("back");
		}
		const analysis = await ResumeAnalysis.findOne({ employee: employee._id }).sort({ createdAt: -1 });
		
		const Job = require("../models/Job");
		const Internship = require("../models/Internship");
		const { rankJobs, rankInternships } = require("../services/matchingService");
		
		const studentSkills = employee.skills || [];
		const jobs = await Job.find({ isActive: true });
		const internships = await Internship.find({ isActive: true });
		const recommendedJobs = studentSkills.length > 0 ? rankJobs(studentSkills, jobs, 3) : [];
		const recommendedInternships = studentSkills.length > 0 ? rankInternships(studentSkills, internships, 3) : [];

		return res.render("profile", {
			title: "Profile 👨",
			profile_user: employee,
			analysis: analysis,
			recommendedJobs: recommendedJobs,
			recommendedInternships: recommendedInternships,
		});
	} catch (error) {
		console.log(error);
		const obj = DBValidation(req, res, error);
		req.flash("error", obj.message);
		return res.redirect("back");
	}
};

//Updates the Profile Page
module.exports.update = async (req, res) => {
	try {
		const CHECK = mongoose.Types.ObjectId.isValid(req.params.id);
		if (!CHECK) {
			return res.status(200).json({
				status: "error",
				message:
					"Something Went Wrong with your Browser. Please Refresh the Page 🤷‍♂️",
			});
		}

		//If the Logged In User is the same as the Employee's Profile then Update the Profile
		if (req.params.id == req.user.id) {
			//Find the User by the ID
			let employee = await Employee.findById(req.params.id);
			//Call Employee's static method to upload files
			Employee.uploadedFile(req, res, async (err) => {
				if (err) {
					console.log("Error in MULTER: ", err);
					req.flash("error", err.message || "File upload failed.");
					return res.redirect("back");
				}

				//Set Name & Email
				employee.name = req.body.name;
				employee.email = req.body.email;
				//Hash the Password
				if (req.body.password && req.body.password !== employee.password) {
					const salt = await bcrypt.genSalt(10);
					const hashedPassword = await bcrypt.hash(
						req.body.password,
						salt
					);
					employee.password = hashedPassword;
				}

				//If Incoming Avatar File Exists
				if (req.files && req.files.avatar && req.files.avatar.length > 0) {
					const avatarFile = req.files.avatar[0];
					//If Employee Avatar already exists in the Database
					if (employee.avatarPath) {
						//If Employee Avatar already exists in the "/uploads/employees/avatars" Directory
						const oldAvatar = path.join(__dirname, "..", employee.avatarPath);
						if (fs.existsSync(oldAvatar)) {
							//Delete that Old Avatar
							fs.unlinkSync(oldAvatar);
						}
					}
					//Save the New Avatar
					employee.avatarPath = Employee.filePath + "/" + avatarFile.filename;
				}

				//If Incoming Resume File Exists
				if (req.files && req.files.resume && req.files.resume.length > 0) {
					const resumeFile = req.files.resume[0];
					const filePath = resumeFile.path;
					try {
						const text = (await pdfParse(await fs.promises.readFile(filePath))).text.replace(/\s+/g, " ").trim();
						if (text.length < 40) {
							req.flash("error", "The PDF does not contain enough readable text to analyze.");
							return res.redirect("back");
						}

						// Local analysis logic
						const localAnalysis = (t) => {
							const lower = t.toLowerCase();
							const technicalSkills = TECHNICAL_SKILLS.filter((skill) => lower.includes(skill.toLowerCase()));
							const softSkills = SOFT_SKILLS.filter((skill) => lower.includes(skill.toLowerCase()));
							const hasProjects = /project|experience|internship/i.test(t);
							const hasEducation = /education|university|college|bachelor/i.test(t);
							const hasContact = /@|linkedin|github|phone/i.test(t);
							const atsScore = Math.min(100, Math.round(technicalSkills.length * 3 + softSkills.length * 2 + (hasProjects ? 20 : 0) + (hasEducation ? 10 : 0) + (hasContact ? 8 : 0)));
							const missingSections = [!hasContact && "Contact details", !hasEducation && "Education", !hasProjects && "Projects or experience"].filter(Boolean);
							return {
								atsScore,
								placementReadinessScore: Math.min(100, Math.round(atsScore * 0.8 + (hasProjects ? 15 : 0))),
								technicalSkills,
								softSkills,
								missingSkills: TECHNICAL_SKILLS.filter((skill) => !technicalSkills.includes(skill)).slice(0, 8),
								strengths: [technicalSkills.length >= 4 && "Demonstrates a technical foundation", hasProjects && "Includes project or experience evidence", hasEducation && "Includes academic background"].filter(Boolean),
								weaknesses: [technicalSkills.length < 4 && "Technical skill coverage is limited", !hasProjects && "Project impact is not clearly demonstrated", !hasContact && "Recruiter contact information is incomplete"].filter(Boolean),
								improvementSuggestions: ["Use role-specific keywords in your summary and project bullets", "Quantify project outcomes with metrics", "Keep formatting simple for applicant tracking systems"],
								projects: ["Portfolio Website", "Task Management App"],
								certifications: ["CS Fundamentals Certified"],
								education: ["Bachelor of Technology in CS"],
								improvements: { missingSections, weakSections: [!hasProjects && "Projects/experience", technicalSkills.length < 4 && "Technical skills"].filter(Boolean), betterSummary: "Motivated developer with coding experience and problem-solving skills.", projectSuggestions: ["Describe the technology stack and outcomes."], skillsSuggestions: ["Highlight key developer skills first."], grammarSuggestions: ["Keep bullets concise and action-oriented."] }
							};
						};

						const fallback = localAnalysis(text);
						const prompt = `You are an expert ATS resume reviewer. Analyze this resume and return an object with atsScore, placementReadinessScore, technicalSkills, softSkills, missingSkills, strengths, weaknesses, improvementSuggestions, projects (list of key project titles/descriptions), certifications (list of certs), education (list of education degrees/colleges), and improvements {missingSections, weakSections, betterSummary, projectSuggestions, skillsSuggestions, grammarSuggestions}. Scores must be 0-100. Resume:\n${text.slice(0, 30000)}`;

						const generated = await generateJson(prompt, fallback);
						const data = generated.data;

						// Save to ResumeAnalysis in MongoDB
						const analysis = await ResumeAnalysis.create({
							employee: employee._id,
							createdBy: req.user._id,
							resumePath: `/storage/uploads/resume/${resumeFile.filename}`,
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

						// Update employee fields
						employee.resumePath = analysis.resumePath;
						employee.skills = analysis.technicalSkills;
						employee.atsScore = analysis.atsScore;
						employee.placementReadinessScore = analysis.placementReadinessScore;
						employee.projects = analysis.projects;
						employee.certifications = analysis.certifications;
						employee.education = analysis.education;

					} catch (parseErr) {
						console.error("PDF Parsing or analysis error:", parseErr);
						req.flash("error", "Failed to parse PDF resume text.");
						return res.redirect("back");
					}
				}

				//Save the Employee
				await employee.save();

				req.flash("success", "Profile Updated Successfully 🎊 🥳");
				return res.redirect("back");
			});
		} else {
			req.flash("error", "Unauthorized ❌");
			return res.status(401).send("Unauthorized");
		}
	} catch (error) {
		console.log(error);
		const obj = DBValidation(req, res, error);
		req.flash("error", obj.message);
		return res.redirect("back");
	}
};
