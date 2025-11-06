import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

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

const eventList = document.getElementById("eventList");

async function loadEvents() {
  const snapshot = await getDocs(collection(db, "events"));
  eventList.innerHTML = "";

  snapshot.forEach(docSnap => {
    const event = docSnap.data();
    const date = event.Date?.toDate ? event.Date.toDate().toDateString() : event.Date || "Date not available";

    const card = document.createElement("div");
    card.classList.add("event-card");

    card.innerHTML = `
      <img src="${event.image || 'photos/default-event.jpg'}" alt="${event.Title}">
      <div class="event-details">
        <h3>${event.Title}</h3>
        <p><strong>Date:</strong> ${date}</p>
        <p>${event.Description || ""}</p>
        <button class="view-btn" data-id="${docSnap.id}">View Participating NGOs</button>
      </div>
    `;

    eventList.appendChild(card);
  });

  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      window.location.href = `participated-ngo.html?eventId=${btn.dataset.id}`;
    });
  });
}

loadEvents();
