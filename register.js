import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyDjPD3ELSzyF6xbnRYrCU30MBZO78-ozfs",
    authDomain: "login-final-18101.firebaseapp.com",
    databaseURL: "https://login-final-18101-default-rtdb.firebaseio.com",
    projectId: "login-final-18101",
    storageBucket: "login-final-18101.firebasestorage.app",
    messagingSenderId: "355958069407",
    appId: "1:355958069407:web:7f1d794071d7c846b4aaaa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Event listener
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signup-form");

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmpassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                alert("Signup successful!");
                console.log("User:", user);
            })
            .catch((error) => {
                console.error("Signup Error:", error.message);
                alert("Signup failed: " + error.message);
            });
    });
});