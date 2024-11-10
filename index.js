const express = require("express");
const app = express();
const cors = require("cors");
const Joi = require("joi");
const mongoose = require("mongoose");

app.use(cors());

const adminLogin = require("./models/admin.js");
const employee = require("./models/employee.js");

// To parse form data in POST request body
app.use(express.urlencoded({ extended: true }));

// To parse incoming JSON in POST request body
app.use(express.json());

const connectDB = require("./db.js");
connectDB();

const loginSchemaValidation = Joi.object({
  f_userName: Joi.string().min(3).max(30).required(),
  f_Pwd: Joi.string().min(6).required(),
});

const employeeSchemaValidation = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.base": "Name should be a string.",
    "string.empty": "Name cannot be empty.",
    "string.min": "Name should be at least 3 characters.",
    "string.max": "Name should not exceed 30 characters.",
    "any.required": "Name is required.",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Email cannot be empty.",
      "string.email": "Please enter a valid email address.",
      "any.required": "Email is required.",
    }),
  mobileNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.empty": "Mobile No cannot be empty.",
      "string.pattern.base": "Mobile number must be a 10-digit number.",
      "any.required": "Mobile number is required.",
    }),
  designation: Joi.string().required().messages({
    "string.empty": "Enter a valid Designation",
    "any.required": "Designation is required.",
  }),
  gender: Joi.string().valid("Male", "Female").required().messages({
    "any.only": "Gender must be either 'Male' or 'Female'.",
    "any.required": "Gender is required.",
  }),
  course: Joi.string().valid("MCA", "BCA", "BSC").required().messages({
    "any.only": "Course must be either 'MCA', 'BCA', or 'BSC'.",
    "any.required": "Course is required.",
  }),
  pic: Joi.string().uri().required().messages({
    "string.empty": "Upload the Image",
    "string.uri": "Please provide a valid URL for the picture.",
    "any.required": "Picture is required.",
  }),
  createDate: Joi.string().required(),
});

app.post("/", async (req, res) => {
  const { error } = loginSchemaValidation.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ message: "Invalid input", details: error.details });
  }

  const { f_userName, f_Pwd } = req.body;

  try {
    const admin = await adminLogin.findOne({ f_userName, f_Pwd });

    if (admin) {
      res.status(200).json({ message: "Login successful", admin });
    } else {
      res.status(401).json({ message: "Incorrect username or password" });
    }
  } catch (err) {
    console.error("Error in login process:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/createemployee", async (req, res) => {
  try {
    const { error } = employeeSchemaValidation.validate(req.body);

    if (error) {
      console.log(error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingUser = await employee.findOne({ f_Email: req.body["email"] });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const emp = new employee({
      f_Name: req.body["name"],
      f_Email: req.body["email"],
      f_MobileNo: req.body["mobileNo"],
      f_Designation: req.body["designation"],
      f_Gender: req.body["gender"],
      f_Course: req.body["course"],
      f_Image: req.body["pic"],
      f_CreateDate: req.body["createDate"],
    });

    await emp.save();

    res
      .status(200)
      .json({ message: "Form submitted successfully", data: req.body });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.get("/employeelist", async (req, res) => {
  try {
    const list = await employee.find({});
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.delete("/deleteemployee", async (req, res) => {
  try {
    const { _id } = req.body;

    const deletedEmployee = await employee.findByIdAndDelete(_id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
});

app.get("/:id/edit", async (req, res) => {
  try {
    const { id } = req.params;
    const employeeData = await employee.findById(id);

    if (!employeeData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(employeeData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.put("/employeeedit/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    const { error } = employeeSchemaValidation.validate(req.body);
    if (error) {
      console.log("Validation error:", error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check for existing email, excluding the current employee's ID
    const existingUser = await employee.findOne({
      f_Email: req.body["email"],
      _id: { $ne: new mongoose.Types.ObjectId(id) },
    });

    if (existingUser) {
      console.log("Email already exists");
      return res.status(400).json({ message: "Email already exists" });
    }

    const updatedEmployee = await employee.findByIdAndUpdate(
      id,
      {
        f_Name: req.body["name"],
        f_Email: req.body["email"],
        f_MobileNo: req.body["mobileNo"],
        f_Designation: req.body["designation"],
        f_Gender: req.body["gender"],
        f_Course: req.body["course"],
        f_Image: req.body["pic"],
        f_CreateDate: req.body["createDate"],
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedEmployee) {
      console.log("Employee not found");
      return res.status(404).json({ message: "Employee not found" });
    }

    res
      .status(200)
      .json({ message: "Form submitted successfully", data: updatedEmployee });
  } catch (err) {
    console.log("Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.listen(3000, () => {
  console.log("App is running!");
});
