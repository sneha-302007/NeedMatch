import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

// Firebase Config
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
const storage = getStorage(app);

// DOM Elements
const form = document.getElementById("ngoProfileForm");
const ngoName = document.getElementById("ngoName");
const type = document.getElementById("ngoType");
const establishedYear = document.getElementById("establishedYear");
const contact = document.getElementById("contact");
const requirements = document.getElementById("requirements");
const description = document.getElementById("description");
const mediaUpload = document.getElementById("mediaUpload");
const additionalInfo = document.getElementById("additionalInfo");

// Auth Check & Prefill
onAuthStateChanged(auth, async(user) => {
    if (user) {
        const ngoRef = doc(db, "ngos", user.uid);
        const docSnap = await getDoc(ngoRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            ngoName.value = data.name || "";
            type.value = data.type || "";
            establishedYear.value = data.year || "";
            contact.value = data.phone || "";
            requirements.value = data.requirements || "";
            description.value = data.description || "";
            additionalInfo.value = data.additionalInfo || "";
        }
    } else {
        window.location.href = "login.html";
    }
});

// Save Profile
form.addEventListener("submit", async(e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert("User not authenticated");
        return;
    }

    const ngoData = {
        name: ngoName.value,
        type: type.value,
        year: establishedYear.value,
        phone: contact.value,
        requirements: requirements.value,
        description: description.value,
        additionalInfo: additionalInfo.value,
        timestamp: new Date()
    };

    try {
        // Skip media upload for now
        ngoData.mediaUrl = ""; // or a placeholder image URL


        await setDoc(doc(db, "ngos", user.uid), ngoData);
        alert("Profile saved successfully!");
        window.location.href = "ngo-dashboard.html";

    } catch (error) {
        console.error("Error saving profile:", error);
        alert("Failed to save profile.");
    }
});