// public/main.js
document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login-section");
  const contentSection = document.getElementById("content-section");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const welcomeMsg = document.getElementById("welcome-msg");
  const logoutBtn = document.getElementById("logout-btn");
  const userNameDisplay = document.getElementById("user-name");

  // Handle Login Submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Hide login and show content on successful login
          loginSection.style.display = "none";
          contentSection.style.display = "block";
          welcomeMsg.textContent = `Hello, ${username}!`;
          userNameDisplay.textContent = username;
          logoutBtn.style.display = "inline-block";
        } else {
          loginError.textContent = data.message;
        }
      });
  });

  // Handle Logout
  logoutBtn.addEventListener("click", () => {
    fetch("/logout")
      .then(() => window.location.reload());
  });

  // Mark Lesson as Completed
  const completeLessonBtn = document.getElementById("complete-lesson-btn");
  completeLessonBtn.addEventListener("click", () => {
    fetch("/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: "lesson1" })
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Lesson marked as completed!");
      });
  });

  // Handle Quiz Submission
  const quizForm = document.getElementById("quiz-form");
  quizForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // Check the quiz answer
    const selected = document.querySelector('input[name="q1"]:checked');
    // Correct answer: "Learning Management System"
    let score = selected && selected.value === "Learning Management System" ? 1 : 0;
    fetch("/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId: "quiz1", quizScore: score })
    })
      .then((res) => res.json())
      .then(() => {
        const quizResult = document.getElementById("quiz-result");
        quizResult.textContent = score === 1 ? "Correct answer!" : "Wrong answer. Try again!";
      });
  });

  // Load and display user progress
  document.getElementById("load-progress").addEventListener("click", () => {
    fetch("/progress")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const progressDisplay = document.getElementById("progress-display");
          const { lessons, quizzes } = data.progress;
          progressDisplay.innerHTML = `
            <p>Completed Lessons: ${lessons.length ? lessons.join(", ") : "None"}</p>
            <p>Quiz Scores: ${
              Object.keys(quizzes).length ? JSON.stringify(quizzes) : "None"
            }</p>
          `;
        } else {
          alert("You must be logged in to view progress.");
        }
      });
  });
});
