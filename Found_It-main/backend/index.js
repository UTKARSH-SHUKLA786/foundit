require('dotenv').config();
const express = require("express");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer"); 
const path = require("path"); 
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080;
const JWT_SECRET = process.env.JWT_SECRET || "your_college_secret_key_2026"; 

// --- OTP Storage ---
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

// --- User Model ---
const userSchema = new mongoose.Schema({
    collegeId: { type: String, required: true, unique: true },
    email: { type: String }, 
    password: { type: String, required: true } 
});

// Fixed: Hashing middleware without "next" conflict
userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw new Error("Hashing failed");
    }
});

const User = mongoose.model("User", userSchema);

// --- Item Model ---
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

// 1. Send OTP
app.post('/api/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if(!email) return res.status(400).json({ success: false, message: "Email required" });

        const formattedEmail = email.toLowerCase().trim();
        const otp = crypto.randomInt(100000, 999999).toString();
        otpStore[formattedEmail] = { otp, expires: Date.now() + 600000 };

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: formattedEmail,
            subject: "Your FoundIt OTP",
            html: `<h2>Your OTP: <span style="color:blue;">${otp}</span></h2>`
        });
        res.status(200).json({ success: true, message: "OTP sent!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Email failed" });
    }
});

// 2. Verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const formattedEmail = email?.toLowerCase().trim();
    const record = otpStore[formattedEmail];

    if (record && record.otp === otp && Date.now() < record.expires) {
        return res.status(200).json({ success: true, message: "Verified!" });
    }
    res.status(400).json({ success: false, message: "Invalid or Expired OTP" });
});

// 3. Reset Password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { collegeId, newPassword } = req.body;
        if(!collegeId || !newPassword) return res.status(400).json({ message: "Fields missing" });
        
        const user = await User.findOne({ collegeId });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.password = newPassword; 
        await user.save(); // Trigger hashing middleware

        res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Reset failed" });
    }
});

// 4. Signup
app.post("/signup", async (req, res) => {
    try {
        const { collegeId, password, email } = req.body;
        const existingUser = await User.findOne({ collegeId });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const newUser = new User({ collegeId, password, email });
        await newUser.save();
        res.status(201).json({ message: "Registration successful!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 5. Login
app.post("/login", async (req, res) => {
    try {
        const { collegeId, password } = req.body;
        const user = await User.findOne({ collegeId });

        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "24h" });
        res.status(200).json({ token, collegeId: user.collegeId });
    } catch (err) { res.status(500).json({ message: "Login error" }); }
});

// --- Items & Uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "uploads/"); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

app.post("/report", upload.single("image"), async (req, res) => {
    try {
        const itemData = { ...req.body, image: req.file ? `/uploads/${req.file.filename}` : "" };
        const newItem = new Item(itemData);
        await newItem.save();
        res.status(201).json({ message: "Report saved!" });
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.get("/items/:type", async (req, res) => {
    try {
        const items = await Item.find({ type: req.params.type }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { res.status(500).json({ message: "Error" }); }
});

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));