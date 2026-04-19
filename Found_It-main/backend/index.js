require('dotenv').config();
const express = require("express");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer"); 
const path = require("path"); 

const app = express();
const PORT = 8080;
const JWT_SECRET = "your_college_secret_key_2026"; 

// --- OTP Storage (Temporary) ---
let otpStore = {}; 

// --- Middleware ---
app.use(cors()); 
app.use(express.json()); 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Setup Email Transporter ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

// --- Database Connection ---
mongoose.connect("mongodb://127.0.0.1:27017/found_it")
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "uploads/"); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// --- Models ---
const User = mongoose.model("User", new mongoose.Schema({
    collegeId: { type: String, required: true, unique: true },
    password: { type: String, required: true } 
}));

const Item = mongoose.model("Item", new mongoose.Schema({
    itemName: { type: String, required: true },
    objectType: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['lost', 'found'], required: true },
    contact: { type: String, required: true },
    reportedBy: { type: String, required: true },
    image: { type: String }, 
    createdAt: { type: Date, default: Date.now }
}));

// --- ROUTES ---

// 1. Route: OTP Bhejna (Signup & Forgot Password dono ke liye use ho sakta hai)
app.post('/api/send-otp', async (req, res) => {
    try {
        const email = req.body.email.toLowerCase().trim();
        if (!email) return res.status(400).json({ message: "Email is required" });

        const otp = crypto.randomInt(100000, 999999).toString();
        otpStore[email] = { otp: otp, expires: Date.now() + 600000 };

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your FoundIt OTP",
            html: `<div style="text-align: center;"><h2>Your OTP: <span style="color:blue;">${otp}</span></h2><p>This is valid for 10 minutes.</p></div>`
        };

        await transporter.sendMail(mailOptions);
        console.log(`DEBUG: OTP [${otp}] sent to [${email}]`);
        res.status(200).json({ success: true, message: "OTP sent!" });
    } catch (error) {
        console.error("❌ Email Error:", error.message);
        res.status(500).json({ success: false, message: "Email failed" });
    }
});

// 2. Route: OTP Verify Karna
app.post('/api/verify-otp', (req, res) => {
    const email = req.body.email.toLowerCase().trim();
    const userOtp = req.body.otp.toString().trim();
    const record = otpStore[email];

    if (!record) return res.status(400).json({ success: false, message: "No OTP found. Resend please." });
    if (Date.now() > record.expires) {
        delete otpStore[email];
        return res.status(400).json({ success: false, message: "OTP Expired" });
    }

    if (record.otp === userOtp) {
        delete otpStore[email]; 
        return res.status(200).json({ success: true, message: "Verified!" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
});

// 3. NAYA ROUTE: Forgot Password Reset
app.post('/api/reset-password', async (req, res) => {
    try {
        const { collegeId, newPassword } = req.body;
        
        // Yahan hum direct password update kar rahe hain 
        // kyunki OTP verification frontend se successfully ho chuka hoga
        const user = await User.findOneAndUpdate(
            { collegeId: collegeId }, 
            { password: newPassword },
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Reset failed" });
    }
});

// Signup & Login
app.post("/signup", async (req, res) => {
    try {
        const { collegeId, password } = req.body;
        const existingUser = await User.findOne({ collegeId });
        if (existingUser) return res.status(400).json({ message: "User already exists" });
        const newUser = new User({ collegeId, password });
        await newUser.save();
        res.status(201).json({ message: "Registration successful!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/login", async (req, res) => {
    try {
        const { collegeId, password } = req.body;
        const user = await User.findOne({ collegeId });
        if (!user || user.password !== password) return res.status(401).json({ message: "Invalid credentials" });
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "24h" });
        res.status(200).json({ token, collegeId: user.collegeId });
    } catch (err) { res.status(500).json({ message: "Login error" }); }
});

// Items Routes
app.post("/report", upload.single("image"), async (req, res) => {
    try {
        const itemData = { ...req.body, image: req.file ? `/uploads/${req.file.filename}` : "" };
        const newItem = new Item(itemData);
        await newItem.save();
        res.status(201).json({ message: "Report saved!" });
    } catch (err) { res.status(500).json({ message: "Error saving report" }); }
});

app.get("/items/:type", async (req, res) => {
    try {
        const items = await Item.find({ type: req.params.type }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { res.status(500).json({ message: "Error fetching items" }); }
});

app.delete("/items/:id", async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ message: "Delete error" }); }
});

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));