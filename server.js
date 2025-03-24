// server.js
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON/form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup express-session for user authentication
app.use(
  session({
    secret: "superSecretKey", // Use a secure key in production
    resave: false,
    saveUninitialized: true
  })
);

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// ----- Dummy User Data and In-Memory Progress Store ----- //
const users = [
  { username: "student", password: "password" }
];
// Stores progress keyed by username
const userProgress = {};

// ----- Routes ----- //

// User login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    req.session.user = { username: user.username };
    // Initialize progress if not created
    if (!userProgress[user.username]) {
      userProgress[user.username] = { lessons: [], quizzes: {} };
    }
    return res.json({ success: true });
  }
  return res.json({ success: false, message: "Invalid credentials" });
});

// User logout route
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Get user progress route
app.get("/progress", (req, res) => {
  if (req.session.user) {
    const progress = userProgress[req.session.user.username];
    return res.json({ success: true, progress });
  }
  return res.status(401).json({ success: false, message: "Not authenticated" });
});

// Update progress route (for lesson completion and quiz scores)
app.post("/progress", (req, res) => {
  if (req.session.user) {
    const { lessonId, quizId, quizScore } = req.body;
    const username = req.session.user.username;
    if (lessonId) {
      // Mark lesson as completed if not already done
      if (!userProgress[username].lessons.includes(lessonId)) {
        userProgress[username].lessons.push(lessonId);
      }
    }
    if (quizId && quizScore !== undefined) {
      userProgress[username].quizzes[quizId] = quizScore;
    }
    return res.json({ success: true, progress: userProgress[username] });
  }
  return res.status(401).json({ success: false, message: "Not authenticated" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
