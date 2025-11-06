// 🧩 Firebase integration + NGO fetch with filters
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDjPD3ELSzyF6xbnRYrCU30MBZO78-ozfs",
  authDomain: "login-final-18101.firebaseapp.com",
  databaseURL: "https://login-final-18101-default-rtdb.firebaseio.com",
  projectId: "login-final-18101",
  storageBucket: "login-final-18101.appspot.com",
  messagingSenderId: "355958069407",
  appId: "1:355958069407:web:7f1d794071d7c846b4aaaa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Container for NGO cards
const ngoList = document.getElementById("ngo-list");

// 🔹 Load all NGOs dynamically
async function loadNGOs() {
  const ngosRef = collection(db, "ngos");
  const ngoSnapshot = await getDocs(ngosRef);
  ngoList.innerHTML = "";

  ngoSnapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const needsList = Array.isArray(data.needs) ? data.needs.join(", ") : (data.needs || "Not specified");
    const imageUrl = (Array.isArray(data.images) && data.images.length > 0)
      ? data.images[0]
      : "photos/ngo-placeholder.jpg"; // fallback placeholder

    // Create NGO card
    const card = document.createElement("div");
    card.className = "ngo-card";
    card.dataset.type = data.type || "";
    card.dataset.needs = needsList;
    card.dataset.address = data.address || "";
    card.dataset.urgency = data.urgency || ""; // optional, if you store it in Firebase

    card.innerHTML = `
      <img src="${imageUrl}" alt="${data.name}" class="ngo-image">
      <div class="ngo-details">
        <h3>${data.name || "Unnamed NGO"}</h3>
        <p><strong>Type:</strong> ${data.type || "N/A"}</p>
        <p><strong>Location:</strong> ${data.address || "N/A"}</p>
        <p><strong>Established:</strong> ${data.establishedYear || "N/A"}</p>
        <p><strong>Needs:</strong> ${needsList}</p>
        <p><strong>Description:</strong> ${data.description || "No description available."}</p>
        <button class="donate-now-btn"
          data-id="${data.uid}"
          data-name="${data.name}"
          data-type="${data.type || ''}"
          data-address="${data.address || ''}"
          data-contact="${data.contact || ''}"
          data-email="${data.email || ''}"
          data-description="${data.description || ''}"
          data-needs="${needsList}"
          data-image="${imageUrl}"
        >
          Donate Now
        </button>
      </div>
    `;
    ngoList.appendChild(card);
  });

  attachDonateButtons();
}

// 🔹 Attach Donate button click events
function attachDonateButtons() {
  const donateButtons = document.querySelectorAll(".donate-now-btn");
  donateButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const ngoData = {
        uid: btn.dataset.id,
        name: btn.dataset.name,
        type: btn.dataset.type,
        address: btn.dataset.address,
        contact: btn.dataset.contact,
        email: btn.dataset.email,
        description: btn.dataset.description,
        needs: btn.dataset.needs.split(",").map(n => n.trim()),
        image: btn.dataset.image
      };
      // Save selected NGO for next page
      localStorage.setItem("selectedNGO", JSON.stringify(ngoData));
      // Redirect to your existing NGO description / form page
      window.location.href = "ngo-description.html";
    });
  });
}

// 🔹 Filter Function
function applyFilters() {
  const orgTypeFilters = Array.from(document.querySelectorAll(".org-type:checked")).map(cb => cb.value);
  const donationTypeFilters = Array.from(document.querySelectorAll(".donation-type:checked")).map(cb => cb.value);
  const locationFilters = Array.from(document.querySelectorAll(".location:checked")).map(cb => cb.value);
  const urgencyFilters = Array.from(document.querySelectorAll(".urgency:checked")).map(cb => cb.value);

  const ngoCards = document.querySelectorAll(".ngo-card");

  ngoCards.forEach(card => {
    const orgType = card.dataset.type || "";
    const donationTypes = card.dataset.needs ? card.dataset.needs.split(",").map(n => n.trim()) : [];
    const location = card.dataset.address || "";
    const urgency = card.dataset.urgency || "";

    let visible = true;

    if (orgTypeFilters.length && !orgTypeFilters.includes(orgType)) visible = false;
    if (donationTypeFilters.length && !donationTypeFilters.some(dt => donationTypes.includes(dt))) visible = false;
    if (locationFilters.length && !locationFilters.includes(location)) visible = false;
    if (urgencyFilters.length && !urgencyFilters.includes(urgency)) visible = false;

    card.style.display = visible ? "block" : "none";
  });
}

// 🔹 Attach filter button
document.getElementById("applyFilters").addEventListener("click", applyFilters);

// Load NGOs when page starts
loadNGOs();
