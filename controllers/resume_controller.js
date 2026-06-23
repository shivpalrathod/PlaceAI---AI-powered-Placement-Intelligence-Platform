const Student = require("../models/student");
const pdfParse = require("pdf-parse");
const fs = require("fs");

module.exports.uploadResume = async (req, res) => {
    try {

        const pdfBuffer = fs.readFileSync(req.file.path);

        const data = await pdfParse(pdfBuffer);

        const resumeText = data.text;

        const skills = [];

        const skillList = [
            "Python",
            "Java",
            "JavaScript",
            "React",
            "NodeJS",
            "Express",
            "MongoDB",
            "MySQL",
            "SQL",
            "Django",
            "Flask",
            "Git",
            "GitHub",
            "Docker",
            "AWS",
            "Kubernetes",
            "Machine Learning",
            "AI",
            "Data Structures",
            "Algorithms",
            "DSA",
            "REST API"
        ];

        skillList.forEach(skill => {
            if (
                resumeText.toLowerCase().includes(
                    skill.toLowerCase()
                )
            ) {
                skills.push(skill);
            }
        });

        const atsScore = Math.min(
            Math.round((skills.length / skillList.length) * 100),
            100
        );

        const jobRoles = {
            "Python Backend Developer": [
                "Python",
                "Django",
                "Flask",
                "MySQL"
            ],

            "Frontend Developer": [
                "HTML",
                "CSS",
                "JavaScript",
                "React"
            ],

            "Full Stack Developer": [
                "React",
                "NodeJS",
                "MongoDB"
            ],

            "AI Engineer": [
                "Python",
                "Machine Learning",
                "AI"
            ],

            "DevOps Engineer": [
                "Docker",
                "AWS",
                "Kubernetes"
            ]
        };

        const recommendations = [];

        for (let role in jobRoles) {

            const matchedSkills =
                jobRoles[role].filter(skill =>
                    skills.includes(skill)
                ).length;

            const score = Math.round(
                (matchedSkills /
                    jobRoles[role].length) * 100
            );

            if (score >= 50) {
                recommendations.push({
                    role,
                    score
                });
            }
        }

        return res.status(200).json({
            status: "success",
            skills,
            atsScore,
            recommendations
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            status: "error",
            message: err.message
        });

    }
};