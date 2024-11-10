const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  f_Name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [3, "Name should be at least 3 characters"],
    maxlength: [30, "Name should not exceed 30 characters"],
  },
  f_Email: {
    type: String,
    required: [true, "Email is required"],
    match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
  },
  f_MobileNo: {
    type: String,
    required: [true, "Mobile number is required"],
    match: [/^[0-9]{10}$/, "Mobile number must be a 10-digit number"],
  },
  f_Designation: {
    type: String,
    required: [true, "Designation is required"],
  },
  f_Gender: {
    type: String,
    enum: ["Male", "Female"],
    required: [true, "Gender is required"],
  },
  f_Course: {
    type: String,
    enum: ["MCA", "BCA", "BSC"],
    required: [true, "Course is required"],
  },
  f_Image: {
    type: String,
    required: [true, "Picture is required"],
  },
  f_CreateDate: String,
});

const employee = mongoose.model("t_employee", employeeSchema);

module.exports = employee;
