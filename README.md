# 🚀 PlaceAI – AI-Powered Placement Intelligence Platform

<p align="center">
  <h3 align="center">AI-Driven Career Intelligence & Placement Management System</h3>
  <p align="center">
    Resume Analysis • Job Matching • Internship Recommendations • Skill Gap Analysis • Company Intelligence • Career AI Agent
  </p>
</p>

---

## 🌟 Overview

PlaceAI is a full-stack Placement Intelligence Platform that combines traditional placement management workflows with AI-powered career guidance.

The platform helps students improve placement readiness through ATS resume analysis, job matching, internship recommendations, skill gap analysis, company intelligence, eligibility checking, and AI-based career assistance.

Built using **Node.js, Express.js, MongoDB, EJS, Bootstrap, Tailwind CSS, Chart.js, and Google Gemini AI**.

---

## 🎯 Key Highlights

* Developed a complete Placement Management System with AI-powered career intelligence.
* Integrated ATS Resume Analysis with skill extraction and readiness scoring.
* Built Job Matching and Internship Recommendation engines.
* Implemented Skill Gap Analysis and personalized learning recommendations.
* Developed Company Intelligence module with hiring insights.
* Added Eligibility Checker based on CGPA, backlogs, and required skills.
* Integrated Google OAuth and Session Authentication.
* Designed interactive analytics dashboards using Chart.js.
* Built responsive UI optimized for students and placement teams.

---

# ✨ Core Modules

## 🎓 Student Management

* Student Profile Management
* Academic Information Tracking
* CGPA Monitoring
* Backlog Tracking
* Resume Upload & Management
* Skills Management
* Placement Readiness Tracking

---

## 🏢 Company Management

* Company Registration
* Hiring Criteria Management
* Placement Drive Management
* Recruitment Workflow Tracking
* Eligibility Configuration

---

## 📅 Interview Management

* Interview Scheduling
* Candidate Tracking
* Company-wise Interview Management
* Placement Drive Coordination
* Recruitment Progress Monitoring

---

## 📊 Analytics Dashboard

* Placement Readiness Statistics
* ATS Score Distribution
* Skill Demand Analysis
* Job Market Insights
* Internship Analytics
* Hiring Trend Analysis
* Student Performance Metrics

---

# 🤖 AI Features

## 📄 AI Resume Analyzer

Upload a resume and receive:

* ATS Score
* Skill Extraction
* Resume Strength Analysis
* Weakness Detection
* Readiness Assessment
* Improvement Suggestions

---

## 💼 AI Job Recommendation Engine

Provides personalized job recommendations based on student profiles.

### Features

* Skill Matching
* Match Percentage Calculation
* Hiring Probability Prediction
* Missing Skill Detection
* Career Recommendations

---

## 🎯 AI Internship Recommendation Engine

Recommends internships using:

* Resume Analysis
* Skills Assessment
* Career Interests
* Readiness Metrics

### Output

* Company Name
* Role
* Stipend
* Duration
* Match Percentage

---

## 🧠 Skill Gap Analysis

Analyzes current skills against industry requirements.

### Features

* Missing Skill Detection
* Career Roadmap Generation
* Learning Recommendations
* Placement Readiness Evaluation

### Supported Career Paths

* Software Engineer
* Full Stack Developer
* Backend Developer
* Frontend Developer
* Data Analyst
* Data Scientist
* DevOps Engineer

---

## 🏢 Company Intelligence

Provides detailed hiring insights for major companies.

### Information Available

* Hiring Process
* Required Skills
* Interview Rounds
* Selection Criteria
* Hiring Difficulty
* Package Information

### Supported Companies

* Google
* Microsoft
* Amazon
* Salesforce
* Infosys
* TCS
* Wipro
* Cognizant
* Deloitte
* IBM
* Accenture
* Capgemini
* HCL

---

## 🤖 Career AI Agent

AI-powered assistant for career guidance.

### Capabilities

* Resume Improvement Advice
* Placement Readiness Guidance
* Job Recommendations
* Internship Recommendations
* Career Roadmaps
* Interview Preparation Guidance

---

## 🎯 Job Match Engine

Compares:

Student Resume

VS

Company Requirements

### Output

* Match Percentage
* Matched Skills
* Missing Skills
* Hiring Probability
* Readiness Score

---

## ✅ Eligibility Checker

Automatically evaluates placement eligibility using:

* CGPA
* Backlogs
* Skills
* Company Requirements

### Results

* Eligible
* Conditionally Eligible
* Not Eligible

---

# 🖼️ Screenshots

## Dashboard

![Dashboard](screenshots/dashboard.png)

## Analytics Dashboard

![Analytics](screenshots/analytics.png)

## AI Placement Profile

![Profile](screenshots/profile.png)

## Job Recommendations

![Jobs](screenshots/jobs.png)

## Internship Recommendations

![Internships](screenshots/internships.png)

## Company Intelligence

![Company Intelligence](screenshots/company-intel.png)

## Skill Gap Analysis

![Skill Gap Analysis](screenshots/skill-gap.png)

## Career AI Agent

![Career AI Agent](screenshots/ai-agent.png)

## Job Match Engine

![Job Match](screenshots/job-match.png)

## Eligibility Checker

![Eligibility Checker](screenshots/eligibility.png)

---

# 🏗️ System Architecture

```text
Client (EJS Views)
        │
        ▼
Express Routes
        │
        ▼
Controllers
        │
        ▼
Services Layer
        │
        ├── Resume Analyzer
        ├── ATS Scoring Engine
        ├── Job Recommendation Engine
        ├── Internship Recommendation Engine
        ├── Skill Gap Engine
        ├── Company Intelligence Engine
        ├── Eligibility Engine
        └── Gemini AI Service
        │
        ▼
MongoDB Database
```

---

# 🛠️ Technology Stack

## Frontend

* HTML5
* CSS3
* Bootstrap 5
* Tailwind CSS
* JavaScript
* EJS
* SCSS
* Chart.js

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose

## Authentication

* Passport.js
* Session Authentication
* Google OAuth

## AI Integration

* Google Gemini AI
* Resume Parsing
* ATS Scoring
* Skill Extraction
* Recommendation Systems

---

# 📂 Project Structure

```text
PlaceAI
│
├── assets/
├── config/
├── controllers/
├── mailers/
├── models/
├── public/
├── routes/
├── screenshots/
├── services/
├── storage/
├── uploads/
├── views/
├── workers/
│
├── .env
├── .gitignore
├── ENV_FORMAT.json
├── gulpfile.js
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/shivpalrathod/PlaceAI---AI-powered-Placement-Intelligence-Platform.git
cd PlaceAI---AI-powered-Placement-Intelligence-Platform
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file:

```env
ENVIRONMENT=development
DEPLOYMENT=local

DEVELOPMENT_DB=mongodb://127.0.0.1:27017/placement_cell

DEVELOPMENT_SESSION_COOKIE_KEY=your_secret_key

DEVELOPMENT_WEBSITE_LINK=http://localhost:8000

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

PORT=8000
```

## Run Application

```bash
npm run dev_start
```

Visit:

```text
http://localhost:8000
```

---

# 🔒 Security Features

* Session-Based Authentication
* Google OAuth Login
* Protected Routes
* File Upload Validation
* Secure Environment Variables
* MongoDB Validation

---

# 🚀 Future Enhancements

* AI Mock Interviews
* Voice Interview Assistant
* Resume Builder
* Student Self-Service Portal
* Real-Time Job APIs
* Email Notifications
* WhatsApp Notifications
* Docker Deployment
* Kubernetes Deployment
* Mobile Application

---

# 👨‍💻 Developer

### Shivpal Rathod

B.Tech – Computer Science & Engineering

📧 Email: [shivpalrathod1122@gmail.com](mailto:shivpalrathod1122@gmail.com)

💼 LinkedIn: https://www.linkedin.com/in/shivpalrathod

🐙 GitHub: https://github.com/shivpalrathod

---

# ⭐ Support

If you found this project useful:

⭐ Star the Repository

🍴 Fork the Repository

📢 Share the Project

---

## 📜 License

This project is developed for educational, placement management, and career development purposes.

© 2026 Shivpal Rathod. All Rights Reserved.
