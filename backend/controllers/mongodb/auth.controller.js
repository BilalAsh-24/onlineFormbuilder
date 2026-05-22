import User from "../../models/mongodb/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate all fields
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // Validate name length
    if (name.trim().length < 2)
      return res.status(400).json({ message: "Name must be at least 2 characters" });

    // Validate email format
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email format" });

    // Validate password length
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("REGISTER ERROR (MONGO):", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Invalid email or password" });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // Generate token
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    // Return token and user info
    res.json({
      token,
      user: {
        user_id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR (MONGO):", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    // req.userId is set by verifyToken middleware
    const user = await User.findById(req.userId).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({
      user_id: user._id.toString(),
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error("GET PROFILE ERROR (MONGO):", err);
    res.status(500).json({ message: "Server error" });
  }
};
