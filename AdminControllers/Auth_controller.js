const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../Models/Admin");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
const asynHandler = require("../middlewares/errorHandler");
const {
  registerAdminSchema,
  loginAdminSchema,
  updateAdminSchema,
  deleteAdminSchema,
  getAdminbyIdSchema,
  searchAdminSchema,
} = require("../utils/validation");
const { log } = require("winston");

// Generate JWT
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin.id, username: admin.username, userType: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

const registerAdmin = asynHandler(async (req, res) => {
  const { error, value } = registerAdminSchema.validate(req.body);
  if (error) {
    logger.error(error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }
  const { username, password, role } = req.body;
  console.log(req.body);

  if (!role || !username || !password) {
    logger.error("All fields are required");
    return res.status(400).json({ error: "All fields are required" });
  }
  const validateRoles = ["admin", "store"];
  if (!validateRoles.includes(role)) {
    logger.error("Invalid role. Role must be 'admin' or 'store'.");
    return res
      .status(400)
      .json({ error: "Invalid role. Role must be 'admin' or 'store'." });
  }

  const existingAdmin = await Admin.findOne({ where: { username } });

  if (existingAdmin) {
    logger.error("Admin already exists");
    return res.status(400).json({ error: "Admin already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(4);
  const admin = await Admin.create({
    username,
    password: hashedPassword,
    role,
  });

  const token = generateToken(admin);

  res.cookie("token", token, { httpOnly: true });

  req.session.admin = admin;
  logger.error("Admin created successfully");
  res.status(201).json({ message: "Admin created successfully", admin });
});

// Signin Controller
const loginAdmin = asynHandler(async (req, res) => {
  const { error, value } = loginAdminSchema.validate(req.body);
  if (error) {
    logger.error(error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    logger.error('All fields are required')
    return res.status(400).json({ error: "All fields are required" });
  }

  const admin = await Admin.findOne({ where: { username } });

  if (!admin) {
    logger.error("Invalid username or password");
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    logger.error("Invalid username or password");
    return res.status(401).json({ error: "Invalid username or password" });
  }

  if (admin.role !== role) {
    logger.error("Role is not match");
    return res.status(401).json({ error: "Role is not match" });
  }

  const token = generateToken(admin);

  res.cookie("token", token, { httpOnly: true });

  req.session.admin = admin;
  logger.info("Admin signed in successfully");
  res.status(200).json({
    message: "Admin signed in successfully",
    admin,
    token,
    role: admin.role,
  });
});

// Update Admin Controller
const updateAdmin = asynHandler(async (req, res) => {
  const { id } = req.params;
  const { error, value } = updateAdminSchema.validate(req.body);
  if (error) {
    logger.error(error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }
  const { username, password } = value;

  const admin = await Admin.findByPk(id);
  if (!admin) {
    logger.error("Admin not found");
    return res.status(404).json({ error: "Admin not found" });
  }

  admin.username = username;
  admin.password = password;
  // if (password) {
  //   admin.password = await bcrypt.hash(password, 12);
  // }

  await admin.save();
  logger.info("Admin updated successfully", admin);
  res.status(200).json({ message: "Admin updated successfully", admin });
});

const getUserbyToken = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await Admin.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Admin Controller
const deleteAdmin = asynHandler(async (req, res) => {
  const { id } = req.params;
  const { forceDelete } = req.query;

  const { error } = deleteAdminSchema.validate({ id, forceDelete });
  if (error) {
    logger.error(error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }

  const admin = await Admin.findOne({ where: { id }, paranoid: false });
  if (!admin) {
    logger.error("Admin not found");
    return res.status(404).json({ error: "Admin not found" });
  }

  if (admin.deletedAt && forceDelete !== "true") {
    logger.info("Admin is already soft-deleted");
    return res.status(400).json({ error: "Admin is already soft-deleted" });
  }

  if (forceDelete === "true") {
    await admin.destroy({ force: true });
    logger.info("Admin permanently deleted successfully");
    res.status(200).json({ message: "Admin permanently deleted successfully" });
  } else {
    await admin.destroy();
    logger.info("Admin soft-deleted successfully");
    res.status(200).json({ message: "Admin soft-deleted successfully" });
  }
});

// Get All Admins Controller
const getAllAdmins = asynHandler(async (req, res) => {
  const adminCount = await Admin.count();
  const admins = await Admin.findAll();
  logger.info("all admins get sucessfully!");
  res.status(200).json({ admins, count: adminCount });
});

// Get Single Admin by ID Controller
const getAdminById = asynHandler(async (req, res) => {
  const { error } = getAdminbyIdSchema.validate(req.params);
  if (error) {
    logger.error(error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }
  const { id } = req.params;
  const singleAdmin = await Admin.findByPk(id);

  if (!singleAdmin) {
    logger.error("Admin not found");
    return res.status(404).json({ error: "Admin not found" });
  }

  logger.info("singleAdmin");
  res.status(200).json(singleAdmin);
});

// Logout Controller
const logoutAdmin = (req, res) => {
  const username = req.session.admin ? req.session.admin.username : "Admin";
  res.clearCookie("token");
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.status(200).json({ message: `${username} logged out successfully` });
  });
};

const searchAdmins = asynHandler(async (req, res) => {
  const { error } = searchAdminSchema.validate(req.query);
  if (error) {
    logger.error(error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }

  const { id, username, userType } = req.query;
  const whereClause = {};

  if (id) whereClause.id = id;
  if (username && username.trim()) {
    whereClause.username = { [Op.like]: `%${username}%` };
  }
  if (userType && userType.trim()) {
    whereClause.userType = { [Op.like]: `%${userType}%` };
  }

  console.log("Generated whereClause:", whereClause);

  const admins = await Admin.findAll({ where: whereClause });

  if (admins.length === 0) {
    logger.error("No matching admins found");
    return res.status(404).json({ error: "No matching admins found" });
  }
  logger.info("sucessfully get!");
  res.status(200).json(admins);
});

module.exports = {
  registerAdmin,
  loginAdmin,
  updateAdmin,
  deleteAdmin,
  getAllAdmins,
  getAdminById,
  logoutAdmin,
  getUserbyToken,
  searchAdmins,
};
