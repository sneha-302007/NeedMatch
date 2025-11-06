import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDjPD3ELSzyF6xbnRYrCU30MBZO78-ozfs",
  authDomain: "login-final-18101.firebaseapp.com",
  projectId: "login-final-18101",
  storageBucket: "login-final-18101.firebasestorage.app",
  messagingSenderId: "355958069407",
  appId: "1:355958069407:web:7f1d794071d7c846b4aaaa"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const messageBox = document.getElementById("login-message");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const resetPasswordLink = document.querySelector(".reset-password");

  // 👁️ Show/Hide Password
  if (togglePassword) {
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;
      togglePassword.textContent = type === "password" ? "👁️" : "🙈";
    });
  }

  // 🔹 Handle Login
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = passwordInput.value;

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log("Logged in as:", user.uid);

          // ✅ Save NGO UID for dashboard use
          localStorage.setItem("loggedInNGO", user.uid);

          // ✅ Show success and redirect
          messageBox.style.color = "green";
          messageBox.textContent = "Login successful! Redirecting...";

          setTimeout(() => {
            window.location.href = "ngo-dashboard.html"; // Redirect
          }, 1000);
        })
        .catch((error) => {
          messageBox.style.color = "red";
          messageBox.textContent = "Login failed: " + error.message;
          console.error("Login error:", error.message);
        });
    });
  }

  // 🔹 Forgot Password
  if (resetPasswordLink) {
    resetPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      const email = prompt("Enter your registered email to reset your password:");

      if (email) {
        sendPasswordResetEmail(auth, email)
          .then(() => alert("✅ Password reset link sent! Check your email."))
          .catch((error) => alert("❌ Error: " + error.message));
      } else {
        alert("⚠️ Please enter your email address.");
      }
    });
  }
});
