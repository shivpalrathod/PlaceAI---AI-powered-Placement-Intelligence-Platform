const mongoose = require("mongoose");
const Student = require("./models/student");
const Company = require("./models/company");
const Interview = require("./models/interview");
const env = require("./config/environment");

async function check() {
  await mongoose.connect(env.db);
  console.log("Connected to MongoDB:", env.db);
  const students = await Student.find({});
  const companies = await Company.find({});
  const interviews = await Interview.find({});
  console.log("Student Count:", students.length);
  console.log("Company Count:", companies.length);
  console.log("Interview Count:", interviews.length);
  console.log("Students details:", JSON.stringify(students.slice(0, 5), null, 2));
  console.log("Companies details:", JSON.stringify(companies.slice(0, 5), null, 2));
  await mongoose.disconnect();
}
check().catch(console.error);
