const mongoose = require("mongoose");
const Student = require("./models/student");
const Batch = require("./models/batch");
const env = require("./config/environment");

async function check() {
  await mongoose.connect(env.db);
  const students = await Student.find({}).populate("batch");
  for (let s of students) {
    console.log(`Student: ${s.name}, Batch field:`, s.batch);
  }
  await mongoose.disconnect();
}
check().catch(console.error);
