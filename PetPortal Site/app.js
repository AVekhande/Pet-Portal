const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");
const User = require("./models/user");
const MissingPet = require("./models/missing");
const Adoption = require("./models/adoption");
const cors = require('cors');
const Admin = require("./models/admin");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const botName = "Community Bot";

mongoose.connect("mongodb://localhost:27017/petportal", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true
}));

app.use(cors({
    origin: "http://127.0.0.1:3000",
    methods: ["GET", "POST"],
    credentials: true
}));

const io = require("socket.io")(server, {
    cors: {
        origin: "http://127.0.0.1:3000",
        methods: ["GET", "POST"]
    }
});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/profile", (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Not logged in" });
    }

    res.json({
        username: req.session.user.username,
        email: req.session.user.email
    });
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "Login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "registration.html"));
});

app.get("/admin/login", (req, res ) => {
    res.sendFile(path.join(__dirname, "public", "html", "admin-login.html"));
})

app.get("/reports2", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "reports2.html"));
});

app.get("/admin/dashboard", (req, res) => {
    if (req.session.admin) {
        res.sendFile(path.join(__dirname, "public", "html", "admin-dashboard.html"));
    } else {
        res.redirect("/admin/login");
    }
});

app.get('/admin/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMissingPets = await MissingPet.countDocuments();
        const totalAdoptionReports = await Adoption.countDocuments();

        res.json({
            totalUsers,
            totalMissingPets,
            totalAdoptionReports
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats', error: err });
    }
});

app.get('/admin/missing-pets', async (req, res) => {
    try {
        const missingPets = await MissingPet.find();
        res.json(missingPets);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching missing pets', error: err });
    }
});

app.get('/admin/adoption-reports', async (req, res) => {
    try {
        const adoptionReports = await Adoption.find();
        res.json(adoptionReports);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching adoption reports', error: err });
    }
});

// Endpoint to delete a missing pet report
app.delete('/admin/missing-pets/:id', async (req, res) => {
    try {
        const pet = await MissingPet.findByIdAndDelete(req.params.id);
        if (!pet) {
            return res.status(404).json({ message: 'Pet report not found' });
        }
        res.json({ message: 'Missing pet report deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting missing pet', error: err });
    }
});

app.delete('/admin/adoption-reports/:id', async (req, res) => {
    try {
        const report = await Adoption.findByIdAndDelete(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Adoption report not found' });
        }
        res.json({ message: 'Adoption report deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting adoption report', error: err });
    }
});

app.put('/admin/missing-pets/:id', async (req, res) => {
    try {
        const updatedPet = await MissingPet.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPet) {
            return res.status(404).json({ message: 'Missing pet report not found' });
        }
        res.json(updatedPet);
    } catch (err) {
        res.status(500).json({ message: 'Error updating missing pet', error: err });
    }
});

app.put('/admin/adoption-reports/:id', async (req, res) => {
    try {
        const updatedReport = await Adoption.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedReport) {
            return res.status(404).json({ message: 'Adoption report not found' });
        }
        res.json(updatedReport);
    } catch (err) {
        res.status(500).json({ message: 'Error updating adoption report', error: err });
    }
});

app.post("/register", async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        user = new User({ username, email, password });
        await user.save();
        res.redirect("/login");
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("Login Attempt - Email:", email);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("Login Failed: User not found");
            return res.status(400).json({ message: "Invalid email or password" });
        }

        console.log("Stored Hashed Password:", user.password);

        const isMatch = await user.comparePassword(password);
        console.log("Password Match Result:", isMatch);

        if (!isMatch) {
            console.log("Login Failed: Password does not match");
            return res.status(400).json({ message: "Invalid email or password" });
        }

        req.session.user = user;
        // res.status(200).json({ message: "Login successful", user });
        res.redirect("/");
    } catch (err) {
        console.error("Server error during login:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/admin/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("Login Attempt - Email:", email);

    try {
        const admin = await Admin.findOne({ email });  

        if (!admin) {
            console.log("Login Failed: Admin not found");
            return res.status(400).json({ message: "Invalid email or password" });
        }

        console.log("Stored Hashed Password:", admin.password);

        const isMatch = await admin.comparePassword(password);
        console.log("Password Match Result:", isMatch);

        if (!isMatch) {
            console.log("Login Failed: Password does not match");
            return res.status(400).json({ message: "Invalid email or password" });
        }
        req.session.admin = admin;  

        res.redirect("/admin/dashboard");
    } catch (err) {
        console.error("Server error during login:", err);
        res.status(500).json({ message: "Server error" });
    }
});


// Forgot Password Route
app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User with this email does not exist" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "your-email@gmail.com",
                pass: "your-email-password"
            }
        });

        const mailOptions = {
            to: user.email,
            from: "your-email@gmail.com",
            subject: "Password Reset Request",
            text: `You are receiving this email because you requested a password reset. Click the link to reset your password: http://localhost:3000/reset-password/${resetToken}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Password reset email sent" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    try {
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful. You can now log in." });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


app.get("/check-user", (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Not logged in" });
    }

    res.json({
        message: "User is logged in",
        username: req.session.user.username,
        email: req.session.user.email
    });
});

// Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ message: "Something went wrong on the server!" });
// });

// Missing Pet Report Routes

// Configure Multer for File Uploads (Images)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPG, PNG, or WEBP image files are allowed!"), false);
        }
        cb(null, true);
    }
});

app.post("/submit-report", upload.array("photos", 5), async (req, res) => {
    try {
        const { name, email, phone, petType, breed, specialMark, lastSeen, location } = req.body;

        const lastSeenDate = new Date(lastSeen);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(lastSeenDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        if (lastSeenDate > today) {
            return res.status(400).json({ message: "Last seen date cannot be in the future" });
        }

        const photoUrls = req.files.map(file => `/uploads/${file.filename}`);
        const reportId = uuidv4();

        const newReport = new MissingPet({
            reportId,
            name,
            email,
            phone,
            petType,
            breed,
            specialMark,
            lastSeen: lastSeenDate,
            location,
            photoUrls
        });

        await newReport.save();
        res.redirect("/reports2");
    } catch (error) {
        console.error("Error submitting report:", error);
        res.status(500).json({ message: "Server error while submitting report" });
    }
});

// API to Get All Missing Pet Reports with Pagination
app.get("/reports", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const reports = await MissingPet.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalReports = await MissingPet.countDocuments();
        res.json({
            reports,
            totalPages: Math.ceil(totalReports / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: "Server error while fetching reports" });
    }
});

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// API to Submit an Adoption Listing
app.post("/submit-adopt", upload.array("photos", 5), async (req, res) => {
    try {
        const { name, email, phone, petName, petType, age, breed, description } = req.body;

        const photoUrls = req.files.map(file => `/uploads/${file.filename}`);
        const adoptionId = uuidv4();

        const newAdoption = new Adoption({
            adoptionId,
            name,
            email,
            phone,
            petName,
            petType,
            age,
            breed,
            description,
            photoUrls
        });

        await newAdoption.save();
        res.redirect("/html/adopt-view.html");
    } catch (error) {
        console.error("Error submitting adoption listing:", error);
        res.status(500).json({ message: "Server error while submitting adoption listing" });
    }
});

// API to Get All Adoption Listings
app.get("/adoptions", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const adoptions = await Adoption.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalAdoptions = await Adoption.countDocuments();
        res.json({
            adoptions,
            totalPages: Math.ceil(totalAdoptions / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        console.error("Error fetching adoption listings:", error);
        res.status(500).json({ message: "Server error while fetching adoption listings" });
    }
});

// Chat Application
io.on('connection', (socket) => {
    console.log('New WS connection...');

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        socket.emit('message', formatMessage(botName, 'Welcome to Pet Portal Community !!!'));


        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));


        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });

    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});