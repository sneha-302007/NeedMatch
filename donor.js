// 🧩 Firebase integration + NGO fetch
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

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
const db = getFirestore(app);

// Fetch and display NGO data
async function loadNGOs() {
    const ngosRef = collection(db, "ngos");
    const ngoSnapshot = await getDocs(ngosRef);
    const ngoList = document.getElementById("ngo-list");

    ngoSnapshot.forEach((doc) => {
        const data = doc.data();
        const card = document.createElement("div");
        card.className = "ngo-card";
        card.innerHTML = `
            <h3>${data.name}</h3>
            <p><strong>Phone:</strong> ${data.phone}</p>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Additional Info:</strong> ${data.additionalInfo}</p>
            <p><strong>Requirements:</strong> ${data.requirements}</p>
            <p><strong>Established:</strong> ${data.year}</p>
            <button class="donate-btn">Donate Now</button>
        `;
        ngoList.appendChild(card);
    });
}

loadNGOs();