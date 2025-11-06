import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjPD3ELSzyF6xbnRYrCU30MBZO78-ozfs",
  authDomain: "login-final-18101.firebaseapp.com",
  projectId: "login-final-18101",
  storageBucket: "login-final-18101.appspot.com",
  messagingSenderId: "355958069407",
  appId: "1:355958069407:web:7f1d794071d7c846b4aaaa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ngoList = document.getElementById("ngoList");
const formContainer = document.getElementById("donationFormContainer");
const form = document.getElementById("donationForm");
const closeForm = document.getElementById("closeForm");

let selectedNgoId = null;

// Get event ID from URL
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get("eventId");

// Load participating NGOs
async function loadParticipatingNgos() {
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    ngoList.innerHTML = "<p>Event not found.</p>";
    return;
  }

  const eventData = eventSnap.data();
  const participatingNgos = eventData.participatingNgos || [];

  if (participatingNgos.length === 0) {
    ngoList.innerHTML = "<p>No NGOs have participated in this event yet.</p>";
    return;
  }

  ngoList.innerHTML = "";

  for (const ngoId of participatingNgos) {
    const ngoRef = doc(db, "ngos", ngoId);
    const ngoSnap = await getDoc(ngoRef);
    if (ngoSnap.exists()) {
      const ngo = ngoSnap.data();

      const card = document.createElement("div");
      card.classList.add("ngo-card");
      card.innerHTML = `
        <h3>${ngo.name || "Unnamed NGO"}</h3>
        <p><strong>Type:</strong> ${ngo.type || "N/A"}</p>
        <p><strong>Location:</strong> ${ngo.address || "Unknown"}</p>
        <p><strong>Needs:</strong> ${(ngo.needs || []).join(", ") || "Not specified"}</p>
        <button class="donate-btn" data-id="${ngoId}">Donate Now</button>
      `;
      ngoList.appendChild(card);
    }
  }

  // Add click listeners only once
  ngoList.addEventListener("click", (e) => {
    if (e.target.classList.contains("donate-btn")) {
      selectedNgoId = e.target.dataset.id;
      formContainer.classList.remove("hidden");
    }
  });
}

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectedNgoId) {
    alert("Please select an NGO first!");
    return;
  }

  const submitButton = form.querySelector("button[type='submit']");
  submitButton.disabled = true; // Prevent duplicate submissions

  try {
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);
    const eventName = eventSnap.exists() ? eventSnap.data().Title : "Unknown Event";

    const donation = {
      donorName: document.getElementById("donorName").value,
      email: document.getElementById("donorEmail").value,
      phone: document.getElementById("donorPhone").value, // added phone
      type: document.getElementById("donationType").value,
      message: document.getElementById("donorMessage").value,
      event: eventName,
      specialOccasion: true,
      eventId: eventId,
      date: new Date()
    };

    await addDoc(collection(db, "ngos", selectedNgoId, "event_donations"), donation);

    alert("🎉 Thank you for your donation! The NGO will contact you soon.");
    form.reset();
    formContainer.classList.add("hidden");

  } catch (err) {
    console.error(err);
    alert("❌ Error submitting donation. Please try again.");
  } finally {
    submitButton.disabled = false;
  }
});

// Close form
closeForm.addEventListener("click", () => {
  formContainer.classList.add("hidden");
});

loadParticipatingNgos();
