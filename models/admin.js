const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  f_userName: String,
  f_Pwd: String,
});

const adminLogin = mongoose.model("t_login", adminSchema);

module.exports = adminLogin;
