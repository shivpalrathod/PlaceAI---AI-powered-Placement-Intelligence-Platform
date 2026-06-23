const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const Employee = require("./models/employee");
const ResumeAnalysis = require("./models/ResumeAnalysis");
const { generateJson } = require("./services/geminiService");
const env = require("./config/environment");

const TECHNICAL_SKILLS = ["JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Express", "MongoDB", "MySQL", "PostgreSQL", "SQL", "Python", "Java", "C++", "C#", "Django", "Flask", "REST API", "Git", "GitHub", "Docker", "AWS", "Kubernetes", "Machine Learning", "Data Structures", "Algorithms"];
const SOFT_SKILLS = ["Communication", "Leadership", "Teamwork", "Problem Solving", "Adaptability", "Collaboration", "Time Management"];
const list = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()).slice(0, 20) : [];
const score = (value, fallback) => Math.max(0, Math.min(100, Number.isFinite(Number(value)) ? Math.round(Number(value)) : fallback));

async function run() {
  await mongoose.connect(env.db);
  console.log("Connected to DB:", env.db);

  const employee = await Employee.findOne({});
  if (!employee) {
    console.error("No Employee record found in DB. Make sure you are signed up/logged in.");
    await mongoose.disconnect();
    return;
  }
  console.log("Found Employee:", employee.name, "Email:", employee.email, "ID:", employee._id);

  const filePath = path.join(__dirname, "storage", "uploads", "resume", "1782231502670-Shivpal_Rathod_FAANG_Optimized.pdf");
  if (!fs.existsSync(filePath)) {
    console.error("Resume PDF file not found at:", filePath);
    await mongoose.disconnect();
    return;
  }

  const dataBuffer = await fs.promises.readFile(filePath);
  const parsed = await pdfParse(dataBuffer);
  const text = parsed.text.replace(/\s+/g, " ").trim();
  console.log("Parsed PDF text length:", text.length);

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
  const prompt = `You are an expert ATS resume reviewer. Analyze this resume and return an object with atsScore, placementReadinessScore, technicalSkills, softSkills, missingSkills, strengths, weaknesses, improvementSuggestions, projects (list of key project titles), certifications (list of certifications), education (list of education degrees/colleges), and improvements {missingSections, weakSections, betterSummary, projectSuggestions, skillsSuggestions, grammarSuggestions}. Scores must be 0-100. Resume:\n${text.slice(0, 30000)}`;

  console.log("Calling Gemini API...");
  const generated = await generateJson(prompt, fallback);
  const data = generated.data;
  console.log("Gemini API call source:", generated.source);

  // Save to ResumeAnalysis in MongoDB
  const analysis = await ResumeAnalysis.create({
    employee: employee._id,
    createdBy: employee._id,
    resumePath: `/storage/uploads/resume/1782231502670-Shivpal_Rathod_FAANG_Optimized.pdf`,
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

  await employee.save();
  console.log("Successfully parsed and updated Employee Profile!");
  console.log("Saved ATS Score:", employee.atsScore);
  console.log("Saved Placement Readiness:", employee.placementReadinessScore);
  console.log("Saved Skills:", employee.skills);

  await mongoose.disconnect();
}

run().catch(console.error);
