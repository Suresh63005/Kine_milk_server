const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../Models/Admin");
const { Op } = require("sequelize");

// Generate JWT
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin.id, username: admin.username, userType: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};


const registerAdmin = async (req, res) => {
  const { username, password, role } = req.body;
  console.log(req.body);

  if (!role || !username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const existingAdmin = await Admin.findOne({ where: { username } });

    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(4)
    const admin = await Admin.create({
      username,
      password:hashedPassword,
      role,
    });

    const token = generateToken(admin);

    res.cookie("token", token, { httpOnly: true });

    req.session.admin = admin;

    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Signin Controller
const loginAdmin = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const admin = await Admin.findOne({ where: { username } });

    if (!admin) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    if (admin.role !== role) {
      return res.status(401).json({ error: "Role is not match" });
    }

    const token = generateToken(admin);

    res.cookie("token", token, { httpOnly: true });

    req.session.admin = admin;

    res.status(200).json({ message: "Admin signed in successfully", admin, token, role: admin.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Admin Controller
const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  try {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    admin.username = username;
    admin.password = password;
    // if (password) {
    //   admin.password = await bcrypt.hash(password, 12);
    // }

    await admin.save();
    res.status(200).json({ message: "Admin updated successfully", admin });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

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
const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  const { forceDelete } = req.query;

  try {
    const admin = await Admin.findOne({ where: { id }, paranoid: false });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    if (admin.deletedAt && forceDelete !== "true") {
      return res.status(400).json({ error: "Admin is already soft-deleted" });
    }

    if (forceDelete === "true") {
      await admin.destroy({ force: true });
      res
        .status(200)
        .json({ message: "Admin permanently deleted successfully" });
    } else {
      await admin.destroy();
      res.status(200).json({ message: "Admin soft-deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get All Admins Controller
const getAllAdmins = async (req, res) => {
  try {
    const adminCount = await Admin.count();
    const admins = await Admin.findAll();
    res.status(200).json({ admins, count: adminCount });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Single Admin by ID Controller
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const singleAdmin = await Admin.findByPk(id);

    if (!singleAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json(singleAdmin);
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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

const searchAdmins = async (req, res) => {
  const { id, username, userType } = req.query;

  try {
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
      return res.status(404).json({ error: "No matching admins found" });
    }

    res.status(200).json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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
