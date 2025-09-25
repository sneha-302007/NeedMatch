import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDjPD3ELSzyF6xbnRYrCU30MBZO78-ozfs",
    authDomain: "login-final-18101.firebaseapp.com",
    databaseURL: "https://login-final-18101-default-rtdb.firebaseio.com",
    projectId: "login-final-18101",
    storageBucket: "login-final-18101.appspot.com",
    messagingSenderId: "355958069407",
    appId: "1:355958069407:web:7f1d794071d7c846b4aaaa"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const ngoName = document.getElementById("ngoName");
const year = document.getElementById("year");
const contact = document.getElementById("contact");
const requirements = document.getElementById("requirements");
const description = document.getElementById("description");
const additional = document.getElementById("additional");
const media = document.getElementById("media");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, async(user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {
        const ngoRef = doc(db, "ngos", user.uid);
        const docSnap = await getDoc(ngoRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            ngoName.textContent = data.name || "N/A";
            year.textContent = data.year || "N/A";
            contact.textContent = data.phone || "N/A";
            requirements.textContent = data.requirements || "N/A";
            description.textContent = data.description || "N/A";
            additional.textContent = data.additionalInfo || "N/A";
            if (data.mediaUrl) {
                media.src = data.mediaUrl;
            }
        } else {
            alert("No profile found. Please set it up.");
            window.location.href = "ngoprofile.html";
        }
    } catch (error) {
        console.error("Error loading profile:", error);
        alert("Failed to load profile.");
    }
});
const isEditMode = new URLSearchParams(window.location.search).get("edit") === "true";
if (isEditMode) {
    document.querySelector(".form-heading").textContent = "Edit Your NGO Profile";
    form.querySelector("button").textContent = "Update Profile";
}
if (data.mediaUrl) {
    media.src = data.mediaUrl;
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        });
    });
}