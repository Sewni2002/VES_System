const mongoose = require("mongoose");

// Common fields for studentDB
const commonStudentFields = {
  iname: { type: String, required: true },
  fname: { type: String, required: true },
  studentID: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  vivaregstatus: { type: Boolean, required: true },
  academic_status: { type: String, required: true },
  currentGPA: { type: Number, default: 0.0 },

};

// Base student schema
const studentSchema = new mongoose.Schema(commonStudentFields);

const Student = mongoose.model("studentdb", studentSchema);

function createSemesterStudentSchema() {
  return new mongoose.Schema({
    studentID: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    photo: { type: String },
    enrolledDate: { type: Date },
    groupID: { type: String },
    faculty: { type: String },
    payment_status: { type: Boolean, default: false },
    phone: {type:String },
    religion: { type: String, required:true }, 
    gender: { type: String, required:true }, 
    gpa: { type: Number, default: 0.0 },
  });
}

// Create models for each semester table
const Y01_Sem01Stud = mongoose.model("Y01_Sem01Stud", createSemesterStudentSchema());
const Y01_Sem02Stud = mongoose.model("Y01_Sem02Stud", createSemesterStudentSchema());
const Y02_Sem01Stud = mongoose.model("Y02_Sem01Stud", createSemesterStudentSchema());
const Y02_Sem02Stud = mongoose.model("Y02_Sem02Stud", createSemesterStudentSchema());
const Y03_Sem01Stud = mongoose.model("Y03_Sem01Stud", createSemesterStudentSchema());
const Y03_Sem02Stud = mongoose.model("Y03_Sem02Stud", createSemesterStudentSchema());

module.exports = {
  Student,
  Y01_Sem01Stud,
  Y01_Sem02Stud,
  Y02_Sem01Stud,
  Y02_Sem02Stud,
  Y03_Sem01Stud,
  Y03_Sem02Stud,
};